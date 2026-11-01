import type { LatLng } from './types'

export type RegionGroup =
  | 'Albion'
  | 'Albion dungeons'
  | 'Hibernia'
  | 'Hibernia dungeons'
  | 'Midgard'
  | 'Midgard dungeons'
  | 'Frontiers'
  | 'Atlantis'
  | 'Atlantis dungeons'
  | 'Housing'
  | 'Battlegrounds'

export interface RegionDefinition {
  // Key tying everything together: the store's `region` and the generated
  // data file name in public/data/.
  name: string
  label: string
  group: RegionGroup
  tiles: string
  // Highest zoom level with tiles; Leaflet upscales them beyond it.
  maxNativeZoom: number
  // Size in map units of the drawn area from the map's top-left corner, when
  // much smaller than the 256 units of a zoom 0 tile (used for thumbnails).
  extent?: number
  // DOL RegionID and calibration: game coordinates (X, Y) map to the tiles as
  // `lng = X / scale + offset[0]` and `lat = -(Y / scale + offset[1])`.
  // Absent for maps shown without DOL data.
  dol?: { region: number; scale: number; offset: readonly [number, number] }
  // Names of the DOL zones drawn on the tiles, when the region has others
  // (entities in those are dropped). Maps built by `npm run import-cartographe`
  // are assembled from exactly these zones.
  drawnZones?: readonly string[]
  // DAoC Cartographe floor plan (file name without extension) the tiles are built from.
  plan?: string
  // Camelot Insider zone map (e.g. 'zone249') the tiles are built from.
  zoneMap?: string
  // DOL RegionID of a map without calibration, so entrances can still lead to it.
  dolRegion?: number
  // Capitals drawn on this map, each in a zone square of its own.
  drawnCities?: readonly DrawnCity[]
}

// A dungeon shown whole as a 256-unit map from the game's zone map published
// by Camelot Insider (https://camelotinsider.github.io, zones library). The
// image is resampled to 1024 px (native zoom 2). `fit` is its calibration,
// found like plan()'s and checked by overlaying mobs and exits, in pixels of
// the image resized to 512 px: game units per pixel, then the game X and Y of
// the top-left pixel.
function zoneMap<const N extends string>(name: N, label: string, group: RegionGroup, zone: string, dolRegion: number, fit?: readonly [number, number, number]) {
  const tiles = `/maps/zones/${zone}/tiles/{z}/{x}/{y}.png`
  if (!fit) return { name, label, group, tiles, maxNativeZoom: 2, zoneMap: zone, dolRegion }
  // 512 px are 256 map units: 2 px per map unit.
  const scale = fit[0] * 2
  return { name, label, group, tiles, maxNativeZoom: 2, zoneMap: zone, dol: { region: dolRegion, scale, offset: [-fit[1] / scale, -fit[2] / scale] as const } }
}

// A capital is a DOL region of its own, drawn on its realm's classic map as
// the game's current zone map, filling a zone square. DOL's coordinates for
// the city are about 6 times smaller than that drawing (the city fits in
// ~10k game units), so each capital has its own calibration onto the map,
// used to place its NPCs and for /loc inside its square.
export interface DrawnCity {
  region: number
  // Map bounds of the zone square it's drawn in: the city's entities outside it are dropped.
  bounds: readonly [LatLng, LatLng]
  scale: number
  offset: readonly [number, number]
}

// A capital drawn in the square at zone offset `cell` of a map calibrated with
// `host`. `fit` was found by matching the city's DOL mob and NPC positions to
// the drawing's silhouette at zoom 4 (16 px per map unit): game units per
// pixel, then the game X and Y of the square's top-left pixel. It's checked by
// the city's exits, which land on the gates drawn on the city wall.
function drawnCity(region: number, host: { offset: readonly [number, number] }, cell: readonly [number, number], fit: readonly [number, number, number]): DrawnCity {
  // Rounded like toMap(), to keep float noise out of the generated data.
  const left = Math.round((cell[0] * 4 + host.offset[0]) * 100) / 100
  const top = Math.round((cell[1] * 4 + host.offset[1]) * 100) / 100
  const scale = fit[0] * 16
  return { region, bounds: [[-top, left], [-(top + 32), left + 32]], scale, offset: [left - fit[1] / scale, top - fit[2] / scale] }
}

