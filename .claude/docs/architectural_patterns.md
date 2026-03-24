# Architectural Patterns

## Scraper Design

The scraper uses Selenium WebDriver with headless Chrome because ratbv.ro serves timetables inside HTML framesets that cannot be parsed with simple HTTP requests.

### Frame Navigation Pattern (`server/lib/scraper.ts`)

- **Line metadata**: Navigate to the master URL, switch to frame 2 for the line name, then frame 1 for the station list. Stations are extracted from `.list_sus_active`, `.list_statie`, and `.list_jos` CSS selectors.
- **Bus times**: Navigate to a specific station URL. Times are in `#tabel2` table, with hours in `#web_class_hours` and minutes in `#web_class_minutes > #web_min`.
- **Chrome options**: Shared via `buildChromeOptions()` to avoid duplication. Aggressive flags to minimize resource usage (`--single-process`, `--disable-gpu`, images disabled, max heap 256MB).

### URL Convention

RATBV URLs follow the pattern:
- Master page: `https://www.ratbv.ro/afisaje/{line}-{direction}.html`
- Station page: `https://www.ratbv.ro/afisaje/{line}-{direction}/line_{line}_{stationIndex}_cl1_ro.html`

## Data Flow

### Request-Scoped User Identification

All user-scoped API endpoints use `?user=Name` query parameter. The frontend stores the active user in `localStorage` and the `api.ts` module automatically appends it to requests. No sessions, cookies, or tokens.

Pattern used across `server/routes/routes.ts` and `server/routes/scraper.ts`:
1. Extract `user` from query params
2. Load user from `data/users.json` via `store.getUser()`
3. Operate on the user's route list
4. Save back via `store.saveUser()`

### Scrape-on-Demand (No Auto-Refresh)

Unlike typical polling apps, this app never auto-scrapes. The flow is:
1. Page loads show cached data from `user.routes[n].cachedBusTimes`
2. User clicks "Reincarca" to trigger `POST /api/scrape-times/:routeId`
3. Server scrapes, updates the user's cached data, and appends to `data/logs/{routeId}.json`
4. Frontend updates with fresh data

This design exists because RATBV schedules rarely change, so scraping on every load is wasteful and slow (each scrape launches a Chrome instance).

### Historical Logging

Every scrape result is appended to `data/logs/{routeId}.json` as `{ timestamp, busTimes }`. Logs are shared across users -- the same physical bus stop produces the same data regardless of who requested it. Logs can be queried via `GET /api/logs/:routeId`.

## Frontend Architecture

### Component Hierarchy

```
App
  BrowserRouter
    LoginPage (standalone, no Layout)
    Layout (RequireAuth wrapper)
      HomePage -> RouteCard[]
      DashboardPage -> RouteCard[] (with delete)
      AddLinePage -> DirectionToggle, StationPicker
      RoutePage -> TimeGrid
```

### Hook Pattern

Custom hooks encapsulate API calls and state management:
- `useUser` (`src/hooks/useUser.ts`) -- React Context for current user, persisted in localStorage
- `useRoutes` (`src/hooks/useRoutes.ts`) -- CRUD operations on the user's route list
- `useBusTimes` (`src/hooks/useBusTimes.ts`) -- scrape trigger with loading/error state
- `useScrapeLine` (`src/hooks/useScrapeLine.ts`) -- line metadata scraping for the add-line wizard

All hooks use `useCallback` for stable references and avoid unnecessary re-renders.

### Next-Bus Calculation

Used in both `server/lib/time.ts` and `src/lib/time.ts` (duplicated for server vs. client use). Linear scan through sorted time strings, comparing `HH:MM` to current Bucharest time. Returns the first future time and minutes until arrival. Used by:
- `RouteCard` -- shows next bus preview on homepage
- `TimeGrid` -- highlights the next bus with red + pulse animation
- `/api/next-bus/:routeId` -- Siri Shortcuts endpoint

### Siri Integration Endpoint

`GET /api/next-bus/:routeId` is designed for Apple Shortcuts:
- User-agnostic: searches all users for the route by ID
- Cache-only: never triggers a scrape
- Returns flat JSON: `{ next, in_minutes, station, route }`

## Server Architecture

### Single-Process Serving (`server/index.ts`)

In production, `Bun.serve()` handles both:
1. `/api/*` routes dispatched to handler modules via sequential `??` chain
2. All other paths serve from `dist/` (Vite build output), with SPA fallback to `index.html`

In development, Vite runs on :5173 with a proxy to :4200 for API calls.

### Handler Pattern

Each route handler file exports a single async function:
```
(req: Request, url: URL) => Promise<Response | null>
```
Returns `Response` if it handles the request, `null` to pass to the next handler. The server chains them with nullish coalescing (`??`).

## Styling

- Tailwind CSS with a custom indigo primary color (`#6366f1`)
- shadcn/ui components: manually created (not via CLI), minimal set -- Button, Card, Input, Select, Badge, Skeleton
- `cn()` utility from `src/lib/utils.ts` merges Tailwind classes via `clsx` + `tailwind-merge`
- No dark mode (hardcoded light theme)

## PWA Strategy

- **App shell**: Cache-first via service worker. HTML, JS, CSS cached on install.
- **API responses**: Network-first with cache fallback. GET requests cached for offline use.
- **Manifest**: Standalone display mode, indigo theme, SVG icon.

## Route ID Convention

Route IDs are composite slugs: `{routeNumber}-{stationSlug}-{direction}` (e.g., `23b-4-intors`). Station slugs come from the RATBV URL pattern: `line_{routeNumber}_{stationSlug}_cl{class}_ro.html`.

## Two-Phase "Add Route" Flow

1. **`POST /api/scrape-line`** -- takes a `masterUrl`, returns `{ lineName, stations[] }` for the user to pick from
2. **`POST /api/routes`** -- saves the chosen `Route` object (constructed client-side from the selection)

The wizard UI at `/add-line` (`src/pages/AddLinePage.tsx`) drives this flow with step 1 (scrape) then step 2 (pick station + direction).
