import server from './server.json'
import { horsesAlbClassic } from './horses'
import type { Entrance, HorseRoute, Zone } from './types'
import { zonesAlbClassic, zonesAlbSI, zonesHibernianClassic } from './zones'

// The region name is the key tying everything together: it is the base layer
// name shown in the layers control, the store's `region`, and the key under
// `World` in server.json. Adding a map means adding one entry here.
export const REGIONS = [
  { name: 'Albion-Classic', tiles: '/maps/albion/classic/tiles/{z}/{x}/{y}.png', zones: zonesAlbClassic, horses: horsesAlbClassic },
  { name: 'Albion-SI', tiles: '/maps/albion/SI/tiles/{z}/{x}/{y}.png', zones: zonesAlbSI },
  { name: 'Hibernian-Classic', tiles: '/maps/hibernian/classic/tiles/{z}/{x}/{y}.png', zones: zonesHibernianClassic },
  { name: 'Hibernian-SI', tiles: '/maps/hibernian/SI/tiles/{z}/{x}/{y}.png' },
  { name: 'Midgard-Classic', tiles: '/maps/midgard/classic/tiles/{z}/{x}/{y}.png' },
  { name: 'Midgard-SI', tiles: '/maps/midgard/SI/tiles/{z}/{x}/{y}.png' },
  { name: 'Frontiers', tiles: '/maps/frontiers/tiles/{z}/{x}/{y}.png' },
] as const satisfies readonly { name: string; tiles: string; zones?: Zone[]; horses?: HorseRoute[] }[]

export type RegionName = (typeof REGIONS)[number]['name']

export const DEFAULT_REGION: RegionName = 'Albion-Classic'

export function isRegionName(name: string): name is RegionName {
  return REGIONS.some((r) => r.name === name)
}

const world = server.World as Partial<Record<RegionName, { Entrances: Entrance[] }>>

export function getRegionData(name: RegionName) {
  const region = REGIONS.find((r) => r.name === name)
  return {
    zones: region && 'zones' in region ? region.zones : [],
    horses: region && 'horses' in region ? region.horses : [],
    entrances: world[name]?.Entrances ?? [],
  }
}
