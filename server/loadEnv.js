// Local dev: load server/.env (then a repo-root .env) if present. Values already
// in the environment win, so Docker Compose / real env vars always take precedence.
// process.loadEnvFile needs Node 20.12+; on older Node this is a no-op.
const path = require('path');

for (const file of [path.join(__dirname, '.env'), path.join(__dirname, '..', '.env')]) {
    try {
        if (typeof process.loadEnvFile === 'function') process.loadEnvFile(file);
    } catch (err) {
        if (err.code !== 'ENOENT') console.warn(`[env] could not load ${file}: ${err.message}`);
    }
}
