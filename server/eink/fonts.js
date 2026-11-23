/**
 * Fonts shared by the browser page (@font-face, woff2) and the image renderer
 * (satori needs woff/ttf). Both come from @fontsource packages (SIL OFL).
 */
const fs = require('fs');

const FONTS = [
    {family: 'Barlow Condensed', pkg: 'barlow-condensed', weight: 600},
    {family: 'Barlow Condensed', pkg: 'barlow-condensed', weight: 700},
    {family: 'IBM Plex Mono', pkg: 'ibm-plex-mono', weight: 500},
    {family: 'IBM Plex Mono', pkg: 'ibm-plex-mono', weight: 600},
];

const fileName = (f, ext) => `${f.pkg}-latin-${f.weight}-normal.${ext}`;
const filePath = (f, ext) => require.resolve(`@fontsource/${f.pkg}/files/${fileName(f, ext)}`);

let satoriFonts = null;

/** Font list in the shape satori expects. Read from disk once. */
function forSatori() {
    if (!satoriFonts) {
        satoriFonts = FONTS.map((f) => ({
            name: f.family,
            weight: f.weight,
            style: 'normal',
            data: fs.readFileSync(filePath(f, 'woff')),
        }));
    }
    return satoriFonts;
}

/** @font-face rules for the HTML page; files are served under `baseUrl`. */
const fontFaceCss = (baseUrl) =>
    FONTS.map(
        (f) =>
            `@font-face{font-family:'${f.family}';font-weight:${f.weight};font-style:normal;font-display:block;` +
            `src:url('${baseUrl}/${fileName(f, 'woff2')}') format('woff2')}`,
    ).join('\n');

/** Absolute path for a requested woff2 file, or null if it isn't one of ours. */
function resolveWebFont(name) {
    const font = FONTS.find((f) => fileName(f, 'woff2') === name);
    return font ? filePath(font, 'woff2') : null;
}

module.exports = {forSatori, fontFaceCss, resolveWebFont};
