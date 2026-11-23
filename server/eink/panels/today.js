/**
 * "Today" panel: date, current conditions and today's forecast.
 *
 * The markup is the single source for both the browser page and the image the
 * display downloads, so it sticks to what satori can lay out: inline styles,
 * flexbox only (every element with more than one child needs display:flex),
 * pure black on white, no shadows or greys.
 */
const config = require('../config');
const {getWeather} = require('../weather');
const {iconDataUri} = require('../icons');
const {escape} = require('../util');

const fmt = (opts) => new Intl.DateTimeFormat('en-US', {timeZone: config.timeZone, ...opts});
const weekdayFmt = fmt({weekday: 'long'});
const dateFmt = fmt({month: 'long', day: 'numeric'});
const timeFmt = fmt({hour: 'numeric', minute: '2-digit'});

/** "2026-11-23T17:31" (already local) -> {time: "5:31", meridiem: "pm"}. */
function clock(local) {
    const m = /T(\d{2}):(\d{2})/.exec(local || '');
    if (!m) return {time: '--', meridiem: ''};
    const h = Number(m[1]);
    return {time: `${h % 12 || 12}:${m[2]}`, meridiem: h < 12 ? 'am' : 'pm'};
}

const uvLabel = (uv) => (uv == null ? '' : uv <= 2 ? 'Low' : uv <= 5 ? 'Mod' : uv <= 7 ? 'High' : uv <= 10 ? 'V.High' : 'Extreme');
const deg = (n) => (n == null ? '--' : `${n}°`);

async function load(now = new Date()) {
    return {now, weather: await getWeather()};
}

const LABEL = "font-family:'IBM Plex Mono';font-weight:600;font-size:11px;letter-spacing:1.5px;text-transform:uppercase";

function stat(label, value, note, first) {
    return `
    <div style="display:flex;flex-direction:column;flex:1;padding:10px 0 0 ${first ? 16 : 12}px;${first ? '' : 'border-left:2px solid #000;'}">
      <div style="${LABEL}">${escape(label)}</div>
      <div style="display:flex;align-items:baseline;margin-top:2px">
        <div style="font-family:'Barlow Condensed';font-weight:700;font-size:34px;line-height:1">${escape(value)}</div>
        ${note ? `<div style="${LABEL};font-size:10px;letter-spacing:1px;margin-left:5px">${escape(note)}</div>` : ''}
      </div>
    </div>`;
}

function markup({now, weather: w}) {
    const sunset = clock(w && w.sunset);
    const updated = timeFmt.format(w ? new Date(w.fetchedAt) : now);

    const current = w
        ? `
      <div style="font-family:'Barlow Condensed';font-weight:700;font-size:132px;line-height:1;letter-spacing:-3px">${escape(deg(w.temp))}</div>
      <div style="display:flex;flex-direction:column;align-items:flex-start;flex:1;min-width:0;margin-left:14px">
        <img src="${iconDataUri(w.icon, w.isDay)}" width="68" height="68"/>
        <div style="font-family:'Barlow Condensed';font-weight:600;font-size:28px;line-height:1;margin-top:6px">${escape(w.condition)}</div>
        <div style="${LABEL};letter-spacing:1px;margin-top:6px">Feels ${escape(deg(w.feelsLike))} · ${escape(w.wind ?? '--')} mph</div>
      </div>`
        : `<div style="font-family:'Barlow Condensed';font-weight:600;font-size:32px;padding-top:40px">Weather unavailable</div>`;

    return `
<div style="display:flex;flex-direction:column;width:${config.width}px;height:${config.height}px;background:#fff;color:#000">
  <div style="display:flex;justify-content:space-between;align-items:flex-end;height:72px;padding:0 16px 10px;background:#000;color:#fff">
    <div style="display:flex;flex-direction:column">
      <div style="${LABEL};font-size:12px;letter-spacing:3px">${escape(weekdayFmt.format(now))}</div>
      <div style="font-family:'Barlow Condensed';font-weight:700;font-size:40px;line-height:1;margin-top:3px">${escape(dateFmt.format(now))}</div>
    </div>
    <div style="display:flex;flex-direction:column;align-items:flex-end">
      <div style="${LABEL};letter-spacing:2px">${escape(config.placeName)}</div>
      <div style="${LABEL};font-weight:500;letter-spacing:1px;margin-top:4px">as of ${escape(updated)}</div>
    </div>
  </div>
  <div style="display:flex;flex:1;align-items:center;padding:0 16px">${current}</div>
  <div style="display:flex;height:72px;border-top:3px solid #000">
    ${stat('Hi / Lo', w ? `${w.high ?? '--'}/${w.low ?? '--'}` : '--', '', true)}
    ${stat('Rain', w && w.rainChance != null ? `${w.rainChance}%` : '--')}
    ${stat('UV', w && w.uv != null ? String(w.uv) : '--', w ? uvLabel(w.uv) : '')}
    ${stat('Sunset', sunset.time, sunset.meridiem)}
  </div>
</div>`;
}

module.exports = {id: 'today', title: 'Today', load, markup};
