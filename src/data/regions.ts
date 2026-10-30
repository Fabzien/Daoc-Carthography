import type { LatLng } from './types'

export type RegionGroup = 'Albion' | 'Hibernia' | 'Midgard' | 'Frontiers' | 'Atlantis' | 'Housing' | 'Battlegrounds'

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
  // DOL RegionID. Game coordinates (X, Y) map to the tiles as
  // `lng = X / scale + offset[0]` and `lat = -(Y / scale + offset[1])`.
  dolRegion: number
  scale: number
  offset: readonly [number, number]
  // Names of the DOL zones drawn on the tiles, when the region has others
  // (entities in those are dropped). Maps built by `npm run import-cartographe`
  // are assembled from exactly these zones.
  drawnZones?: readonly string[]
}

// Adding a map means adding an entry here and re-running `npm run import-dol`.
//
// The first seven maps were calibrated against zone outlines, dungeon entrances
// and drawn terrain; Midgard-SI tiles are drawn at twice the scale of the others.
// The others are assembled zone by zone from DAoC Cartographe maps (scripts/
// import-cartographe.ts), so their offset follows from their top-left zone:
// a zone offset unit (8192 game units) is 4 map units.
const DEFINITIONS = [
  { name: 'Albion-Classic', label: 'Albion · Classic', group: 'Albion', tiles: '/maps/albion/classic/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dolRegion: 1, scale: 2048, offset: [-140.4, -180.2] },
  { name: 'Albion-SI', label: 'Albion · Shrouded Isles', group: 'Albion', tiles: '/maps/albion/SI/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dolRegion: 51, scale: 2048, offset: [-112.0, -174.6] },
  { name: 'Hibernian-Classic', label: 'Hibernia · Classic', group: 'Hibernia', tiles: '/maps/hibernian/classic/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dolRegion: 200, scale: 2048, offset: [-108.0, -204.0] },
  { name: 'Hibernian-SI', label: 'Hibernia · Shrouded Isles', group: 'Hibernia', tiles: '/maps/hibernian/SI/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dolRegion: 181, scale: 2048, offset: [-126.3, -80.1] },
  { name: 'Midgard-Classic', label: 'Midgard · Classic', group: 'Midgard', tiles: '/maps/midgard/classic/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dolRegion: 100, scale: 2048, offset: [-282.0, -311.6] },
  { name: 'Midgard-SI', label: 'Midgard · Shrouded Isles', group: 'Midgard', tiles: '/maps/midgard/SI/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dolRegion: 151, scale: 1024, offset: [-240.3, -238.7] },
  { name: 'Frontiers', label: 'New Frontiers', group: 'Frontiers', tiles: '/maps/frontiers/tiles/{z}/{x}/{y}.png', maxNativeZoom: 7, dolRegion: 163, scale: 2048, offset: [-174.2, -144.0] },

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
    dolRegion,
    scale: 2048,
    offset: [-112, -192],
    drawnZones: ['Arbor Glen', 'Ashen Isles', 'Green Glades', 'Land of Atum', 'Mesothalassa', 'Oceanus Anatole', 'Oceanus Boreal', 'Oceanus Hesperos', 'Oceanus Notos', 'Stygian Delta', "Typhon's Reach"],
  }) as const),
  { name: 'Ruins-of-Atlantis-Albion', label: 'Ruins of Atlantis · Albion', group: 'Atlantis', tiles: '/maps/atlantis-ruins/albion/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 70, scale: 2048, offset: [-256, -256], extent: 32, drawnZones: ['Ruins of Atlantis'] },
  { name: 'Ruins-of-Atlantis-Midgard', label: 'Ruins of Atlantis · Midgard', group: 'Atlantis', tiles: '/maps/atlantis-ruins/midgard/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 71, scale: 2048, offset: [-256, -256], extent: 32, drawnZones: ['Ruinerar av Atlantis'] },
  { name: 'Ruins-of-Atlantis-Hibernia', label: 'Ruins of Atlantis · Hibernia', group: 'Atlantis', tiles: '/maps/atlantis-ruins/hibernia/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 72, scale: 2048, offset: [-256, -256], extent: 32, drawnZones: ['Scrios de Atlantis'] },

  // Housing regions also have three later zones that DAoC Cartographe doesn't draw.
  { name: 'Housing-Albion', label: 'Housing · Albion', group: 'Housing', tiles: '/maps/housing/albion/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 2, scale: 2048, offset: [-224, -224], extent: 96, drawnZones: ['Aylesbury', 'Brisworthy', 'Caerwent', 'Dalton', 'Old Sarum', 'Rilan'] },
  { name: 'Housing-Midgard', label: 'Housing · Midgard', group: 'Housing', tiles: '/maps/housing/midgard/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 102, scale: 2048, offset: [-256, -224], extent: 96, drawnZones: ['Arothi', 'Carlingford', 'Erikstaad', 'Frisia', 'Kaupang', 'Wyndham'] },
  { name: 'Housing-Hibernia', label: 'Housing · Hibernia', group: 'Housing', tiles: '/maps/housing/hibernia/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 202, scale: 2048, offset: [-224, -256], extent: 96, drawnZones: ['Aberillan', 'Dunshire', 'Kilcullen', 'Meath', 'Saeranthal', 'Torrylin'] },

  { name: 'Proving-Grounds', label: 'The Proving Grounds (1–4)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/proving-grounds/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 234, scale: 2048, offset: [-256, -256], extent: 32, drawnZones: ['The Proving Grounds'] },
  { name: 'Lions-Den', label: "The Lion's Den (5–9)", group: 'Battlegrounds', tiles: '/maps/battlegrounds/lions-den/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 235, scale: 2048, offset: [-256, -256], extent: 32, drawnZones: ['The Lions Den'] },
  { name: 'Hills-of-Claret', label: 'The Hills of Claret (10–14)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/hills-of-claret/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 236, scale: 2048, offset: [-256, -256], extent: 32, drawnZones: ['The Hills of Claret'] },
  { name: 'Killaloe', label: 'Killaloe (15–19)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/killaloe/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 237, scale: 2048, offset: [-256, -256], extent: 32, drawnZones: ['Killaloe'] },
  { name: 'Thidranki', label: 'Thidranki (20–24)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/thidranki/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 238, scale: 2048, offset: [-256, -256], extent: 32, drawnZones: ['Thidranki'] },
  { name: 'Braemar', label: 'Braemar (25–29)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/braemar/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 239, scale: 2048, offset: [-256, -256], extent: 32, drawnZones: ['Braemar'] },
  { name: 'Wilton', label: 'Wilton (30–34)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/wilton/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 240, scale: 2048, offset: [-256, -256], extent: 32, drawnZones: ['Wilton'] },
  { name: 'Molvik', label: 'Molvik (35–39)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/molvik/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 241, scale: 2048, offset: [-256, -256], extent: 32, drawnZones: ['Molvik'] },
  { name: 'Leirvik', label: 'Leirvik (40–44)', group: 'Battlegrounds', tiles: '/maps/battlegrounds/leirvik/tiles/{z}/{x}/{y}.png', maxNativeZoom: 4, dolRegion: 242, scale: 2048, offset: [-128, -128], extent: 32, drawnZones: ['Leirvik'] },
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
export function toMap(region: Region, x: number, y: number): LatLng {
  const round = (v: number) => Math.round(v * 100) / 100
  return [round(-(y / region.scale + region.offset[1])), round(x / region.scale + region.offset[0])]
}