const ALBION_CLASSIC = { region: 1, scale: 2048, offset: [-140.4, -180.2] } as const
const HIBERNIA_CLASSIC = { region: 200, scale: 2048, offset: [-108.0, -204.0] } as const
const MIDGARD_CLASSIC = { region: 100, scale: 2048, offset: [-282.0, -311.6] } as const

// A DAoC Cartographe floor plan of a dungeon, shown whole as a
// 256-unit map. `fit` is its calibration, found by matching DOL mob positions
// to the plan's floors: game units per plan pixel, then the game X and Y of
// the top-left pixel. Plans without a reliable fit are shown without DOL data.
function plan<const N extends string>(name: N, label: string, group: RegionGroup, file: string, dolRegion?: number, fit?: readonly [number, number, number], pixels = 1024) {
  const maxNativeZoom = Math.log2(pixels / 256)
  const tiles = `/maps/plans/${file.toLowerCase()}/tiles/{z}/{x}/{y}.png`
  if (dolRegion === undefined || !fit) return { name, label, group, tiles, maxNativeZoom, plan: file, dolRegion }
  // Plan pixels are map units * 2^maxNativeZoom.
  const scale = fit[0] * 2 ** maxNativeZoom
  return { name, label, group, tiles, maxNativeZoom, plan: file, dol: { region: dolRegion, scale, offset: [-fit[1] / scale, -fit[2] / scale] as const } }
}

