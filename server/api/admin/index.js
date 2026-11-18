const router = require('express').Router();
const {rateLimit} = require('express-rate-limit');
const {ObjectId} = require('mongodb');
const {getDb} = require('../MongoClient');
const {sameOriginReason, logActivity, recentActivity} = require('../security');
const {COLLECTION} = require('../guestbook');
const {visitorId} = require('../guestbook/guard');
const auth = require('./auth');
const toggles = require('../toggles');

const CLIENT_HEADER = 'x-admin-client';
const CLIENT_VALUE = 'web-ui';
const PAGE_SIZE = 50;
const DAILY_CAP = Number(process.env.GUESTBOOK_DAILY_CAP) || 100;

const notFound = (req, res) => res.status(404).json({error: 'Not found.'});

router.use((req, res, next) => {
    // Not configured: behave as if there is no admin API at all.
    if (!auth.isEnabled()) return notFound(req, res);
    res.set({'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow'});

    const reason = sameOriginReason(req, CLIENT_HEADER, CLIENT_VALUE);
    if (reason) {
        console.warn(`[admin] blocked ${req.method} ${req.originalUrl}: ${reason}`);
        return notFound(req, res);
    }
    next();
});

// ---- Login ----
const blockedResponse = (msg) => (req, res, next, options) => {
    console.warn(`[admin] login rate limited (${msg})`);
    logActivity('admin', `login rate limited (${msg})`, visitorId(req.ip));
    res.status(options.statusCode).json({error: 'Too many attempts. Try again later.'});
};
// Per IP, and a global ceiling so a distributed guess attempt still crawls.
const loginPerIp = rateLimit({windowMs: 15 * 60 * 1000, limit: 5, standardHeaders: 'draft-8', legacyHeaders: false, skipSuccessfulRequests: true, handler: blockedResponse('per IP')});
const loginGlobal = rateLimit({windowMs: 60 * 60 * 1000, limit: 30, keyGenerator: () => 'global', standardHeaders: false, legacyHeaders: false, skipSuccessfulRequests: true, handler: blockedResponse('global')});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

router.post('/login', loginPerIp, loginGlobal, async (req, res) => {
    const started = Date.now();
    const ok = await auth.verifyPassword(req.body && req.body.password);
    if (!ok) {
        // Uniform, slow failure response.
        await sleep(Math.max(0, 750 - (Date.now() - started)));
        console.warn('[admin] failed login');
        logActivity('admin', 'failed login', visitorId(req.ip));
        return res.status(401).json({error: 'Invalid password.'});
    }
    auth.setSessionCookie(res, auth.createSession(req));
    console.log('[admin] signed in');
    logActivity('admin', 'signed in', visitorId(req.ip));
    res.json({authenticated: true});
});

router.get('/me', (req, res) => res.json({authenticated: Boolean(auth.getSession(req))}));

router.post('/logout', (req, res) => {
    auth.clearSession(req, res);
    res.json({authenticated: false});
});

// ---- Everything below requires a session ----
router.use((req, res, next) => {
    if (!auth.getSession(req)) return res.status(401).json({error: 'Not signed in.'});
    next();
});

async function collection(res) {
    try {
        const db = await getDb();
        if (db) return db.collection(COLLECTION);
    } catch (err) {
        console.error('[admin] database connection failed:', err.message);
    }
    res.status(503).json({error: 'Database unavailable.'});
    return null;
}

const toAdmin = (doc) => ({
    id: doc._id.toString(),
    name: doc.name,
    message: doc.message,
    createdAt: doc.createdAt,
    hidden: Boolean(doc.hidden),
    visitor: typeof doc.visitor === 'string' ? doc.visitor.slice(0, 10) : null,
});

const parseId = (id) => (typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id) ? new ObjectId(id) : null);

router.get('/stats', async (req, res) => {
    const col = await collection(res);
    if (!col) return;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [total, hidden, last24h] = await Promise.all([
        col.countDocuments({}),
        col.countDocuments({hidden: true}),
        col.countDocuments({createdAt: {$gte: since}}),
    ]);
    res.json({total, visible: total - hidden, hidden, last24h, dailyCap: DAILY_CAP});
});

router.get('/entries', async (req, res) => {
    const col = await collection(res);
    if (!col) return;
    const filter = {};
    if (req.query.status === 'visible') filter.hidden = {$ne: true};
    if (req.query.status === 'hidden') filter.hidden = true;
    const before = parseId(req.query.before);
    if (before) filter._id = {$lt: before};

    const docs = await col.find(filter).sort({_id: -1}).limit(PAGE_SIZE + 1).toArray();
    res.json({entries: docs.slice(0, PAGE_SIZE).map(toAdmin), hasMore: docs.length > PAGE_SIZE});
});

router.patch('/entries/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (!id || typeof (req.body && req.body.hidden) !== 'boolean') return res.status(400).json({error: 'Bad request.'});
    const col = await collection(res);
    if (!col) return;
    const doc = await col.findOneAndUpdate({_id: id}, {$set: {hidden: req.body.hidden}}, {returnDocument: 'after'});
    if (!doc) return res.status(404).json({error: 'Entry not found.'});
    logActivity('admin', `${req.body.hidden ? 'hid' : 'unhid'} entry from "${doc.name}"`);
    res.json({entry: toAdmin(doc)});
});

router.delete('/entries/:id', async (req, res) => {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({error: 'Bad request.'});
    const col = await collection(res);
    if (!col) return;
    const doc = await col.findOneAndDelete({_id: id});
    if (!doc) return res.status(404).json({error: 'Entry not found.'});
    logActivity('admin', `deleted entry from "${doc.name}"`);
    res.json({deleted: true});
});

router.get('/toggles', async (req, res) => {
    const values = await toggles.getToggles();
    res.json({
        toggles: Object.entries(toggles.FEATURES).map(([key, f]) => ({
            key,
            description: f.description,
            ...values[key],
        })),
    });
});

router.patch('/toggles/:key', async (req, res) => {
    const {key} = req.params;
    const enabled = req.body && req.body.enabled;
    if (!Object.prototype.hasOwnProperty.call(toggles.FEATURES, key) || typeof enabled !== 'boolean') {
        return res.status(400).json({error: 'Bad request.'});
    }
    try {
        await toggles.setToggle(key, enabled);
    } catch (err) {
        console.error('[admin] toggle update failed:', err.message);
        return res.status(503).json({error: 'Database unavailable.'});
    }
    logActivity('admin', `turned ${key} ${enabled ? 'on' : 'off'}`);
    res.json({key, enabled});
});

router.get('/activity', (req, res) => res.json({events: recentActivity()}));

router.use(notFound);

module.exports = router;
