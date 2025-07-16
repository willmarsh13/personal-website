const express = require('express');
const cors = require('cors');
const path = require("path");
const app = express();
const port = 8080;
const bodyParser = require("body-parser");
const client = require('prom-client');

app.use(express.static(path.resolve(__dirname, "../client/build")));
app.timeout = 60000;

app.use(cors());

app.set("trust proxy", true);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true, parameterLimit: 500000 }));

client.collectDefaultMetrics();

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.get("/assets", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.use('/api', async (req, res, next) => {
    next(error);
}, require('./api'));

app.get("/*", async (req, res, next) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

app.listen(port, () => {
    console.log(`server listening on port ${port}`);
})