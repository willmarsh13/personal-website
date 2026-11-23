/**
 * Current conditions and today's forecast from Open-Meteo (free, no API key).
 * https://open-meteo.com/en/docs
 */
const config = require('./config');

// WMO weather interpretation codes -> short label + icon name.
const CONDITIONS = {
    0: ['Clear', 'clear'],
    1: ['Mostly clear', 'partly'],
    2: ['Partly cloudy', 'partly'],
    3: ['Overcast', 'cloud'],
    45: ['Fog', 'fog'],
    48: ['Freezing fog', 'fog'],
    51: ['Light drizzle', 'drizzle'],
    53: ['Drizzle', 'drizzle'],
    55: ['Heavy drizzle', 'drizzle'],
    56: ['Freezing drizzle', 'sleet'],
    57: ['Freezing drizzle', 'sleet'],
    61: ['Light rain', 'rain'],
    63: ['Rain', 'rain'],
    65: ['Heavy rain', 'rain'],
    66: ['Freezing rain', 'sleet'],
    67: ['Freezing rain', 'sleet'],
    71: ['Light snow', 'snow'],
    73: ['Snow', 'snow'],
    75: ['Heavy snow', 'snow'],
    77: ['Snow grains', 'snow'],
    80: ['Showers', 'rain'],
    81: ['Showers', 'rain'],
    82: ['Heavy showers', 'rain'],
    85: ['Snow showers', 'snow'],
    86: ['Snow showers', 'snow'],
    95: ['Thunderstorms', 'storm'],
    96: ['Storms, hail', 'storm'],
    99: ['Storms, hail', 'storm'],
};

const describe = (code) => {
    const [label, icon] = CONDITIONS[code] || ['Unknown', 'cloud'];
    return {label, icon};
};

let cache = null; // {at, data}
let inflight = null;

function buildUrl() {
    const params = new URLSearchParams({
        latitude: String(config.latitude),
        longitude: String(config.longitude),
        current: 'temperature_2m,apparent_temperature,weather_code,is_day,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset',
        temperature_unit: 'fahrenheit',
        wind_speed_unit: 'mph',
        timezone: config.timeZone,
        forecast_days: '1',
    });
    return `https://api.open-meteo.com/v1/forecast?${params}`;
}

/** Turns Open-Meteo's response into the fields the panels use. */
function normalize(body, fetchedAt) {
    const c = body.current || {};
    const d = body.daily || {};
    const first = (arr) => (Array.isArray(arr) ? arr[0] : undefined);
    const round = (n) => (typeof n === 'number' ? Math.round(n) : null);
    const condition = describe(c.weather_code);
    return {
        fetchedAt,
        temp: round(c.temperature_2m),
        feelsLike: round(c.apparent_temperature),
        isDay: c.is_day !== 0,
        wind: round(c.wind_speed_10m),
        condition: condition.label,
        icon: condition.icon,
        high: round(first(d.temperature_2m_max)),
        low: round(first(d.temperature_2m_min)),
        rainChance: round(first(d.precipitation_probability_max)),
        uv: round(first(d.uv_index_max)),
        // Local wall-clock times like "2026-11-23T17:31" (already in config.timeZone).
        sunrise: first(d.sunrise) || null,
        sunset: first(d.sunset) || null,
    };
}

async function fetchWeather() {
    const res = await fetch(buildUrl(), {signal: AbortSignal.timeout(8000)});
    if (!res.ok) throw new Error(`Open-Meteo answered ${res.status}`);
    return normalize(await res.json(), Date.now());
}

/**
 * Cached weather. Resolves to null (never throws) when there's no usable data,
 * so a panel can still show the date.
 */
async function getWeather() {
    const now = Date.now();
    if (cache && now - cache.at < config.weatherTtlMs) return cache.data;
    if (!inflight) {
        inflight = fetchWeather()
            .then((data) => {
                cache = {at: Date.now(), data};
                return data;
            })
            .finally(() => {
                inflight = null;
            });
    }
    try {
        return await inflight;
    } catch (err) {
        console.warn('[eink] weather fetch failed:', err.message);
        if (cache && now - cache.at < config.weatherStaleMs) return cache.data;
        return null;
    }
}

module.exports = {getWeather, normalize, describe};
