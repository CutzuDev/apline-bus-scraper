# RATBV Bus Scraper

Web dashboard for tracking RATBV (Brasov public transport) bus schedules. Users add bus routes via a guided UI; the server scrapes live timetables from ratbv.ro using headless Chrome and caches results to flat JSON files. Per-user accounts (name-based, no auth). PWA with offline support.

## Tech Stack

- **Runtime**: Bun
- **Backend**: `Bun.serve()` HTTP server (`server/index.ts`)
- **Frontend**: React 19, Vite, Tailwind CSS, shadcn/ui components
- **Maps**: Leaflet.js + react-leaflet (route map on RoutePage)
- **Scraping**: Selenium WebDriver + ChromeDriver (headless Chrome)
- **Storage**: Flat-file JSON (`data/users.json`, `data/logs/*.json`, `data/map-cache/*.json`)
- **Language**: TypeScript (strict mode), Romanian UI text

### External Services

| Service | How Used |
|---------|----------|
| **ratbv.ro** | Primary scrape target. Headless Chrome navigates frameset pages to extract timetables and station lists. No public API — pure DOM scraping via Selenium. |
| **Overpass API** (`overpass.openstreetmap.fr/api/interpreter`) | Queried via HTTP POST with OverpassQL to fetch bus route geometry (polylines) and stop points from OpenStreetMap. Used by `server/routes/mapRoute.ts`. Results cached 7 days in `data/map-cache/`. |
| **OpenStreetMap Tile Server** (`tile.openstreetmap.org`) | Standard slippy map tiles rendered as the background layer by Leaflet in `src/components/RouteMap.tsx`. |
| **ChromeDriver** | Local binary (not a network service). Path set via `CHROMEDRIVER_PATH` env var. Launched per-scrape by Selenium. |

## Project Structure

| Directory | Purpose |
|-----------|---------|
| `server/` | Backend: API server, route handlers, scraper, data store |
| `server/lib/` | Core modules: `types.ts`, `store.ts`, `scraper.ts`, `time.ts` |
| `server/routes/` | API handlers: `users.ts`, `routes.ts`, `scraper.ts`, `nextBus.ts`, `mapRoute.ts` |
| `src/` | React SPA frontend |
| `src/pages/` | Page components: Login, Home, Dashboard, AddLine, Route |
| `src/components/` | Shared components: Layout, RouteCard, TimeGrid, RouteMap, StationPicker, DirectionToggle, UserSwitcher |
| `src/components/ui/` | shadcn/ui primitives (Button, Card, Input, Badge, etc.) |
| `src/hooks/` | React hooks: useUser, useRoutes, useBusTimes, useScrapeLine |
| `src/lib/` | Frontend utilities: `api.ts`, `time.ts`, `utils.ts` |
| `scripts/` | One-time scripts (e.g., `migrate.ts`) |
| `data/` | Runtime data (gitignored): users.json, logs/, map-cache/ |
| `public/` | PWA manifest, service worker, static assets |

## Build & Run

```bash
bun install              # install dependencies
bun run dev              # dev mode: Vite on :5173 + Bun API on :4200
bun run build            # build frontend to dist/
bun run start            # production: build + serve on :4200
bun run migrate          # one-time: convert old routes.json to data/users.json
```

No separate build step for the backend -- Bun runs TypeScript directly.

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/users` | List all user names |
| GET | `/api/users/:name` | Get a single user by name |
| POST | `/api/users` | Create/select user |
| GET | `/api/routes?user=X` | Get user's routes |
| POST | `/api/routes?user=X` | Add route to user |
| DELETE | `/api/routes/:id?user=X` | Remove route |
| POST | `/api/scrape-line` | Scrape station list for a line |
| POST | `/api/scrape-times/:routeId?user=X` | Scrape + cache + log bus times |
| GET | `/api/next-bus/:routeId` | Siri-friendly: next bus from cache |
| GET | `/api/logs/:routeId` | Historical fetch log _(not yet implemented)_ |
| GET | `/api/map-route?line=X&direction=Y` | Route geometry + stops from OpenStreetMap (7-day cache) |

User identified by `?user=Name` query param. Frontend stores active user in localStorage.

## Environment

- `CHROMEDRIVER_PATH` -- path to chromedriver binary (default: `/usr/bin/chromium`)

## Key Conventions

- No auto-scrape on page load. Users must manually press "Reincarca" to trigger a fresh scrape
- Bus times logged per-route in `data/logs/{routeId}.json` with timestamps
- Route IDs follow pattern: `{lineNumber}-{stationSlug}-{direction}` (e.g., `23b-4-intors`)
- All scraper logic in `server/lib/scraper.ts` -- uses Selenium frame navigation for ratbv.ro's frameset pages
- Timezone: all time calculations use `Europe/Bucharest`

## Additional Documentation

- [`.claude/docs/architectural_patterns.md`](.claude/docs/architectural_patterns.md) -- scraper design, caching strategy, routing conventions, data flow patterns
