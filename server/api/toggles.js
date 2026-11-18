/**
 * Feature toggles stored in the `toggles` collection, one document per feature:
 *
 *   { _id: "guestbook", enabled: true, updatedAt: ISODate(...) }
 *
 * Documents keyed by a `key` or `name` field instead of `_id` are read too.
 * A feature with no document uses its default below. Values are cached briefly
 * so public traffic doesn't hit the database on every request.
 */
const router = require('express').Router();
const {getDb} = require('./MongoClient');

const COLLECTION = 'toggles';
const CACHE_MS = 10 * 1000;

/** Every toggle the app knows about. Unknown keys can't be read or written. */
const FEATURES = {
    guestbook: {default: true, description: 'Guestbook section, first-visit prompt, terminal command and its public API.'},
};

let cache = null; // {at, values}

const matchKey = (key) => ({$or: [{_id: key}, {key}, {name: key}]});

async function loadAll() {
    const db = await getDb();
    if (!db) throw new Error('database not configured');
    const col = db.collection(COLLECTION);
    const keys = Object.keys(FEATURES);
    const docs = await col.find({$or: [{_id: {$in: keys}}, {key: {$in: keys}}, {name: {$in: keys}}]}).toArray();
    const values = {};
    for (const key of keys) {
        const doc = docs.find((d) => d._id === key || d.key === key || d.name === key);
        values[key] = {
            enabled: doc && typeof doc.enabled === 'boolean' ? doc.enabled : FEATURES[key].default,
            updatedAt: doc ? doc.updatedAt || null : null,
            stored: Boolean(doc),
        };
    }
    return values;
}

/**
 * Current values. If the database can't be reached, features report as off:
 * anything behind a toggle that needs the database wouldn't work anyway.
 */
async function getToggles() {
    if (cache && Date.now() - cache.at < CACHE_MS) return cache.values;
    try {
        const values = await loadAll();
        cache = {at: Date.now(), values};
        return values;
    } catch (err) {
        console.error('[toggles] could not load:', err.message);
        const off = {};
        for (const key of Object.keys(FEATURES)) off[key] = {enabled: false, updatedAt: null, stored: false};
        return off;
    }
}

async function isEnabled(key) {
    const toggles = await getToggles();
    return Boolean(toggles[key] && toggles[key].enabled);
}

async function setToggle(key, enabled) {
    if (!FEATURES[key]) throw new Error(`unknown toggle: ${key}`);
    const db = await getDb();
    if (!db) throw new Error('database not configured');
    const col = db.collection(COLLECTION);
    const updatedAt = new Date();
    // Update whichever document already represents this toggle; otherwise create one.
    const existing = await col.findOne(matchKey(key), {projection: {_id: 1}});
    if (existing) {
        await col.updateOne({_id: existing._id}, {$set: {enabled, updatedAt}});
    } else {
        await col.insertOne({_id: key, enabled, updatedAt});
    }
    cache = null;
}

/** Express middleware: 404 when the feature is switched off. */
const requireFeature = (key) => async (req, res, next) => {
    if (await isEnabled(key)) return next();
    res.status(404).json({error: 'This feature is turned off.', disabled: true});
};

// GET /api/features — public on/off map for the front end.
router.get('/', async (req, res) => {
    const toggles = await getToggles();
    res.set('Cache-Control', 'no-store');
    res.json(Object.fromEntries(Object.entries(toggles).map(([k, v]) => [k, v.enabled])));
});

module.exports = {router, FEATURES, getToggles, isEnabled, setToggle, requireFeature};
