/**
 * Weather icons drawn for 1-bit displays: black strokes on white, no greys,
 * thick enough to survive thresholding at small sizes. 64x64 viewBox.
 */
const STROKE = 'fill="none" stroke="#000" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"';

// Cloud outline; `dy` moves it up to leave room for precipitation below.
const cloud = (dy = 0, fill = '#fff') =>
    `<path transform="translate(0 ${dy})" d="M19 48h27a10 10 0 0 0 1.5-19.9A14 14 0 0 0 20.6 25 11.5 11.5 0 0 0 19 48z" fill="${fill}" stroke="#000" stroke-width="4.5" stroke-linejoin="round"/>`;

const rays = (cx, cy, r1, r2) =>
    Array.from({length: 8}, (_, i) => {
        const a = (Math.PI / 4) * i;
        const p = (r) => `${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
        return `M${p(r1)}L${p(r2)}`;
    }).join('');

const sun = (cx = 32, cy = 32, r = 11) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" ${STROKE}/><path d="${rays(cx, cy, r + 7, r + 13)}" ${STROKE}/>`;

const moon = (cx = 32, cy = 32, s = 1) =>
    `<path transform="translate(${cx} ${cy}) scale(${s})" d="M6 -17A18 18 0 1 0 17 8 14 14 0 0 1 6 -17z" ${STROKE}/>`;

const ICONS = {
    clear: (day) => (day ? sun() : moon()),
    partly: (day) => (day ? sun(24, 22, 8) : moon(24, 22, 0.7)) + cloud(6),
    cloud: () => cloud(-2),
    fog: () => `<path d="M10 22h44M16 32h38M10 42h44M18 52h30" ${STROKE}/>`,
    drizzle: () => cloud(-8) + '<g fill="#000"><circle cx="22" cy="52" r="3"/><circle cx="34" cy="56" r="3"/><circle cx="46" cy="52" r="3"/></g>',
    rain: () => cloud(-8) + `<path d="M22 48l-4 10M33 48l-4 10M44 48l-4 10" ${STROKE}/>`,
    sleet: () => cloud(-8) + `<path d="M23 48l-4 10M43 48l-4 10" ${STROKE}/><circle cx="32" cy="55" r="3" fill="#000"/>`,
    snow: () =>
        cloud(-8) +
        `<path d="M22 49v9M17.5 53.5h9M42 49v9M37.5 53.5h9" stroke="#000" stroke-width="3.5" stroke-linecap="round"/><circle cx="32" cy="56" r="2.5" fill="#000"/>`,
    storm: () => cloud(-8) + '<path d="M34 42l-9 12h7l-4 9 11-13h-7l4-8z" fill="#000" stroke="#000" stroke-width="2" stroke-linejoin="round"/>',
};

/** SVG markup for an icon name. Unknown names fall back to a cloud. */
function iconSvg(name, isDay = true) {
    const draw = ICONS[name] || ICONS.cloud;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">${draw(isDay)}</svg>`;
}

/** The icon as a data URI, which both browsers and satori render in an <img>. */
const iconDataUri = (name, isDay) => `data:image/svg+xml;base64,${Buffer.from(iconSvg(name, isDay)).toString('base64')}`;

module.exports = {iconSvg, iconDataUri, ICON_NAMES: Object.keys(ICONS)};
