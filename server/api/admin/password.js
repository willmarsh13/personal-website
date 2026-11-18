const crypto = require('crypto');

const SCRYPT_PREFIX = 'scrypt';
const scryptOpts = (N, r, p) => ({N, r, p, maxmem: 256 * N * r});

function parseHash(stored) {
    const [prefix, N, r, p, salt, hash] = stored.split(':');
    if (prefix !== SCRYPT_PREFIX || !salt || !hash) return null;
    return {N: Number(N), r: Number(r), p: Number(p), salt: Buffer.from(salt, 'base64url'), hash: Buffer.from(hash, 'base64url')};
}

/** Format: scrypt:N:r:p:salt:hash (base64url). No `$`, so it's safe in .env files. */
function hashPassword(password) {
    const N = 32768, r = 8, p = 1;
    const salt = crypto.randomBytes(16);
    const hash = crypto.scryptSync(password, salt, 64, scryptOpts(N, r, p));
    return [SCRYPT_PREFIX, N, r, p, salt.toString('base64url'), hash.toString('base64url')].join(':');
}

module.exports = {hashPassword, parseHash, scryptOpts};
