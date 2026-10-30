import type { LatLng } from './types'

// The region name is the key tying everything together: it is the base layer
// name shown in the layers control, the store's `region`, and the name of the
// generated data file in public/data/. Adding a map means adding one entry here
// and re-running `npm run import-dol`.
//
// `dolRegion` is the DOL RegionID. Game coordinates (X, Y) map to the tiles as
// `lng = X / scale + offset[0]` and `lat = -(Y / scale + offset[1])`. The values
// were calibrated against zone outlines, dungeon entrances and drawn terrain;
// Midgard-SI tiles are drawn at twice the scale of the others.
export const REGIONS = [
  { name: 'Albion-Classic', tiles: '/maps/albion/classic/tiles/{z}/{x}/{y}.png', dolRegion: 1, scale: 2048, offset: [-140.4, -180.2] },
  { name: 'Albion-SI', tiles: '/maps/albion/SI/tiles/{z}/{x}/{y}.png', dolRegion: 51, scale: 2048, offset: [-112.0, -174.6] },
  { name: 'Hibernian-Classic', tiles: '/maps/hibernian/classic/tiles/{z}/{x}/{y}.png', dolRegion: 200, scale: 2048, offset: [-108.0, -204.0] },
  { name: 'Hibernian-SI', tiles: '/maps/hibernian/SI/tiles/{z}/{x}/{y}.png', dolRegion: 181, scale: 2048, offset: [-126.3, -80.1] },
  { name: 'Midgard-Classic', tiles: '/maps/midgard/classic/tiles/{z}/{x}/{y}.png', dolRegion: 100, scale: 2048, offset: [-282.0, -311.6] },
  { name: 'Midgard-SI', tiles: '/maps/midgard/SI/tiles/{z}/{x}/{y}.png', dolRegion: 151, scale: 1024, offset: [-240.3, -238.7] },
  { name: 'Frontiers', tiles: '/maps/frontiers/tiles/{z}/{x}/{y}.png', dolRegion: 163, scale: 2048, offset: [-174.2, -144.0] },
] as const satisfies readonly { name: string; tiles: string; dolRegion: number; scale: number; offset: readonly [number, number] }[]

export type Region = (typeof REGIONS)[number]
export type RegionName = Region['name']

export const DEFAULT_REGION: RegionName = 'Albion-Classic'

export function isRegionName(name: string): name is RegionName {
  return REGIONS.some((r) => r.name === name)
}

// Converts DOL game coordinates to map coordinates, rounded to 1/100 of a map unit.
export function toMap(region: Region, x: number, y: number): LatLng {
  const round = (v: number) => Math.round(v * 100) / 100
  return [round(-(y / region.scale + region.offset[1])), round(x / region.scale + region.offset[0])]
}
