const router = require('express').Router();
const {rateLimit} = require('express-rate-limit');
const {ObjectId} = require('mongodb');
const {getDb} = require('../MongoClient');
const {moderate} = require('./moderation');
const {issueToken, checkToken, consumeToken, visitorId, requireOwnUI} = require('./guard');
const {logActivity} = require('../security');
const {requireFeature} = require('../toggles');

const COLLECTION = 'guestbook_entries';
const PAGE_SIZE = 20;
// Circuit breaker: if someone rotates through many IPs, cap total new entries per day.
const DAILY_CAP = Number(process.env.GUESTBOOK_DAILY_CAP) || 100;

const limiter = (limit, windowMs) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: {error: 'Too many requests. Please try again later.'},
        handler: (req, res, next, options) => {
            logActivity('blocked', `rate limit: ${req.method} ${req.originalUrl}`, visitorId(req.ip));
            res.status(options.statusCode).json(options.message);
        },
    });

router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});
router.use(requireOwnUI);
router.use(requireFeature('guestbook'));

let indexesReady = null;
async function collection(res) {
    let db;
    try {
        db = await getDb();
    } catch (err) {
        console.error('[guestbook] database connection failed:', err.message);
    }
    if (!db) {
        res.status(503).json({error: 'Guestbook is unavailable right now.'});
        return null;
    }
    const col = db.collection(COLLECTION);
    if (!indexesReady) {
        indexesReady = Promise.all([
            col.createIndex({visitor: 1}, {unique: true, name: 'one_entry_per_visitor'}),
            col.createIndex({createdAt: -1}, {name: 'by_created'}),
        ]).catch((err) => {
            indexesReady = null;
            console.error('[guestbook] index creation failed:', err.message);
        });
    }
    await indexesReady;
    return col;
}

const toPublic = (doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    message: doc.message,
    createdAt: doc.createdAt,
});

/** GET /api/guestbook?before=<id> — newest visible entries. */
router.get('/', limiter(60, 60 * 1000), async (req, res) => {
    const col = await collection(res);
    if (!col) return;

    const filter = {hidden: {$ne: true}};
    const {before} = req.query;
    if (typeof before === 'string' && ObjectId.isValid(before)) {
        filter._id = {$lt: new ObjectId(before)};
    }

    const docs = await col
        .find(filter, {projection: {name: 1, message: 1, createdAt: 1}})
        .sort({_id: -1})
        .limit(PAGE_SIZE + 1)
        .toArray();

    res.json({
        entries: docs.slice(0, PAGE_SIZE).map(toPublic),
        hasMore: docs.length > PAGE_SIZE,
    });
});

/** GET /api/guestbook/session — form token + whether this visitor already signed. */
router.get('/session', limiter(60, 15 * 60 * 1000), async (req, res) => {
    const col = await collection(res);
    if (!col) return;

    const existing = await col.findOne({visitor: visitorId(req.ip)}, {projection: {_id: 1}});
    if (existing) return res.json({alreadySigned: true});
    res.json({alreadySigned: false, token: issueToken(req)});
});

/** POST /api/guestbook — {name, message, token, website(honeypot)} */
router.post('/', limiter(5, 60 * 60 * 1000), async (req, res) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};

    // Honeypot: hidden in the UI, bots fill every field.
    if (body.website) {
        console.warn('[guestbook] blocked POST: honeypot');
        logActivity('blocked', 'honeypot field filled', visitorId(req.ip));
        return res.status(403).json({error: 'Request blocked.'});
    }

    const {error: tokenError, nonce} = checkToken(req, body.token);
    if (tokenError) {
        console.warn(`[guestbook] blocked POST: ${tokenError}`);
        logActivity('blocked', `token: ${tokenError}`, visitorId(req.ip));
        const expired = tokenError === 'token expired' || tokenError === 'submitted too fast';
        return res.status(403).json({
            error: expired ? 'Your form expired — please try again.' : 'Request blocked.',
            retry: expired,
        });
    }

    const result = moderate(body.name, body.message);
    if (!result.ok) {
        logActivity('rejected', result.error, visitorId(req.ip));
        return res.status(400).json({error: result.error});
    }

    // Single use from here on, whatever the outcome.
    if (!consumeToken(nonce)) {
        console.warn('[guestbook] blocked POST: token reused');
        return res.status(403).json({error: 'Request blocked.', retry: false});
    }

    const col = await collection(res);
    if (!col) return;

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if ((await col.countDocuments({createdAt: {$gte: since}})) >= DAILY_CAP) {
        logActivity('blocked', `daily cap of ${DAILY_CAP} reached`, visitorId(req.ip));
        return res.status(429).json({error: 'The guestbook is taking a break. Please try again tomorrow.'});
    }

    const doc = {
        name: result.name,
        message: result.message,
        visitor: visitorId(req.ip),
        createdAt: new Date(),
        hidden: false,
    };

    try {
        const {insertedId} = await col.insertOne(doc);
        logActivity('signed', `new entry from "${doc.name}"`, doc.visitor);
        res.status(201).json({entry: toPublic({...doc, _id: insertedId})});
    } catch (err) {
        if (err && err.code === 11000) {
            return res.status(409).json({error: 'You’ve already signed the guestbook. Thanks!'});
        }
        console.error('[guestbook] insert failed:', err.message);
        res.status(500).json({error: 'Something went wrong. Please try again later.'});
    }
});

// Anything else under /api/guestbook
router.use((req, res) => res.status(404).json({error: 'Not found.'}));

module.exports = router;
module.exports.COLLECTION = COLLECTION;
