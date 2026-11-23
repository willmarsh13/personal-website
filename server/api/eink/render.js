/**
 * Draws the e-ink dashboard and packs it to a 1-bit buffer.
 *
 * Target: Elecrow CrowPanel 4.2" (400x300, SSD1683 controller).
 */
const path = require('path');
const {createCanvas, GlobalFonts, ImageData} = require('@napi-rs/canvas');

const WIDTH = 400;
const HEIGHT = 300;
const BLACK = '#000';
const WHITE = '#fff';

const FONT_DIR = path.join(__dirname, '../../assets/fonts');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'Inter_400Regular.ttf'), 'Inter');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'Inter_600SemiBold.ttf'), 'Inter SemiBold');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'Inter_800ExtraBold.ttf'), 'Inter ExtraBold');
GlobalFonts.registerFromPath(path.join(FONT_DIR, 'JetBrainsMono_500Medium.ttf'), 'JetBrains Mono');

const font = {
    regular: (px) => `${px}px "Inter"`,
    semi: (px) => `${px}px "Inter SemiBold"`,
    heavy: (px) => `${px}px "Inter ExtraBold"`,
    mono: (px) => `${px}px "JetBrains Mono"`,
};

const deg = (n) => `${Math.round(n)}°`;

// ---------- icons ----------

/** A cloud `s` px wide whose top-left is (x, y); about 0.6s tall. */
function cloud(ctx, x, y, s, lw) {
    const shapes = (grow) => {
        ctx.beginPath();
        ctx.roundRect(x + 0.05 * s - grow, y + 0.3 * s - grow, 0.9 * s + 2 * grow, 0.3 * s + 2 * grow, 0.15 * s + grow);
        ctx.moveTo(x + 0.51 * s + grow, y + 0.32 * s);
        ctx.arc(x + 0.33 * s, y + 0.32 * s, 0.18 * s + grow, 0, Math.PI * 2);
        ctx.moveTo(x + 0.84 * s + grow, y + 0.25 * s);
        ctx.arc(x + 0.6 * s, y + 0.25 * s, 0.24 * s + grow, 0, Math.PI * 2);
        ctx.fill('nonzero');
    };
    // Outline of the union: black shapes grown by the line width, white on top.
    ctx.fillStyle = BLACK;
    shapes(lw / 2);
    ctx.fillStyle = WHITE;
    shapes(-lw / 2);
    ctx.fillStyle = BLACK;
}

function sun(ctx, cx, cy, r, lw) {
    ctx.lineWidth = lw;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r * 1.5, cy + Math.sin(a) * r * 1.5);
        ctx.lineTo(cx + Math.cos(a) * r * 2.1, cy + Math.sin(a) * r * 2.1);
        ctx.stroke();
    }
}

