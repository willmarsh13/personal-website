/**
 * Weather from the NWS API (api.weather.gov, free, no key; a User-Agent is required).
 *
 *   Current conditions: latest METAR observation from a station (default KATL)
 *   Forecast:           NWS gridpoint forecast for the station's location
 *
 * Each piece is cached separately and falls back to its last good copy if the
 * API is down, so a forecast outage doesn't blank the current conditions.
 */
const API = 'https://api.weather.gov';
const TIMEOUT_MS = 10000;
const OBS_CACHE_MS = 5 * 60 * 1000;
const FORECAST_CACHE_MS = 30 * 60 * 1000;

const caches = {}; // name -> {key, at, data}

function config() {
    return {
        station: (process.env.EINK_STATION || 'KATL').toUpperCase(),
        // Forecast location; defaults to the station's own coordinates.
        lat: process.env.EINK_LAT ? Number(process.env.EINK_LAT) : null,
        lon: process.env.EINK_LON ? Number(process.env.EINK_LON) : null,
        timezone: process.env.EINK_TIMEZONE || 'America/New_York',
        units: (process.env.EINK_UNITS || 'fahrenheit').toLowerCase() === 'celsius' ? 'celsius' : 'fahrenheit',
        userAgent: process.env.EINK_USER_AGENT || 'personal-website-eink (https://willmarsh.dev)',
    };
}

