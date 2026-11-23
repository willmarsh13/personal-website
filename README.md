# personal-website

React (CRA) client served by an Express server. UI components are in-house (`client/src/ui`), styled with CSS variables for dark/light themes. Node 22 in Docker (local dev needs Node 20.12+).

## Running locally

```bash
npm --prefix server install && npm --prefix client install
npm --prefix server run startDev   # API on :3002 (reads server/.env)
npm --prefix client start          # UI on :3000, proxies /api to :3002
```

## Environment variables (server)

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | for guestbook | Connection string for the `guestbook_app` user. Without it the guestbook returns 503 and the rest of the site works. |
| `MONGODB_DB` | no | Database name. Default `personal_site`. |
| `GUESTBOOK_SECRET` | yes in production | 32+ random characters. Signs form tokens and hashes visitor IPs. Keep it stable: changing it lets past visitors sign again. Generate with `npm --prefix server run gen-secret`. |
| `TRUST_PROXY` | no | Number of reverse proxies in front of the app (default `1`). Must be accurate, or visitors can spoof their IP. |
| `ALLOWED_ORIGINS` | no | Comma-separated origins allowed to call the guestbook API. Default `https://willmarsh.dev,https://www.willmarsh.dev`. |
| `GUESTBOOK_DAILY_CAP` | no | Max new entries across all visitors per 24 h (default `100`). |
| `ADMIN_PASSWORD_HASH` | for admin | Output of `npm --prefix server run hash-password`. Without it (and the secret below) the admin API answers 404. |
| `ADMIN_SESSION_SECRET` | for admin | 32+ random characters for signing admin session cookies. Changing it signs out every session. |
| `PORT` | no | Default `3001`. |

## E-ink display

Server-rendered dashboard (date + weather) for a 400×300 1-bit panel (CrowPanel 4.2" ESP32-S3, SSD1683).

| Endpoint | Returns |
|---|---|
| `GET /api/eink` | Raw bitmap, 15,000 bytes. Rows top to bottom, 50 bytes per row, MSB = leftmost pixel. `1` = white, `0` = black (the SSD1683's native RAM format). |
| `GET /api/eink?invert=1` | Same, with `1` = black. |
| `GET /api/eink.png` | PNG of exactly the same pixels, for checking the layout in a browser. |

Responses have an `ETag` that only changes when the picture does (new day or new weather reading, roughly every 15 min). Send `If-None-Match` and skip the refresh on a `304`. Weather comes from the NWS API ([api.weather.gov](https://www.weather.gov/documentation/services-web-api), no key). Current conditions are the latest METAR observation from `EINK_STATION` (cached 5 min). Today's high is the higher of the forecast high and the highest temperature observed since midnight, so it still shows after the afternoon forecast period ends. Highs, lows, rain chance and the 3-day row come from the NWS gridpoint forecast for the station's location (cached 30 min). If either call fails, the last good copy is used; with no forecast at all, the current conditions still show. Rate limited to 30 requests/min per IP.

| Variable | Default | Purpose |
|---|---|---|
| `EINK_STATION` | `KATL` | METAR station for current conditions. |
| `EINK_LAT` / `EINK_LON` | the station's coordinates | Forecast location, if it should differ from the station. |
| `EINK_USER_AGENT` | `personal-website-eink (https://willmarsh.dev)` | NWS requires a User-Agent identifying the app and a contact. |
| `EINK_LOCATION` | `Atlanta` | Label in the top right. Set to an empty string to hide it. |
| `EINK_TIMEZONE` | `America/New_York` | Date and weather timezone. |
| `EINK_UNITS` | `fahrenheit` | Or `celsius` (wind switches to km/h). |
| `EINK_TOKEN` | unset | If set, requests need `?token=…` or `Authorization: Bearer …`. |

## Feature toggles

Stored in the MongoDB `toggles` collection, one document per feature:

```js
{ _id: "guestbook", enabled: true, updatedAt: ISODate("…") }
```

Documents keyed by `name` or `key` instead of `_id` also work. With no document, a feature uses its default (the guestbook defaults to on). If the database can't be reached, toggled features report as off. Values are cached for 10 seconds. Flip them from `/admin` or directly in MongoDB.

| Toggle | Controls |
|---|---|
| `guestbook` | The guestbook section, the first-visit prompt, the terminal's `guestbook` command, and `/api/guestbook/*` (404 when off). The admin page can still manage entries while it's off. |

## Admin

`/admin` is unlinked and marked `noindex`, but access is enforced by the server, not by the URL staying secret:

- Single password, stored only as a scrypt hash. Logins are limited to 5 failures per IP per 15 min and 30 per hour globally, and every failure takes the same time.
- An 8-hour HttpOnly, `SameSite=Strict` session cookie (`__Host-` prefixed and `Secure` in production), tied to the browser that signed in. Signing out revokes it.
- Same-origin checks on every request. Admin endpoints answer 404 to anything that isn't the site's own UI, or to everyone when admin isn't configured.
- From the admin page you can see all entries (including hidden ones), hide or unhide them, delete them permanently, and see recent activity: blocked requests, filtered messages, new signatures and admin sign-ins. Activity is kept in memory only.

## Guestbook

The guestbook sits at the bottom of the home page (`/#guestbook`; old `/guestbook` links redirect there). First-time visitors get a one-time "want to sign the guestbook?" prompt after dismissing the privacy banner.

- `GET /api/guestbook` lists visible entries, `GET /api/guestbook/session` issues a single-use form token, and `POST /api/guestbook` signs.
- Requests must come from the site's own UI: same-origin `Origin`/`Sec-Fetch-Site`, a custom header, and a signed token bound to the visitor's IP and browser that must be at least 3 s and at most 30 min old.
- One entry per visitor, enforced by a unique index on a hashed IP (IPv6 grouped by /64). Also rate limited, capped per day, with a honeypot field.
- Names and messages are filtered for explicit language (including leetspeak, spacing and invisible-character tricks), links and email addresses, and junk.
- Hide or delete entries from `/admin`.
