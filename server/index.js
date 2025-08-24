const express = require('express');
const cors = require('cors');
const path = require('path');
const client = require('prom-client');

const app = express();
const port = 3001;

app.use(express.static(path.resolve(__dirname, '../client/build')));
app.use(cors());
app.set('trust proxy', true);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

app.get(/.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
