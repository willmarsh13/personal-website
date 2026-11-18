const crypto = require('crypto');
const {isProd} = require('../security');
const {parseHash, scryptOpts} = require('./password');

/*
 * Single-admin auth: a scrypt password hash and a signed, HttpOnly session cookie.
 * Both env vars must be set or the whole admin API answers 404.
 *
 *   ADMIN_PASSWORD_HASH   from `npm --prefix server run hash-password`
 *   ADMIN_SESSION_SECRET  32+ random chars (rotating it signs everyone out)
 */
const PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

// __Host- cookies must be Secure, Path=/ and host-only, so they can't be set or
// overwritten by a subdomain or over plain HTTP. Only possible over HTTPS.
const COOKIE_NAME = isProd ? '__Host-admin_session' : 'admin_session';

const parsedHash = PASSWORD_HASH ? parseHash(PASSWORD_HASH) : null;

let configError = null;
if (!parsedHash) configError = 'ADMIN_PASSWORD_HASH missing or malformed';
else if (SESSION_SECRET.length < 32) configError = 'ADMIN_SESSION_SECRET missing or shorter than 32 chars';
if (configError) console.warn(`[admin] disabled: ${configError}`);

const isEnabled = () => !configError;

function verifyPassword(password) {
    if (!parsedHash || typeof password !== 'string' || password.length === 0 || password.length > 256) return Promise.resolve(false);
    const {N, r, p, salt, hash} = parsedHash;
    return new Promise((resolve) => {
        crypto.scrypt(password, salt, hash.length, scryptOpts(N, r, p), (err, derived) => {
            resolve(!err && crypto.timingSafeEqual(derived, hash));
        });
    });
}

// ---- Sessions ----
const sign = (value) => crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('base64url');
const uaHash = (ua) => sign(`ua:${ua || ''}`).slice(0, 16);

// Signed-out session ids, kept until they would have expired anyway.
const revoked = new Map();
setInterval(() => {
    const now = Date.now();
    for (const [sid, exp] of revoked) if (exp < now) revoked.delete(sid);
}, 10 * 60 * 1000).unref();

function createSession(req) {
    const payload = Buffer.from(JSON.stringify({
        sid: crypto.randomBytes(16).toString('base64url'),
        exp: Date.now() + SESSION_TTL_MS,
        ua: uaHash(req.get('user-agent')),
    })).toString('base64url');
    return `${payload}.${sign(`session:${payload}`)}`;
}

function readCookie(req, name) {
    const header = req.get('cookie');
    if (!header) return null;
    for (const part of header.split(';')) {
        const i = part.indexOf('=');
        if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
    }
    return null;
}

/** Returns the session payload, or null if missing / forged / expired / revoked. */
function getSession(req) {
    const token = readCookie(req, COOKIE_NAME);
    if (!token || token.length > 1024) return null;
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return null;
    const expected = Buffer.from(sign(`session:${payload}`));
    const given = Buffer.from(sig);
    if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
    let data;
    try {
        data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    } catch {
        return null;
    }
    if (!(data.exp > Date.now())) return null;
    if (revoked.has(data.sid)) return null;
    if (data.ua !== uaHash(req.get('user-agent'))) return null;
    return data;
}

function setSessionCookie(res, value) {
    res.cookie(COOKIE_NAME, value, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'strict',
        path: '/',
        maxAge: SESSION_TTL_MS,
    });
}

function clearSession(req, res) {
    const session = getSession(req);
    if (session) revoked.set(session.sid, session.exp);
    res.clearCookie(COOKIE_NAME, {httpOnly: true, secure: isProd, sameSite: 'strict', path: '/'});
}

module.exports = {isEnabled, verifyPassword, createSession, getSession, setSessionCookie, clearSession};
