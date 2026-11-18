/**
 * Shared request checks and an in-memory activity log for the admin page.
 */
const isProd = process.env.NODE_ENV === 'production';

const ALLOWED_ORIGINS = new Set(
    (process.env.ALLOWED_ORIGINS || 'https://willmarsh.dev,https://www.willmarsh.dev')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .concat(isProd ? [] : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']),
);

/**
 * Returns null if the request looks like our own front end on our own origin,
 * otherwise a short reason. `header` is a custom header our fetch() sends: it
 * can't be added cross-site without a CORS preflight, which we never answer.
 */
function sameOriginReason(req, header, value) {
    // Browsers send Sec-Fetch-Site on fetch(); curl and most scripts don't.
    const site = req.get('sec-fetch-site');
    if (site && site !== 'same-origin') return `sec-fetch-site=${site}`;

    // Browsers always send Origin on POST/PATCH/DELETE. On same-origin GETs they
    // omit it, so there we accept Sec-Fetch-Site: same-origin instead.
    const origin = req.get('origin');
    if (origin) {
        if (!ALLOWED_ORIGINS.has(origin)) return `origin=${origin}`;
    } else if (req.method !== 'GET' || site !== 'same-origin') {
        return 'origin=none';
    }

    if (req.get(header) !== value) return 'missing client header';
    if (!['GET', 'HEAD', 'DELETE'].includes(req.method) && !req.is('application/json')) return 'content-type';
    return null;
}

// ---- Activity log (in memory, newest first, resets on restart) ----
const MAX_EVENTS = 200;
const events = [];

/**
 * @param {'blocked'|'rejected'|'signed'|'admin'} type
 * @param {string} detail  short, human-readable; never the submitted text or a raw IP
 * @param {string} [visitor]  hashed visitor id
 */
function logActivity(type, detail, visitor) {
    events.unshift({at: new Date().toISOString(), type, detail, visitor: visitor ? visitor.slice(0, 10) : undefined});
    if (events.length > MAX_EVENTS) events.length = MAX_EVENTS;
}

const recentActivity = () => events.slice();

module.exports = {isProd, ALLOWED_ORIGINS, sameOriginReason, logActivity, recentActivity};
