import { create } from 'zustand'
import { DEFAULT_REGION, type RegionName } from './data/regions'
import { ANY_LEVEL, isAnyLevel, type LevelFilter, type SearchResult } from './search'

export type LayerKey = 'zones' | 'entrances' | 'routes' | 'npcs' | 'mobs' | 'bindPoints'

interface MapState {
  region: RegionName
  layers: Record<LayerKey, boolean>
  query: string
  levels: LevelFilter
  // The result whose locations are highlighted and shown in the place card.
  selected: SearchResult | null
  setRegion: (region: RegionName) => void
  toggleLayer: (layer: LayerKey) => void
  setQuery: (query: string) => void
  setLevels: (levels: LevelFilter) => void
  select: (result: SearchResult | null) => void
}

export const useMapStore = create<MapState>()((set) => ({
  region: DEFAULT_REGION,
  layers: { zones: true, entrances: true, routes: true, npcs: false, mobs: false, bindPoints: false },
  query: '',
  levels: ANY_LEVEL,
  selected: null,
  // A selection belongs to one region's data.
  setRegion: (region) => set({ region, selected: null }),
  toggleLayer: (layer) => set((s) => ({ layers: { ...s.layers, [layer]: !s.layers[layer] } })),
  setQuery: (query) => set({ query }),
  // Filtering by level is about mobs: show them so the filter is visible on the map.
  setLevels: (levels) => set((s) => ({ levels, layers: isAnyLevel(levels) ? s.layers : { ...s.layers, mobs: true } })),
  select: (selected) => set({ selected }),
}))