function moon(ctx, cx, cy, r) {
    ctx.fillStyle = BLACK;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(cx + r * 0.55, cy - r * 0.35, r * 0.85, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = BLACK;
}

function drawIcon(ctx, type, x, y, s, isDay = true) {
    const lw = Math.max(2, Math.round(s / 16));
    ctx.save();
    ctx.strokeStyle = BLACK;
    ctx.fillStyle = BLACK;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = lw;

    const drops = (fn) => {
        cloud(ctx, x, y + 0.05 * s, s, lw);
        fn(y + 0.72 * s);
    };

    switch (type) {
        case 'clear':
            if (isDay) sun(ctx, x + s / 2, y + s / 2, s * 0.2, lw);
            else moon(ctx, x + s / 2, y + s / 2, s * 0.32);
            break;
        case 'partly':
            if (isDay) sun(ctx, x + 0.36 * s, y + 0.34 * s, s * 0.14, lw);
            else moon(ctx, x + 0.38 * s, y + 0.3 * s, s * 0.2);
            cloud(ctx, x + 0.12 * s, y + 0.34 * s, s * 0.88, lw);
            break;
        case 'cloud':
            cloud(ctx, x, y + 0.2 * s, s, lw);
            break;
        case 'fog':
            ctx.lineWidth = Math.max(2, Math.round(lw * 0.75));
            for (let i = 0; i < 4; i++) {
                const yy = y + (0.3 + i * 0.14) * s;
                const inset = i % 2 ? 0.18 : 0.08;
                ctx.beginPath();
                ctx.moveTo(x + inset * s, yy);
                ctx.lineTo(x + (1 - inset) * s, yy);
                ctx.stroke();
            }
            break;
        case 'drizzle':
            drops((top) => {
                for (const fx of [0.3, 0.5, 0.7]) {
                    ctx.beginPath();
                    ctx.arc(x + fx * s, top + 0.08 * s, lw * 0.9, 0, Math.PI * 2);
                    ctx.fill();
                }
            });
            break;
        case 'rain':
            drops((top) => {
                for (const fx of [0.3, 0.5, 0.7]) {
                    ctx.beginPath();
                    ctx.moveTo(x + fx * s, top);
                    ctx.lineTo(x + (fx - 0.07) * s, top + 0.2 * s);
                    ctx.stroke();
                }
            });
            break;
        case 'snow':
            drops((top) => {
                const r = 0.06 * s;
                for (const fx of [0.3, 0.5, 0.7]) {
                    const cx = x + fx * s;
                    const cy = top + (fx === 0.5 ? 0.15 : 0.07) * s;
                    for (let i = 0; i < 3; i++) {
                        const a = (i * Math.PI) / 3 + Math.PI / 2;
                        ctx.beginPath();
                        ctx.moveTo(cx - Math.cos(a) * r, cy - Math.sin(a) * r);
                        ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
                        ctx.stroke();
                    }
                }
            });
            break;
        case 'storm':
            drops((top) => {
                ctx.beginPath();
                ctx.moveTo(x + 0.55 * s, top - 0.06 * s);
                ctx.lineTo(x + 0.4 * s, top + 0.12 * s);
                ctx.lineTo(x + 0.52 * s, top + 0.12 * s);
                ctx.lineTo(x + 0.44 * s, top + 0.28 * s);
                ctx.lineTo(x + 0.64 * s, top + 0.06 * s);
                ctx.lineTo(x + 0.52 * s, top + 0.06 * s);
                ctx.closePath();
                ctx.fill();
            });
            break;
        default:
            cloud(ctx, x, y + 0.2 * s, s, lw);
    }
    ctx.restore();
}

// ---------- text helpers ----------

/** Shrinks the font until `text` fits in `maxWidth`. */
function fitText(ctx, text, makeFont, size, maxWidth, min = 10) {
    let px = size;
    ctx.font = makeFont(px);
    while (px > min && ctx.measureText(text).width > maxWidth) {
        px -= 1;
        ctx.font = makeFont(px);
    }
    return px;
}

function rule(ctx, y) {
    ctx.fillRect(16, y, WIDTH - 32, 2);
}

// ---------- layout ----------

function draw(ctx, {now, timezone, location, weather}) {
    const fmt = (opts, d = now) => new Intl.DateTimeFormat('en-US', {timeZone: timezone, ...opts}).format(d);

    ctx.fillStyle = WHITE;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = BLACK;
    ctx.textBaseline = 'alphabetic';

    // Date
    ctx.textAlign = 'left';
    ctx.font = font.heavy(42);
    ctx.fillText(fmt({weekday: 'long'}), 14, 52);
    ctx.font = font.semi(22);
    ctx.fillText(fmt({month: 'long', day: 'numeric', year: 'numeric'}), 16, 82);

    // Top-right: location + data timestamp
    ctx.textAlign = 'right';
    ctx.font = font.mono(13);
    if (location) ctx.fillText(location.toUpperCase(), WIDTH - 16, 30);
    if (weather) {
        // asOf is local wall-clock time without an offset; format it as-is.
        const [, hhmm] = weather.asOf.split('T');
        const [h, m] = hhmm.split(':').map(Number);
        const time = `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
        ctx.fillText(`AS OF ${time}`, WIDTH - 16, 48);
    }

    rule(ctx, 96);

    if (!weather) {
        ctx.textAlign = 'center';
        ctx.font = font.semi(22);
        ctx.fillText('Weather unavailable', WIDTH / 2, 200);
        return;
    }

    const {current, days, windUnit} = weather;
    const today = days[0];

    // Current conditions
    drawIcon(ctx, current.icon, 16, 108, 92, current.isDay);

    ctx.textAlign = 'left';
    ctx.font = font.heavy(76);
    ctx.fillText(deg(current.temp), 118, 184);

    const colX = 262;
    const colW = WIDTH - 16 - colX;
    fitText(ctx, current.label, font.semi, 20, colW);
    ctx.fillText(current.label, colX, 126);

    ctx.font = font.mono(14);
    const lines = [
        `H ${deg(today.high)}  L ${deg(today.low)}`,
        `FEELS ${deg(current.feelsLike)}`,
        `WIND ${Math.round(current.wind)} ${windUnit.toUpperCase()}`,
        `RAIN ${today.precip ?? 0}%`,
    ];
    lines.forEach((line, i) => ctx.fillText(line, colX, 150 + i * 18));

    rule(ctx, 214);

    // Next three days
    const cols = days.slice(1, 4);
    const w = (WIDTH - 32) / cols.length;
    cols.forEach((day, i) => {
        const x0 = 16 + i * w;
        if (i > 0) ctx.fillRect(Math.round(x0), 224, 1, 64);
        // Daily dates are plain YYYY-MM-DD; noon UTC keeps the weekday right in any zone.
        const label = fmt({weekday: 'short', timeZone: 'UTC'}, new Date(`${day.date}T12:00:00Z`)).toUpperCase();
        ctx.textAlign = 'left';
        ctx.font = font.mono(14);
        ctx.fillText(label, x0 + 12, 244);
        drawIcon(ctx, day.icon, x0 + w - 56, 220, 46, true);
        ctx.font = font.semi(20);
        ctx.fillText(`${deg(day.high)} / ${deg(day.low)}`, x0 + 12, 280);
    });
}

/**
 * Renders the dashboard. Returns {bits, png}: `bits` is 400x300 1-bit, rows
 * top to bottom, MSB = leftmost pixel, 50 bytes per row (15,000 bytes).
 * By default 1 = white and 0 = black, which is the SSD1683's native RAM format.
 */
async function render(state, {invert = false} = {}) {
    const canvas = createCanvas(WIDTH, HEIGHT);
    const ctx = canvas.getContext('2d');
    draw(ctx, state);

    const {data} = ctx.getImageData(0, 0, WIDTH, HEIGHT);
    const rowBytes = WIDTH / 8;
    const bits = Buffer.alloc(rowBytes * HEIGHT);

    // Threshold to pure black/white, and write the thresholded image back so the
    // PNG preview shows exactly what the panel will.
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            const i = (y * WIDTH + x) * 4;
            const white = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114 >= 128;
            const v = white ? 255 : 0;
            data[i] = data[i + 1] = data[i + 2] = v;
            data[i + 3] = 255;
            if (white !== invert) bits[y * rowBytes + (x >> 3)] |= 0x80 >> (x & 7);
        }
    }
    ctx.putImageData(new ImageData(data, WIDTH, HEIGHT), 0, 0);

    return {bits, png: () => canvas.encode('png')};
}

module.exports = {render, WIDTH, HEIGHT};
