/**
 * Weather from Open-Meteo (free, no API key). Cached so the display can poll
 * as often as it likes without hammering the upstream API.
 */
const CACHE_MS = 10 * 60 * 1000;
const TIMEOUT_MS = 8000;

let cache = null; // {key, at, data}

// WMO weather interpretation codes -> label + icon.
// https://open-meteo.com/en/docs (see "WMO Weather interpretation codes")
const CODES = {
    0: ['Clear', 'clear'],
    1: ['Mostly clear', 'clear'],
    2: ['Partly cloudy', 'partly'],
    3: ['Overcast', 'cloud'],
    45: ['Fog', 'fog'],
    48: ['Freezing fog', 'fog'],
    51: ['Light drizzle', 'drizzle'],
    53: ['Drizzle', 'drizzle'],
    55: ['Heavy drizzle', 'drizzle'],
    56: ['Freezing drizzle', 'drizzle'],
    57: ['Freezing drizzle', 'drizzle'],
    61: ['Light rain', 'rain'],
    63: ['Rain', 'rain'],
    65: ['Heavy rain', 'rain'],
    66: ['Freezing rain', 'rain'],
    67: ['Freezing rain', 'rain'],
    71: ['Light snow', 'snow'],
    73: ['Snow', 'snow'],
    75: ['Heavy snow', 'snow'],
    77: ['Snow grains', 'snow'],
    80: ['Light showers', 'rain'],
    81: ['Showers', 'rain'],
    82: ['Heavy showers', 'rain'],
    85: ['Snow showers', 'snow'],
    86: ['Snow showers', 'snow'],
    95: ['Thunderstorms', 'storm'],
    96: ['Thunderstorms', 'storm'],
    99: ['Thunderstorms', 'storm'],
};

const describe = (code) => {
    const [label, icon] = CODES[code] || ['Unknown', 'cloud'];
    return {label, icon};
};

function config() {
    return {
        lat: Number(process.env.EINK_LAT || 33.749),
        lon: Number(process.env.EINK_LON || -84.388),
        timezone: process.env.EINK_TIMEZONE || 'America/New_York',
        units: (process.env.EINK_UNITS || 'fahrenheit').toLowerCase() === 'celsius' ? 'celsius' : 'fahrenheit',
    };
}

async function fetchWeather() {
    const {lat, lon, timezone, units} = config();
    const key = `${lat},${lon},${timezone},${units}`;
    if (cache && cache.key === key && Date.now() - cache.at < CACHE_MS) return cache.data;

    const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        timezone,
        temperature_unit: units,
        wind_speed_unit: units === 'celsius' ? 'kmh' : 'mph',
        precipitation_unit: units === 'celsius' ? 'mm' : 'inch',
        current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,is_day,wind_speed_10m',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset',
        forecast_days: '4',
    });

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`open-meteo HTTP ${res.status}`);
    const json = await res.json();
    const c = json.current;
    const d = json.daily;

    const data = {
        units: units === 'celsius' ? 'C' : 'F',
        windUnit: units === 'celsius' ? 'km/h' : 'mph',
        asOf: c.time, // local ISO time, no offset, e.g. "2026-11-23T16:30"
        current: {
            temp: c.temperature_2m,
            feelsLike: c.apparent_temperature,
            humidity: c.relative_humidity_2m,
            wind: c.wind_speed_10m,
            isDay: c.is_day === 1,
            ...describe(c.weather_code),
        },
        days: d.time.map((date, i) => ({
            date,
            high: d.temperature_2m_max[i],
            low: d.temperature_2m_min[i],
            precip: d.precipitation_probability_max[i],
            sunrise: d.sunrise[i],
            sunset: d.sunset[i],
            ...describe(d.weather_code[i]),
        })),
    };
    cache = {key, at: Date.now(), data};
    return data;
}

/** Latest weather, a stale copy if the API is down, or null. */
async function getWeather() {
    try {
        return await fetchWeather();
    } catch (err) {
        console.error('[eink] weather fetch failed:', err.message);
        return cache ? cache.data : null;
    }
}

module.exports = {getWeather, config};
