/**
 * Pages for e-ink displays (400x300, 1-bit), mounted at /eink.
 *
 *   GET /eink                 the default panel as HTML (preview / design)
 *   GET /eink/:panel          a panel as HTML
 *   GET /eink/:panel.png      1-bit PNG, what the display shows
 *   GET /eink/:panel.bmp      1-bit BMP (GxEPD2's drawBitmapFromWeb examples read these)
 *   GET /eink/:panel.bin      raw 15,000-byte frame buffer, 1 = white (?invert=1 for 1 = black)
 *
 * Add a panel by dropping a module in ./panels and listing it in PANELS.
 */
const router = require('express').Router();
const config = require('./config');
const fonts = require('./fonts');
const {toBitmap} = require('./render');
const {toPng, toBmp, toRaw} = require('./encode');
const {escape} = require('./util');

const PANELS = Object.fromEntries([require('./panels/today')].map((p) => [p.id, p]));
const DEFAULT_PANEL = 'today';

const FORMATS = {
    png: {type: 'image/png', encode: (bm) => toPng(bm)},
    bmp: {type: 'image/bmp', encode: (bm) => toBmp(bm)},
    bin: {type: 'application/octet-stream', encode: (bm, q) => toRaw(bm, q.invert === '1')},
};

// Rendered bitmaps per panel, reused briefly so polling or a burst of hits costs one render.
const bitmapCache = new Map(); // id -> {at, promise}

function cachedBitmap(panel) {
    const hit = bitmapCache.get(panel.id);
    if (hit && Date.now() - hit.at < config.renderTtlMs) return hit.promise;
    const promise = panel
        .load()
        .then((data) => toBitmap(panel.markup(data)))
        .catch((err) => {
            bitmapCache.delete(panel.id);
            throw err;
        });
    bitmapCache.set(panel.id, {at: Date.now(), promise});
    return promise;
}

router.use((req, res, next) => {
    res.set('X-Robots-Tag', 'noindex, nofollow');
    next();
});

router.get('/fonts/:file', (req, res) => {
    const file = fonts.resolveWebFont(req.params.file);
    if (!file) return res.status(404).end();
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.type('font/woff2').sendFile(file);
});

router.get(['/', '/:name'], async (req, res, next) => {
    const match = /^([a-z0-9-]+)(?:\.(png|bmp|bin))?$/.exec(req.params.name || DEFAULT_PANEL);
    const panel = match && PANELS[match[1]];
    if (!panel) return res.status(404).type('text').send('No such panel.');
    const format = match[2];

    try {
        if (format) {
            const bitmap = await cachedBitmap(panel);
            const {type, encode} = FORMATS[format];
            res.set('Cache-Control', 'public, max-age=60');
            return res.type(type).send(encode(bitmap, req.query));
        }
        const zoom = Math.min(Math.max(Number(req.query.zoom) || 1, 1), 4);
        res.set('Cache-Control', 'no-cache');
        res.type('html').send(page(panel, panel.markup(await panel.load()), zoom));
    } catch (err) {
        next(err);
    }
});

// Plain-text errors; the site's SPA catch-all would otherwise answer with index.html.
// eslint-disable-next-line no-unused-vars
router.use((err, req, res, next) => {
    console.error('[eink] render failed:', err);
    res.status(500).type('text').send('Render failed.');
});

/**
 * The browser version: the same markup at exactly 400x300, no JavaScript.
 * Refreshes itself every 10 minutes. ?zoom=2 enlarges it for a desktop screen.
 */
function page(panel, markup, zoom) {
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${config.width}, initial-scale=1">
<meta http-equiv="refresh" content="600">
<meta name="robots" content="noindex, nofollow">
<title>${escape(panel.title)} · e-ink</title>
<style>
${fonts.fontFaceCss('/eink/fonts')}
*{box-sizing:border-box;margin:0}
html,body{height:100%;background:#fff}
body{display:flex;align-items:center;justify-content:center;-webkit-font-smoothing:none;font-smooth:never}
.screen{width:${config.width}px;height:${config.height}px;overflow:hidden;zoom:${zoom}}
.screen div{display:flex}
@media (min-width:${config.width + 1}px),(min-height:${config.height + 1}px){
  html,body{background:#d8d8d8}
  .screen{outline:1px solid #000}
}
</style>
</head>
<body>
<main class="screen">${markup}</main>
</body>
</html>`;
}

module.exports = router;
