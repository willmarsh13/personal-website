/**
 * Encoders for 1-bit images. Input everywhere is a "bitmap": {width, height, bits},
 * where bits is a Uint8Array of width*height entries, 1 = white and 0 = black.
 */
const zlib = require('zlib');

/** RGBA pixels -> 1-bit bitmap by luminance threshold (0-255). */
function threshold(rgba, width, height, cutoff = 140) {
    const bits = new Uint8Array(width * height);
    for (let i = 0, p = 0; i < bits.length; i++, p += 4) {
        // Composite over white so transparent pixels count as paper.
        const a = rgba[p + 3] / 255;
        const lum = (0.299 * rgba[p] + 0.587 * rgba[p + 1] + 0.114 * rgba[p + 2]) * a + 255 * (1 - a);
        bits[i] = lum >= cutoff ? 1 : 0;
    }
    return {width, height, bits};
}

/** Packs rows MSB-first; each row padded with white bits to `align` bytes. */
function packRows(bitmap, {align = 1, invert = false} = {}) {
    const {width, height, bits} = bitmap;
    const rowBytes = Math.ceil(Math.ceil(width / 8) / align) * align;
    const out = Buffer.alloc(rowBytes * height, invert ? 0x00 : 0xff);
    for (let y = 0; y < height; y++) {
        const row = out.subarray(y * rowBytes, (y + 1) * rowBytes);
        for (let x = 0; x < width; x++) {
            // Rows start out all white, so only black pixels need a bit flipped.
            if (bits[y * width + x] === 0) row[x >> 3] ^= 0x80 >> (x & 7);
        }
    }
    return {data: out, rowBytes};
}

/**
 * Raw frame buffer: width*height/8 bytes, row-major, MSB = leftmost pixel.
 * Default 1 = white, 0 = black, which is what SSD16xx panels (and GxEPD2's
 * writeImage) expect. `invert` flips it for Adafruit GFX drawBitmap-style use.
 */
const toRaw = (bitmap, invert = false) => packRows(bitmap, {invert}).data;

// ---- PNG (grayscale, bit depth 1) ----

const CRC_TABLE = Array.from({length: 256}, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});

function crc32(buf) {
    let c = 0xffffffff;
    for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
}

function toPng(bitmap) {
    const {width, height} = bitmap;
    const {data, rowBytes} = packRows(bitmap);
    const raw = Buffer.alloc((rowBytes + 1) * height);
    for (let y = 0; y < height; y++) {
        raw[y * (rowBytes + 1)] = 0; // filter: none
        data.copy(raw, y * (rowBytes + 1) + 1, y * rowBytes, (y + 1) * rowBytes);
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 1; // bit depth
    ihdr[9] = 0; // color type: grayscale (0 = black, 1 = white)
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        chunk('IDAT', zlib.deflateSync(raw, {level: 9})),
        chunk('IEND', Buffer.alloc(0)),
    ]);
}

// ---- BMP (1 bit per pixel, 2-color palette, bottom-up) ----

function toBmp(bitmap) {
    const {width, height} = bitmap;
    const {data, rowBytes} = packRows(bitmap, {align: 4});
    const headerSize = 14 + 40 + 8;
    const out = Buffer.alloc(headerSize + data.length);
    out.write('BM', 0, 'ascii');
    out.writeUInt32LE(out.length, 2);
    out.writeUInt32LE(headerSize, 10);
    out.writeUInt32LE(40, 14); // BITMAPINFOHEADER
    out.writeInt32LE(width, 18);
    out.writeInt32LE(height, 22); // positive = bottom-up
    out.writeUInt16LE(1, 26); // planes
    out.writeUInt16LE(1, 28); // bits per pixel
    out.writeUInt32LE(0, 30); // BI_RGB
    out.writeUInt32LE(data.length, 34);
    out.writeInt32LE(2835, 38); // 72 dpi
    out.writeInt32LE(2835, 42);
    out.writeUInt32LE(2, 46); // colors in palette
    out.writeUInt32LE(2, 50);
    out.writeUInt32LE(0x00000000, 54); // index 0: black
    out.writeUInt32LE(0x00ffffff, 58); // index 1: white
    for (let y = 0; y < height; y++) {
        data.copy(out, headerSize + (height - 1 - y) * rowBytes, y * rowBytes, (y + 1) * rowBytes);
    }
    return out;
}

module.exports = {threshold, toRaw, toPng, toBmp};