// Adding a map means adding an entry here and re-running `npm run import-dol`.
//
// The first seven maps were calibrated against zone outlines, dungeon entrances
// and drawn terrain; Midgard-SI tiles are drawn at twice the scale of the others.
// The others are assembled zone by zone from DAoC Cartographe maps (scripts/
// import-cartographe.ts), so their offset follows from their top-left zone:
// a zone offset unit (8192 game units) is 4 map units.
const DEFINITIONS = [
  { name: 'Albion-Classic', label: 'Albion · Classic', group: 'Albion', tiles: '/maps/albion/classic/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dol: ALBION_CLASSIC, drawnCities: [drawnCity(10, ALBION_CLASSIC, [59, 61], [20.574, 30147, 21695])] },
  { name: 'Albion-SI', label: 'Albion · Shrouded Isles', group: 'Albion', tiles: '/maps/albion/SI/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dol: { region: 51, scale: 2048, offset: [-112.0, -174.6] } },
  { name: 'Hibernian-Classic', label: 'Hibernia · Classic', group: 'Hibernia', tiles: '/maps/hibernian/classic/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dol: HIBERNIA_CLASSIC, drawnCities: [drawnCity(201, HIBERNIA_CLASSIC, [31, 59], [30.584, 19679, 24187])] },
  { name: 'Hibernian-SI', label: 'Hibernia · Shrouded Isles', group: 'Hibernia', tiles: '/maps/hibernian/SI/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dol: { region: 181, scale: 2048, offset: [-126.3, -80.1] } },
  { name: 'Midgard-Classic', label: 'Midgard · Classic', group: 'Midgard', tiles: '/maps/midgard/classic/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dol: MIDGARD_CLASSIC, drawnCities: [drawnCity(101, MIDGARD_CLASSIC, [96, 90], [20.913, 27027, 26664])] },
  { name: 'Midgard-SI', label: 'Midgard · Shrouded Isles', group: 'Midgard', tiles: '/maps/midgard/SI/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dol: { region: 151, scale: 1024, offset: [-240.3, -238.7] } },
  { name: 'Frontiers', label: 'New Frontiers', group: 'Frontiers', tiles: '/maps/frontiers/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dol: { region: 163, scale: 2048, offset: [-174.2, -144.0] } },

  // The three Atlantis regions (one per realm) share the same zones and tiles.
  ...(
    [
      ['Albion', 73],
      ['Midgard', 30],
      ['Hibernia', 130],
    ] as const
  ).map(([realm, dolRegion]) => ({
    name: `Atlantis-${realm}`,
    label: `Atlantis · ${realm}`,
    group: 'Atlantis',
    tiles: '/maps/atlantis/tiles/{z}/{x}/{y}.png',
    maxNativeZoom: 4,
    dol: { region: dolRegion, scale: 2048, offset: [-112, -192] },
    drawnZones: ['Arbor Glen', 'Ashen Isles', 'Green Glades', 'Land of Atum', 'Mesothalassa', 'Oceanus Anatole', 'Oceanus Boreal', 'Oceanus Hesperos', 'Oceanus Notos', 'Stygian Delta', "Typhon's Reach"],
  }) as const),
  { name: 'Ruins-of-Atlantis-Albion', label: 'Ruins of Atlantis · Albion', group: 'Atlantis', tiles: '/maps/atlantis-ruins/albion/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 70, scale: 2048, offset: [-256, -256] }, extent: 32, drawnZones: ['Ruins of Atlantis'] },
  { name: 'Ruins-of-Atlantis-Midgard', label: 'Ruins of Atlantis · Midgard', group: 'Atlantis', tiles: '/maps/atlantis-ruins/midgard/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 71, scale: 2048, offset: [-256, -256] }, extent: 32, drawnZones: ['Ruinerar av Atlantis'] },
  { name: 'Ruins-of-Atlantis-Hibernia', label: 'Ruins of Atlantis · Hibernia', group: 'Atlantis', tiles: '/maps/atlantis-ruins/hibernia/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 72, scale: 2048, offset: [-256, -256] }, extent: 32, drawnZones: ['Scrios de Atlantis'] },

  // Housing regions also have three later zones that DAoC Cartographe doesn't draw.
  { name: 'Housing-Albion', label: 'Housing · Albion', group: 'Housing', tiles: '/maps/housing/albion/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 2, scale: 2048, offset: [-224, -224] }, extent: 96, drawnZones: ['Aylesbury', 'Brisworthy', 'Caerwent', 'Dalton', 'Old Sarum', 'Rilan'] },
  { name: 'Housing-Midgard', label: 'Housing · Midgard', group: 'Housing', tiles: '/maps/housing/midgard/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 102, scale: 2048, offset: [-256, -224] }, extent: 96, drawnZones: ['Arothi', 'Carlingford', 'Erikstaad', 'Frisia', 'Kaupang', 'Wyndham'] },
  { name: 'Housing-Hibernia', label: 'Housing · Hibernia', group: 'Housing', tiles: '/maps/housing/hibernia/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 202, scale: 2048, offset: [-224, -256] }, extent: 96, drawnZones: ['Aberillan', 'Dunshire', 'Kilcullen', 'Meath', 'Saeranthal', 'Torrylin'] },

  { name: 'Proving-Grounds', label: 'The Proving Grounds (1–4)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/proving-grounds/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 234, scale: 2048, offset: [-256, -256] }, extent: 32, drawnZones: ['The Proving Grounds'] },
  { name: 'Lions-Den', label: "The Lion's Den (5–9)", group: 'Battlegrounds', tiles: '/maps/battlegrounds/lions-den/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 235, scale: 2048, offset: [-256, -256] }, extent: 32, drawnZones: ['The Lions Den'] },
  { name: 'Hills-of-Claret', label: 'The Hills of Claret (10–14)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/hills-of-claret/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 236, scale: 2048, offset: [-256, -256] }, extent: 32, drawnZones: ['The Hills of Claret'] },
  { name: 'Killaloe', label: 'Killaloe (15–19)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/killaloe/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 237, scale: 2048, offset: [-256, -256] }, extent: 32, drawnZones: ['Killaloe'] },
  { name: 'Thidranki', label: 'Thidranki (20–24)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/thidranki/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 238, scale: 2048, offset: [-256, -256] }, extent: 32, drawnZones: ['Thidranki'] },
  { name: 'Braemar', label: 'Braemar (25–29)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/braemar/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 239, scale: 2048, offset: [-256, -256] }, extent: 32, drawnZones: ['Braemar'] },
  { name: 'Wilton', label: 'Wilton (30–34)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/wilton/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 240, scale: 2048, offset: [-256, -256] }, extent: 32, drawnZones: ['Wilton'] },
  { name: 'Molvik', label: 'Molvik (35–39)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/molvik/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 241, scale: 2048, offset: [-256, -256] }, extent: 32, drawnZones: ['Molvik'] },
  { name: 'Leirvik', label: 'Leirvik (40–44)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/leirvik/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dol: { region: 242, scale: 2048, offset: [-128, -128] }, extent: 32, drawnZones: ['Leirvik'] },
  // Dungeons: the game's zone maps from Camelot Insider where they could be
  // calibrated or have no better source, DAoC Cartographe plans otherwise.
  // See zoneMap() and plan() for `fit`.
  zoneMap('Catacombs-of-Cardova', 'Catacombs of Cardova', 'Albion dungeons', 'zone023', 23, [33.842, 23147, 28206]),
  zoneMap('Tepoks-Mine', "Tepok's Mine", 'Albion dungeons', 'zone024', 24, [21.188, 28617, 24529]),
  zoneMap('Tomb-of-Mithra', 'Tomb of Mithra', 'Albion dungeons', 'zone021', 21, [26.567, 20687, 25969]),
  zoneMap('Keltoi-Fogou', 'Keltoi Fogou', 'Albion dungeons', 'zone022', 22, [15.192, 29928, 27959]),
  zoneMap('Stonehenge-Barrows', 'Stonehenge Barrows', 'Albion dungeons', 'zone019', 20, [24.882, 24783, 21768]),
  zoneMap('Caer-Sidi', 'Caer Sidi', 'Albion dungeons', 'zone060', 60, [39.82, 21314, 23866]),
  zoneMap('Krondon', 'Krondon', 'Albion dungeons', 'zone061', 61, [104.053, 10185, 17810]),
  zoneMap('Avalon-City', 'Avalon City', 'Albion dungeons', 'zone050', 50, [67.436, 14554, 17810]),
  zoneMap('Brimstone-Caverns', 'Brimstone Caverns', 'Albion dungeons', 'zone339', 339, [87.568, 10279, 9315]),
  zoneMap('Roman-Aqueducts', 'Roman Aqueducts', 'Albion dungeons', 'zone063', 63, [61.976, 13371, 15504]),
  // The three Abandoned Mines share one map; DOL's Albion and Midgard copies don't fit it.
  zoneMap('Abandoned-Mines-Albion', "Albion's Abandoned Mines", 'Albion dungeons', 'zone227', 227),
  zoneMap('Crystal-Cave', 'Crystal Cave', 'Albion dungeons', 'zone062', 62),
  zoneMap('Coruscating-Mine', 'Coruscating Mine', 'Hibernia dungeons', 'zone220', 220, [26.319, 26082, 21818]),
  zoneMap('Fomor', 'Fomor', 'Hibernia dungeons', 'zone180', 180, [32.796, 24717, 21873]),
  zoneMap('Galladoria', 'Galladoria', 'Hibernia dungeons', 'zone191', 191, [80.228, 17748, 26125]),
  // Camelot Insider's Muire Tomb is an annotated community map that can't be calibrated.
  plan('Muire-Tomb', 'Muire Tomb', 'Hibernia dungeons', 'D_Hib_04', 221, [13.899, 26562, 26744]),
  zoneMap('Koalinth-Caverns', 'Koalinth Caverns', 'Hibernia dungeons', 'zone223', 223, [29.475, 24822, 24534]),
  zoneMap('Spraggon-Den', 'Spraggon Den', 'Hibernia dungeons', 'zone222', 222, [23.725, 26101, 25518]),
  zoneMap('Treibh-Caillte', 'Treibh Caillte', 'Hibernia dungeons', 'zone224', 224, [22.671, 25676, 24352]),
  zoneMap('Tur-Suil', 'Tur Suil', 'Hibernia dungeons', 'zone190', 190),
  zoneMap('Abandoned-Mines-Hibernia', "Hibernia's Abandoned Mines", 'Hibernia dungeons', 'zone228', 228, [83.381, 10072, 9659]),
  zoneMap('Veil-Rift', 'Veil Rift', 'Hibernia dungeons', 'zone092', 92),
  zoneMap('Nisses-Lair', "Nisse's Lair", 'Midgard dungeons', 'zone129', 129, [27.826, 25455, 27698]),
  zoneMap('Vendo-Caverns', 'Vendo Caverns', 'Midgard dungeons', 'zone126', 126, [15.851, 25471, 28193]),
  zoneMap('Spindelhalla', 'Spindelhalla', 'Midgard dungeons', 'zone125', 125, [20.863, 26808, 26259]),
  zoneMap('Varulvhamn', 'Varulvhamn', 'Midgard dungeons', 'zone127', 127, [38.842, 15854, 19350]),
  zoneMap('Tuscaran-Glacier', 'Tuscaran Glacier', 'Midgard dungeons', 'zone160', 160, [104.494, 9411, 12283]),
  zoneMap('Trollheim', 'Trollheim', 'Midgard dungeons', 'zone150', 150, [89.907, 11417, 8126]),
  zoneMap('Iarnvidiurs-Lair', "Iarnvidiur's Lair", 'Midgard dungeons', 'zone161', 161, [29.118, 483512, 28009]),
  zoneMap('Cursed-Tomb', 'Cursed Tomb', 'Midgard dungeons', 'zone128', 128, [15.313, 29889, 27919]),
  zoneMap('Burial-Grounds', 'Burial Grounds', 'Midgard dungeons', 'zone229', 229, [70.05, 19930, 10529]),
  zoneMap('Abandoned-Mines-Midgard', "Midgard's Abandoned Mines", 'Midgard dungeons', 'zone226', 226),
  zoneMap('Darkness-Falls', 'Darkness Falls', 'Frontiers', 'zone249', 249, [85.447, 8084, 8814]),
  zoneMap('Demons-Breach', "Demon's Breach", 'Frontiers', 'zone489', 489, [53.858, 13722, 30668]),
  // Camelot Insider's Passage of Conflict is annotated, and it has no Summoner's Hall.
  plan('Passage-of-Conflict', 'Passage of Conflict', 'Frontiers', '244', 244, [44.11, 11649, 11815]),
  plan('Summoners-Hall', "Summoner's Hall", 'Frontiers', '233', 233, [58.461, 15785, 21982], 512),
  // Atlantis dungeons exist once per realm. Camelot Insider only has the
  // Midgard copies; City of Aerus's sky background defeats calibration there.
  zoneMap('Halls-of-Maati', "Halls of Ma'ati", 'Atlantis dungeons', 'zone083', 83, [78.335, 12043, 20445]),
  plan('City-of-Aerus', 'City of Aerus', 'Atlantis dungeons', 'Daerus', 47, [44.862, 2109, 10131]),
  zoneMap('Temple-of-Twilight', 'Temple of Twilight', 'Atlantis dungeons', 'zone080', 80, [85.891, 26132, 8742]),
  zoneMap('Sobekite-Eternal', 'Sobekite Eternal', 'Atlantis dungeons', 'zone079', 79, [72.313, 16272, 9738]),
  zoneMap('Deep-Volcanus', 'Deep Volcanus', 'Atlantis dungeons', 'zone089', 89),
  plan('Celestius', 'Celestius', 'Atlantis dungeons', 'Dcelestius', 91, undefined, 512),
  plan('Great-Pyramid', 'Great Pyramid of Stygia', 'Atlantis dungeons', 'Dpyramid', 45, undefined, 512),
  plan('Cetus-Pit', "Cetus' Pit", 'Atlantis dungeons', 'Dcitus_pit', 35, undefined, 512),
] as const satisfies readonly RegionDefinition[]

export type RegionName = (typeof DEFINITIONS)[number]['name']
export type Region = RegionDefinition & { name: RegionName }

export const REGIONS: readonly Region[] = DEFINITIONS

export const DEFAULT_REGION: RegionName = 'Albion-Classic'

export function isRegionName(name: string): name is RegionName {
  return REGIONS.some((r) => r.name === name)
}

export function getRegion(name: RegionName): Region {
  return REGIONS.find((r) => r.name === name)!
}

// Top-left tile at the zoom where the drawn area best fills one tile.
export function thumbnailUrl(region: Region): string {
  const zoom = Math.min(region.maxNativeZoom, Math.max(0, Math.floor(Math.log2(256 / (region.extent ?? 256)))))
  return region.tiles.replace('{z}/{x}/{y}', `${zoom}/0/0`)
}

// Converts DOL game coordinates to map coordinates, rounded to 1/100 of a map unit.
// Game coordinates -> map coordinates of a region: a map's `dol`, or a drawn city.
export type Calibration = { scale: number; offset: readonly [number, number] }

export function toMap(dol: Calibration, x: number, y: number): LatLng {
  const round = (v: number) => Math.round(v * 100) / 100
  return [round(-(y / dol.scale + dol.offset[1])), round(x / dol.scale + dol.offset[0])]
}

// Inverse of toMap: DOL game coordinates of a map point, rounded to game units.
export function toGame(dol: Calibration, [lat, lng]: LatLng): [number, number] {
  return [Math.round((lng - dol.offset[0]) * dol.scale), Math.round((-lat - dol.offset[1]) * dol.scale)]
}
