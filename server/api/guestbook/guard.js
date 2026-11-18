const crypto = require('crypto');
const net = require('net');
const {isProd, sameOriginReason, logActivity} = require('../security');

// HMAC key for form tokens and IP hashing. Must be set (and stable) in production
// or every restart would let the same visitor sign again.
let SECRET = process.env.GUESTBOOK_SECRET;
if (!SECRET || SECRET.length < 32) {
    if (isProd) {
        console.error('[guestbook] GUESTBOOK_SECRET is missing or shorter than 32 chars; guestbook writes are disabled.');
        SECRET = null;
    } else {
        SECRET = crypto.randomBytes(32).toString('hex');
        console.warn('[guestbook] GUESTBOOK_SECRET not set; using a random dev-only secret.');
    }
}

const TOKEN_MIN_AGE_MS = 3 * 1000; // humans don't fill a form in under 3 s
const TOKEN_MAX_AGE_MS = 30 * 60 * 1000;
const UI_HEADER = 'x-guestbook-client';
const UI_HEADER_VALUE = 'web-ui';

const hmac = (value) => crypto.createHmac('sha256', SECRET).update(value).digest('base64url');

/**
 * Stable, non-reversible visitor id. IPv6 is truncated to its /64 because a
 * single household is usually handed an entire /64.
 */
function visitorId(ip) {
    let key = String(ip || '').replace(/^::ffff:/, '');
    if (net.isIPv6(key)) {
        const full = expandIPv6(key);
        key = full.split(':').slice(0, 4).join(':') + '::/64';
    }
    return hmac(`ip:${key}`);
}

function expandIPv6(addr) {
    const [head, tail = ''] = addr.split('::');
    const h = head ? head.split(':') : [];
    const t = tail ? tail.split(':') : [];
    const fill = new Array(8 - h.length - t.length).fill('0');
    return [...h, ...fill, ...t].map((p) => p.padStart(4, '0')).join(':');
}

const uaHash = (ua) => hmac(`ua:${ua || ''}`).slice(0, 16);

// Single-use nonces. In-memory is fine for one container; tokens expire anyway.
const usedNonces = new Map();
setInterval(() => {
    const cutoff = Date.now() - TOKEN_MAX_AGE_MS;
    for (const [nonce, t] of usedNonces) if (t < cutoff) usedNonces.delete(nonce);
}, 60 * 1000).unref();

/** Form token bound to this visitor + browser, issued when the UI loads the form. */
function issueToken(req) {
    const payload = Buffer.from(
        JSON.stringify({
            n: crypto.randomBytes(12).toString('base64url'),
            t: Date.now(),
            v: visitorId(req.ip),
            u: uaHash(req.get('user-agent')),
        }),
    ).toString('base64url');
    return `${payload}.${hmac(`tok:${payload}`)}`;
}

/**
 * Checks a form token without using it up. Returns {error} or {nonce}; call
 * consumeToken(nonce) once the submission passes validation, so a person can
 * fix a rejected message and resubmit with the same token.
 */
function checkToken(req, token) {
    const result = inspectToken(req, token);
    return typeof result === 'string' ? {error: result} : {nonce: result.n};
}

function consumeToken(nonce) {
    if (usedNonces.has(nonce)) return false;
    usedNonces.set(nonce, Date.now());
    return true;
}

function inspectToken(req, token) {
    if (typeof token !== 'string' || token.length > 512) return 'missing token';
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return 'malformed token';

    const expected = Buffer.from(hmac(`tok:${payload}`));
    const given = Buffer.from(sig);
    if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) {
        return 'bad signature';
    }

    let data;
    try {
        data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    } catch {
        return 'malformed token';
    }
    const age = Date.now() - data.t;
    if (!(age >= TOKEN_MIN_AGE_MS)) return 'submitted too fast';
    if (age > TOKEN_MAX_AGE_MS) return 'token expired';
    if (data.v !== visitorId(req.ip)) return 'visitor mismatch';
    if (data.u !== uaHash(req.get('user-agent'))) return 'browser mismatch';
    if (usedNonces.has(data.n)) return 'token reused';
    return data;
}

/**
 * Rejects anything that doesn't look like our own UI running in a browser on our
 * own origin. A determined attacker can still script a browser, which is why
 * this is layered with tokens, rate limits, one-entry-per-visitor and moderation.
 */
function requireOwnUI(req, res, next) {
    if (!SECRET) return res.status(503).json({error: 'Guestbook is unavailable.'});
    const reason = sameOriginReason(req, UI_HEADER, UI_HEADER_VALUE);
    if (reason) {
        console.warn(`[guestbook] blocked ${req.method} ${req.originalUrl}: ${reason}`);
        logActivity('blocked', `${req.method} ${req.originalUrl}: ${reason}`, visitorId(req.ip));
        return res.status(403).json({error: 'Request blocked.'});
    }
    next();
}

module.exports = {
    issueToken,
    checkToken,
    consumeToken,
    visitorId,
    requireOwnUI,
    isEnabled: () => Boolean(SECRET),
};
