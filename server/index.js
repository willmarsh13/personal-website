require('./loadEnv');
const express = require('express');
const path = require('path');
const client = require('prom-client');

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(express.static(path.resolve(__dirname, '../client/build')));
// express.static ignores dot-directories by default; expose /.well-known (security.txt)
app.use('/.well-known', express.static(path.resolve(__dirname, '../client/build/.well-known'), {dotfiles: 'allow'}));
// Number of reverse proxies in front of this server. `true` would trust any
// client-supplied X-Forwarded-For, letting visitors spoof their IP and bypass
// the guestbook's one-entry-per-visitor and rate limits.
const trustProxy = process.env.TRUST_PROXY ?? '1';
app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);
app.disable('x-powered-by');
// The site and API share one origin, so no CORS headers are sent.
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: false }));

client.collectDefaultMetrics();

const httpRequestDurationMs = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [50, 100, 200, 300, 400, 500, 1000, 2000]
});

app.use((req, res, next) => {
    const end = httpRequestDurationMs.startTimer();
    res.on('finish', () => {
        end({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status_code: res.statusCode
        });
    });
    next();
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.get('/assets', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
});

app.use('/api', require('./api'));

// 400x300 1-bit pages and images for the e-ink display.
app.use('/eink', require('./eink'));

// The admin page is unlinked; also tell crawlers not to index it.
app.use('/admin', (req, res, next) => {
    res.set({'X-Robots-Tag': 'noindex, nofollow', 'Cache-Control': 'no-store'});
    next();
});

app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
});

app.listen(port, (err) => {
    if (err) {
        console.error(`Failed to start server on port ${port}:`, err.message);
        process.exit(1);
    }
    console.log(`Server listening on port ${port}`);
});
