// Settings for the e-ink panels. Defaults work with no env vars set.

const num = (value, fallback) => {
    const n = Number(value);
    return value !== undefined && value !== '' && Number.isFinite(n) ? n : fallback;
};

module.exports = {
    // Panel resolution: CrowPanel ESP32-S3 4.2" (SSD1683), landscape.
    width: 400,
    height: 300,

    // Weather location. Defaults to central Atlanta; override for a more exact spot.
    latitude: num(process.env.EINK_LAT, 33.749),
    longitude: num(process.env.EINK_LON, -84.388),
    placeName: process.env.EINK_PLACE || 'Atlanta',
    timeZone: process.env.EINK_TZ || 'America/New_York',

    // How long a weather fetch is reused, and how long a stale one may stand in
    // when Open-Meteo can't be reached.
    weatherTtlMs: 10 * 60 * 1000,
    weatherStaleMs: 3 * 60 * 60 * 1000,

    // Rendered images are reused for this long, so a burst of requests costs one render.
    renderTtlMs: 60 * 1000,
};
