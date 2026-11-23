/**
 * Panel markup -> SVG (satori) -> pixels (resvg) -> 1-bit bitmap.
 * No headless browser, so it runs fine in the slim Docker image.
 */
const {Resvg} = require('@resvg/resvg-js');
const satori = require('satori').default;
const config = require('./config');
const fonts = require('./fonts');
const {threshold} = require('./encode');

// satori-html ships as ESM only.
let htmlToVNode = null;
async function parse(markup) {
    if (!htmlToVNode) htmlToVNode = (await import('satori-html')).html;
    return htmlToVNode(markup.trim());
}

async function toSvg(markup) {
    return satori(await parse(markup), {
        width: config.width,
        height: config.height,
        fonts: fonts.forSatori(),
    });
}

/** Renders panel markup to a {width, height, bits} bitmap (1 = white). */
async function toBitmap(markup) {
    const svg = await toSvg(markup);
    const image = new Resvg(svg, {background: '#ffffff', fitTo: {mode: 'original'}}).render();
    return threshold(image.pixels, image.width, image.height);
}

module.exports = {toSvg, toBitmap};
