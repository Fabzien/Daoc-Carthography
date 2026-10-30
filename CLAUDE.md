# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A "Google Maps"-style interactive web map of the Dark Age of Camelot MMORPG world: one map per realm and expansion, with toggleable layers for zones, dungeon entrances, horse/boat routes, NPCs, mobs and bind points generated from the Dawn of Light server emulator's database. It's a Vite + React 19 + TypeScript app using react-leaflet 5 and Zustand. It's fully static: no backend or external API. The demo is hosted on AWS Amplify.

## Commands

Requires Node.js 22.18+.

```bash
npm install
npm run dev          # dev server on http://localhost:3000
npm run build        # tsc -b, then production build into dist/
npm run lint         # ESLint (flat config, eslint.config.js)
npm run typecheck
npm test             # Vitest in watch mode
npx vitest run src/data/regions.test.ts   # single run of one file
npm run import-dol   # regenerate public/data/ (-- --release <n> | -- --data <dir>)
npm run import-cartographe   # regenerate the Cartographe-based tiles (zone mosaics and plans)
```

TypeScript is pinned to 6.0.x because typescript-eslint doesn't support TS 7 yet.

## Architecture

**Map and coordinates.** [src/map/MapView.tsx](src/map/MapView.tsx) renders one `MapContainer` with `CRS.Simple`, so coordinates are plain `[lat, lng]` pixel-space values, not geographic ones. They're mostly negative lat and positive lng, for example `[-83, 80.5]`. Each region is a `LayersControl.BaseLayer` whose `TileLayer` points at pre-rendered tiles in `public/maps/<realm>/<classic|SI>/tiles/{z}/{x}/{y}.png` (zoom 0–7, gdal2tiles-style). Frontiers uses `public/maps/frontiers/tiles/`. The tiles account for nearly all of the ~70k files in the repo.

**Regions and calibration.** [src/data/regions.ts](src/data/regions.ts) is the single source of truth: each map has a `name` (store key and `public/data/<name>.json` file name), `label`, `group` (map picker section), tile URL and `maxNativeZoom`, and an optional `dol` calibration `{ region, scale, offset }` that `toMap()` uses to turn DOL game coordinates into map coordinates (`lng = X/scale + offset[0]`, `lat = -(Y/scale + offset[1])`). Maps without `dol` are shown without DOL data. Three kinds of maps:
- the original seven (pre-rendered tiles), calibrated by hand against zone outlines, dungeon entrances and terrain (Midgard-SI is drawn at double scale); `regions.test.ts` pins them to reference points;
- zone mosaics (`drawnZones`): Atlantis (three realm regions sharing tiles), Ruins of Atlantis, housing, battlegrounds. Built from DAoC Cartographe zone maps placed at their DOL zone offsets, so the offset follows from the top-left zone (a zone offset unit is 4 map units) with no fitting;
- floor plans (`plan`, via the `plan()` helper): capitals and dungeons, one Cartographe image as a 256-unit map. Their `fit` (game units per pixel, game X/Y of the top-left pixel) was found offline by FFT cross-correlation of the region's main group of mob positions with the plan's floor pixels, constrained by mob vs plan extents, then checked by overlaying mobs on each plan. Plans whose fit looked wrong or that have too few mobs have no `fit`.

**Data pipeline.** The map shows data from the Dawn of Light (DOLSharp) server emulator's public database, [Eve-of-Darkness/db-public](https://github.com/Eve-of-Darkness/db-public). `npm run import-dol` ([scripts/import-dol.ts](scripts/import-dol.ts), run directly by Node's type stripping, hence `.ts` import extensions in `scripts/`) downloads a release's JSON tables into `.cache/db-public/<release>/` and writes `public/data/<region>.json` (committed, `RegionData` in [src/data/types.ts](src/data/types.ts)). The pure logic is in [scripts/dol/transform.ts](scripts/dol/transform.ts):
- zones come from the `Zones` table (offsets in units of 8192); only zones drawn on the tiles are kept, and every other entity must fall inside one of them;
- `Mob` rows with realm 0 and no service ClassType are mobs (level from `NpcTemplate` when the spawn has none); the rest are NPCs, classified by ClassType (`npcKind`);
- routes are `PathPoints` paths starting within 1000 units of a stable/boat master (how DOL's `GameStableMaster` links tickets to paths);
- entrances are `ZonePoint` rows leading to another known region, named after it;
- floor plans have no zones (the DOL zone square means nothing on a plan): entities are kept when they fall on the plan.

**Map tiles.** `npm run import-cartographe` ([scripts/import-cartographe.ts](scripts/import-cartographe.ts)) downloads DAoC Cartographe 2.52 from the Wayback Machine (sha256-checked, cached in `.cache/daoc-cartographe/`), decodes its 8-bit BMPs, clears the gray background from the image border, and writes tiles for zoom 0..maxNativeZoom (raster helpers in `scripts/cartographe/raster.ts`). It regenerates every tile folder it owns; the Vite dev server can then serve stale `index.html` for new tiles until restarted.

**Front end.** [src/data/regionData.ts](src/data/regionData.ts) fetches the current region's file once (cached promise) and `useRegionData()` reads it with React 19 `use()` inside `Suspense`; `useSearchIndex()` builds the search index once per region.
- [src/store.ts](src/store.ts) (Zustand) holds the UI state: `region`, visible `layers`, search `query`, mob `levels` filter, and the `selected` result. Setting a level filter turns the mobs layer on.
- [src/search.ts](src/search.ts) is the pure search logic: `buildIndex()` groups entities by name (a mob name has many spawns) into `SearchResult`s with every position; `search()` filters by name/title and level.
- [src/ui/](src/ui/) is the Google Maps-like chrome outside the map: `SearchPanel` (search box, layer chips, level filter, results, place card) and `RegionSwitcher` (bottom-left map picker using each map's zoom-0 tile as thumbnail). `kinds.ts` holds shared colors and labels.
- [src/map/MapView.tsx](src/map/MapView.tsx) renders one `TileLayer` for the store's region (no Leaflet layers control) and the overlays in [src/map/overlays/](src/map/overlays/) whose layer is on. `FitRegion` frames the drawn map on region change; `SelectionController` flies to the selection and clears it on a map click.
- Mobs, NPCs and bind points use `CircleMarkers`, which builds Leaflet circle markers imperatively on the canvas renderer (`preferCanvas`) because there are up to ~16k per region. Clicking one selects its search result by id (`useSelectById`); markers set `bubblingMouseEvents: false` so the map click doesn't clear it. The mobs overlay is narrowed by the query and level filter.
- `SelectionOverlay` draws highlights in its own `selection` pane. That pane's canvas covers the whole map, so it has `pointer-events: none`; without it, nothing below receives hover or clicks.

**Leaflet setup.** `src/leafletSetup.ts` points the default marker icon (used by the dev helper) at bundled assets (Leaflet's CSS-based path detection breaks under bundlers). Leaflet CSS is imported from the package in `main.tsx`.

**Dev helper.** In dev mode (`import.meta.env.DEV`), clicking the map drops a marker whose popup shows its lat/lng. Useful to check calibration.

## Known gaps

- Frontiers calibration comes only from the map's bounding box (routes do follow its rivers); the others are cross-checked by several methods.
- NPC kinds have no legend; their tooltip shows the title or kind.
- Search covers the current map only.