async function nws(path, userAgent) {
    const res = await fetch(path.startsWith('http') ? path : `${API}${path}`, {
        headers: {'User-Agent': userAgent, Accept: 'application/geo+json'},
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`weather.gov HTTP ${res.status} for ${path}`);
    return res.json();
}

/** Runs `load` at most once per `ms` per key; on failure returns the last good value or throws. */
async function cached(name, key, ms, load) {
    const c = caches[name];
    if (c && c.key === key && Date.now() - c.at < ms) return c.data;
    try {
        const data = await load();
        caches[name] = {key, at: Date.now(), data};
        return data;
    } catch (err) {
        console.error(`[eink] ${name} failed:`, err.message);
        if (c && c.key === key) return c.data;
        throw err;
    }
}

// ---------- icons ----------

// NWS icon codes (https://api.weather.gov/icons) -> our icon set.
const ICON_CODES = {
    clear: ['skc', 'few', 'wind_skc', 'wind_few', 'hot', 'cold'],
    partly: ['sct', 'bkn', 'wind_sct', 'wind_bkn'],
    cloud: ['ovc', 'wind_ovc'],
    rain: ['rain', 'rain_showers', 'rain_showers_hi', 'fzra', 'rain_fzra'],
    snow: ['snow', 'rain_snow', 'snow_sleet', 'sleet', 'rain_sleet', 'snow_fzra', 'blizzard'],
    storm: ['tsra', 'tsra_sct', 'tsra_hi', 'tornado', 'hurricane', 'tropical_storm'],
    fog: ['fog', 'haze', 'smoke', 'dust'],
};
const SEVERITY = ['clear', 'partly', 'cloud', 'fog', 'rain', 'snow', 'storm'];

/**
 * Parses an NWS icon URL like
 *   https://api.weather.gov/icons/land/day/rain,60/tsra,80?size=medium
 * into {icon, isDay}. With two conditions, the more severe one wins.
 */
function parseIcon(url) {
    if (!url) return null;
    const m = /\/icons\/land\/(day|night)\/([^?]+)/.exec(url);
    if (!m) return null;
    let icon = null;
    for (const part of m[2].split('/')) {
        const code = part.split(',')[0];
        const type = Object.keys(ICON_CODES).find((k) => ICON_CODES[k].includes(code));
        if (type && (!icon || SEVERITY.indexOf(type) > SEVERITY.indexOf(icon))) icon = type;
    }
    return icon ? {icon, isDay: m[1] === 'day'} : null;
}

/** Fallback when an observation has no icon: read the METAR text description. */
function iconFromText(text = '') {
    const t = text.toLowerCase();
    if (/thunder|storm/.test(t)) return 'storm';
    if (/snow|sleet|ice|freezing/.test(t)) return 'snow';
    if (/drizzle/.test(t)) return 'drizzle';
    if (/rain|shower/.test(t)) return 'rain';
    if (/fog|mist|haze|smoke|dust/.test(t)) return 'fog';
    if (/overcast|^cloudy/.test(t)) return 'cloud';
    if (/partly|mostly cloudy|scattered|broken/.test(t)) return 'partly';
    return 'clear';
}

// ---------- units ----------

const toF = (c) => (c * 9) / 5 + 32;

/** NWS quantitative value -> display units. Returns null when the value is missing. */
function temp(q, units) {
    if (!q || q.value == null) return null;
    const c = /degF/.test(q.unitCode) ? ((q.value - 32) * 5) / 9 : q.value;
    return units === 'celsius' ? c : toF(c);
}

function speed(q, units) {
    if (!q || q.value == null) return null;
    let kmh = q.value;
    if (/m_s-1/.test(q.unitCode)) kmh = q.value * 3.6;
    else if (/kt/.test(q.unitCode)) kmh = q.value * 1.852;
    return units === 'celsius' ? kmh : kmh / 1.609344;
}

// ---------- time ----------

/** YYYY-MM-DD of `date` in `timeZone`. */
const localDate = (date, timeZone) =>
    new Intl.DateTimeFormat('en-CA', {timeZone, year: 'numeric', month: '2-digit', day: '2-digit'}).format(date);

/** ISO timestamp of local midnight today in `timeZone`, e.g. 2026-11-23T00:00:00-05:00. */
function localMidnight(now, timeZone) {
    const offset = new Intl.DateTimeFormat('en-US', {timeZone, timeZoneName: 'longOffset'})
        .formatToParts(now)
        .find((p) => p.type === 'timeZoneName').value.replace('GMT', '') || '+00:00';
    return `${localDate(now, timeZone)}T00:00:00${offset}`;
}

// ---------- loaders ----------

async function loadStation({station, userAgent}) {
    return cached('station', station, Infinity, async () => {
        const json = await nws(`/stations/${encodeURIComponent(station)}`, userAgent);
        const [lon, lat] = json.geometry.coordinates;
        return {lat, lon, name: json.properties.name};
    });
}

/** Today's observations, newest first; the latest one with a temperature is "current". */
async function loadObservations(cfg, now) {
    const {station, timezone, units, userAgent} = cfg;
    const key = `${station},${units},${localDate(now, timezone)}`;
    return cached('observations', key, OBS_CACHE_MS, async () => {
        const start = encodeURIComponent(localMidnight(now, timezone));
        const json = await nws(`/stations/${encodeURIComponent(station)}/observations?start=${start}&limit=100`, userAgent);
        const obs = json.features.map((f) => f.properties).filter((p) => p.temperature && p.temperature.value != null);
        // Just after midnight there may be nothing yet today: take the latest at all.
        if (!obs.length) {
            const latest = await nws(`/stations/${encodeURIComponent(station)}/observations/latest`, userAgent);
            if (latest.properties.temperature?.value != null) obs.push(latest.properties);
        }
        if (!obs.length) throw new Error('no observations with a temperature');

        const p = obs[0];
        const t = temp(p.temperature, units);
        const feels = temp(p.heatIndex, units) ?? temp(p.windChill, units) ?? t;
        const parsed = parseIcon(p.icon);
        return {
            asOf: p.timestamp,
            metar: p.rawMessage || null,
            current: {
                temp: t,
                feelsLike: feels,
                wind: speed(p.windSpeed, units) ?? 0,
                gust: speed(p.windGust, units),
                humidity: p.relativeHumidity?.value ?? null,
                label: p.textDescription || '',
                icon: parsed ? parsed.icon : iconFromText(p.textDescription),
                isDay: parsed ? parsed.isDay : true,
            },
            observedHigh: Math.max(...obs.map((o) => temp(o.temperature, units))),
        };
    });
}

async function loadForecast(cfg) {
    const {units, userAgent} = cfg;
    let {lat, lon} = cfg;
    if (lat == null || lon == null) ({lat, lon} = await loadStation(cfg));
    const point = `${lat.toFixed(4)},${lon.toFixed(4)}`;

    const forecastUrl = await cached('points', point, Infinity, async () => {
        const json = await nws(`/points/${point}`, userAgent);
        return json.properties.forecast;
    });

    return cached('forecast', `${forecastUrl},${units}`, FORECAST_CACHE_MS, async () => {
        const json = await nws(`${forecastUrl}?units=${units === 'celsius' ? 'si' : 'us'}`, userAgent);
        return json.properties.periods.map((p) => ({
            date: p.startTime.slice(0, 10), // local date; startTime carries the local offset
            isDaytime: p.isDaytime,
            temp: p.temperatureUnit === 'C' && units !== 'celsius' ? toF(p.temperature) : p.temperature,
            precip: p.probabilityOfPrecipitation?.value ?? null,
            label: p.shortForecast,
            icon: parseIcon(p.icon)?.icon || iconFromText(p.shortForecast),
        }));
    });
}

/** Today's high/low/rain chance and the next three days from forecast periods. */
function summarize(periods, today, observedHigh) {
    const todayDay = periods.find((p) => p.date === today && p.isDaytime);
    const tonight = periods.find((p) => p.date === today && !p.isDaytime);
    const forecastHigh = todayDay ? todayDay.temp : null;
    const highs = [forecastHigh, observedHigh].filter((n) => n != null && Number.isFinite(n));

    const dates = [...new Set(periods.map((p) => p.date))].filter((d) => d > today).slice(0, 3);
    const days = dates.map((date) => {
        const day = periods.find((p) => p.date === date && p.isDaytime);
        const night = periods.find((p) => p.date === date && !p.isDaytime);
        return {
            date,
            high: day ? day.temp : null,
            low: night ? night.temp : null,
            icon: (day || night).icon,
            label: (day || night).label,
        };
    });

    return {
        today: {
            high: highs.length ? Math.max(...highs) : null,
            low: tonight ? tonight.temp : null,
            precip: (todayDay || tonight || periods[0] || {}).precip ?? null,
        },
        days,
    };
}

/**
 * Everything the dashboard needs, or null if current conditions can't be had.
 * A missing forecast just leaves the forecast fields empty.
 */
async function getWeather(now = new Date()) {
    const cfg = config();
    const [obs, periods] = await Promise.allSettled([loadObservations(cfg, now), loadForecast(cfg)]);
    if (obs.status !== 'fulfilled') return null;

    const today = localDate(now, cfg.timezone);
    const {today: todayStats, days} =
        periods.status === 'fulfilled'
            ? summarize(periods.value, today, obs.value.observedHigh)
            : {today: {high: obs.value.observedHigh, low: null, precip: null}, days: []};

    return {
        station: cfg.station,
        units: cfg.units === 'celsius' ? 'C' : 'F',
        windUnit: cfg.units === 'celsius' ? 'km/h' : 'mph',
        asOf: new Date(obs.value.asOf),
        metar: obs.value.metar,
        current: obs.value.current,
        today: todayStats,
        days,
    };
}

module.exports = {getWeather, config, parseIcon, iconFromText};
