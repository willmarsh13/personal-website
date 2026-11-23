/**
 * E-ink dashboard for a 400x300 1-bit panel (CrowPanel 4.2" ESP32-S3).
 *
 *   GET /api/eink          raw 1-bit bitmap, 15,000 bytes (application/octet-stream)
 *   GET /api/eink?invert=1 same, with 1 = black instead of 1 = white
 *   GET /api/eink.png      PNG preview of exactly the same pixels
 *
 * Responses carry an ETag; send If-None-Match to get a 304 and skip a refresh
 * when nothing changed. If EINK_TOKEN is set, requests need ?token= or
 * Authorization: Bearer <token>.
 */
const crypto = require('crypto');
const router = require('express').Router();
const {rateLimit} = require('express-rate-limit');
const {render, WIDTH, HEIGHT} = require('./render');
const {getWeather, config} = require('./weather');

const limiter = rateLimit({windowMs: 60 * 1000, limit: 30, standardHeaders: 'draft-7', legacyHeaders: false});

function checkToken(req, res, next) {
    const expected = process.env.EINK_TOKEN;
    if (!expected) return next();
    const header = req.get('authorization') || '';
    const given = req.query.token || (header.startsWith('Bearer ') ? header.slice(7) : '');
    const a = crypto.createHash('sha256').update(String(given)).digest();
    const b = crypto.createHash('sha256').update(expected).digest();
    if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({error: 'Unauthorized.'});
    next();
}

async function build(req) {
    const {timezone} = config();
    const weather = await getWeather();
    return render(
        {now: new Date(), timezone, location: process.env.EINK_LOCATION ?? 'Atlanta', weather},
        {invert: req.query.invert === '1' || req.query.invert === 'true'},
    );
}

function send(req, res, body, type) {
    const etag = `"${crypto.createHash('sha1').update(body).digest('base64url')}"`;
    res.set({
        'Content-Type': type,
        'Cache-Control': 'no-cache',
        ETag: etag,
        'X-Width': String(WIDTH),
        'X-Height': String(HEIGHT),
    });
    if (req.get('if-none-match') === etag) return res.status(304).end();
    res.send(body);
}

router.get('/eink', limiter, checkToken, async (req, res, next) => {
    try {
        const {bits} = await build(req);
        send(req, res, bits, 'application/octet-stream');
    } catch (err) {
        next(err);
    }
});

router.get('/eink.png', limiter, checkToken, async (req, res, next) => {
    try {
        const {png} = await build(req);
        send(req, res, await png(), 'image/png');
    } catch (err) {
        next(err);
    }
});

module.exports = router;
