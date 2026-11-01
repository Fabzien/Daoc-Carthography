# DAoC Carthography

An interactive, Google Maps-like map of the [Dark Age of Camelot](https://www.darkageofcamelot.com/) world:
every realm, the frontiers, Atlantis, housing, battlegrounds and dungeons, with their mobs, bosses, NPCs,
horse routes and dungeon entrances.

**[Open the map →](https://fabzien.github.io/Daoc-Carthography/)**

## Features

- **Search** mobs, NPCs, dungeons, zones and routes by name, or an NPC by title ("armor merchant").
- **Filter mobs by level**: type a range and only those mobs remain on the map.
- **Bosses always visible**: epic encounters (the realm dragons, Apocalypse, Queen Kula…) and named bosses.
- **Stable masters**: select one to see every route leaving from them and where it leads (horse, dragonfly, boat).
- **Dungeon entrances**: click one to open the dungeon's map; click the exit to come back out.
- **In-game coordinates**: the zone and `/loc` under the cursor, and coordinate search
  (`27323, 8475`, `Camelot Hills 27323 8475`, or a pasted `/loc` line).
- **Layers** to toggle: mobs (grouped into bubbles when zoomed out), bosses, NPCs (with a legend that filters by role),
  dungeon entrances, routes, bind points.

Positions come from the database of a server emulator and from the calibration of each map: they may be inaccurate,
or differ from the live game.

## Maps

| Group | Maps |
|---|---|
| Albion, Hibernia, Midgard | Classic and Shrouded Isles, with Camelot, Tír na Nóg and Jordheim drawn in place |
| Frontiers | New Frontiers, Darkness Falls, Demon's Breach, Passage of Conflict, Summoner's Hall |
| Trials of Atlantis | Atlantis (one per realm), the Ruins of Atlantis, the Atlantis dungeons |
| Dungeons | 45 maps: realm dungeons and the Catacombs dungeons (Abandoned Mines, Brimstone Caverns, Roman Aqueducts, Burial Grounds…) |
| Housing | Albion, Hibernia, Midgard |
| Battlegrounds | The Proving Grounds, The Lion's Den, The Hills of Claret, Killaloe, Thidranki, Braemar, Wilton, Molvik, Leirvik |

A few dungeons (Tur Suil, Veil Rift, two of the Abandoned Mines, and those with almost no spawns in the database)
are shown as maps only, without mobs.

## Data sources and credits

- **Mobs, NPCs, routes, entrances, bind points**: the [Dawn of Light](https://github.com/Dawn-of-Light/DOLSharp)
  server emulator's public database, [Eve-of-Darkness/db-public](https://github.com/Eve-of-Darkness/db-public) (MIT).
- **Most dungeon maps and Jordheim**: the zones library of
  [Camelot Insider](https://camelotinsider.github.io/zones_library.html).
- **Atlantis, housing, battlegrounds and a few dungeon plans**: DAoC Cartographe 2.52, freeware by Tixu (2006),
  recovered from the Wayback Machine.
- Dark Age of Camelot is a trademark of its owners; the maps are drawn from the game.

## Development

Requires Node.js 22.18+. Built with Vite, React 19, TypeScript, react-leaflet and Zustand.

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # Vitest
npm run lint
npm run build        # production build into dist/
```

The map data and some tiles are generated, then committed:

```bash
npm run import-dol             # public/data/ from the latest db-public release (~180 MB download, cached in .cache/)
npm run import-cartographe     # Atlantis, housing, battleground tiles and a few dungeon plans
npm run import-camelotinsider  # dungeon tiles and Jordheim's drawing
```

`import-dol` takes `-- --release <n>` for a given release, or `-- --data <dir>` for a local folder of its JSON tables.

## Deployment

Every push to `master` is checked (lint, tests) and published to GitHub Pages by `.github/workflows/deploy.yml`.
Other branches and pull requests run the same checks in `.github/workflows/ci.yml`.
One-time setup: in the repository's **Settings → Pages**, set **Source** to **GitHub Actions**.

To try a build under the Pages path locally:

```bash
BASE_PATH=/Daoc-Carthography/ npm run build
BASE_PATH=/Daoc-Carthography/ npx vite preview   # http://localhost:4173/Daoc-Carthography/
```

## Contributing

Suggestions and pull requests are welcome: open an issue for a missing map, a wrong position or a feature idea.
Ideas on the list: mob drops, merchant inventories, quests, mob colors relative to your level,
and importing a freeshard's own database.

## License

The source code is available under the [MIT license](LICENSE).
