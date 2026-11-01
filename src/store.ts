import { create } from 'zustand'
import { DEFAULT_REGION, type RegionName } from './data/regions'
import type { LatLng, NpcKind } from './data/types'
import { ANY_LEVEL, isAnyLevel, type LevelFilter, type SearchResult } from './search'

export type LayerKey = 'entrances' | 'routes' | 'npcs' | 'mobs' | 'bosses' | 'bindPoints'

interface MapState {
  region: RegionName
  layers: Record<LayerKey, boolean>
  query: string
  levels: LevelFilter
  // The result whose locations are highlighted and shown in the place card.
  selected: SearchResult | null
  setRegion: (region: RegionName) => void
  // Opens a map through an entrance, selecting the arrival point when known.
  enter: (region: RegionName, arrival?: { pos: LatLng; label: string }) => void
  // Bumped by Enter in the search box: the results list selects its first result.
  submits: number
  submitSearch: () => void
  toggleLayer: (layer: LayerKey) => void
  setQuery: (query: string) => void
  setLevels: (levels: LevelFilter) => void
  // NPC kinds hidden from the map by the NPC legend.
  hiddenNpcKinds: NpcKind[]
  toggleNpcKind: (kind: NpcKind) => void
  showAllNpcKinds: () => void
  select: (result: SearchResult | null) => void
}

export const useMapStore = create<MapState>()((set) => ({
  region: DEFAULT_REGION,
  layers: { entrances: true, routes: true, npcs: false, mobs: false, bosses: true, bindPoints: false },
  query: '',
  levels: ANY_LEVEL,
  selected: null,
  // A selection belongs to one region's data.
  setRegion: (region) => set({ region, selected: null }),
  enter: (region, arrival) =>
    set({
      region,
      selected: arrival ? { id: 'arrival', kind: 'location', name: arrival.label, detail: '', levels: null, positions: [arrival.pos] } : null,
    }),
  submits: 0,
  submitSearch: () => set((s) => ({ submits: s.submits + 1 })),
  toggleLayer: (layer) => set((s) => ({ layers: { ...s.layers, [layer]: !s.layers[layer] } })),
  setQuery: (query) => set({ query }),
  // Filtering by level is about mobs: show them so the filter is visible on the map.
  setLevels: (levels) => set((s) => ({ levels, layers: isAnyLevel(levels) ? s.layers : { ...s.layers, mobs: true } })),
  select: (selected) => set({ selected }),
  hiddenNpcKinds: [],
  toggleNpcKind: (kind) =>
    set((s) => ({ hiddenNpcKinds: s.hiddenNpcKinds.includes(kind) ? s.hiddenNpcKinds.filter((k) => k !== kind) : [...s.hiddenNpcKinds, kind] })),
  showAllNpcKinds: () => set({ hiddenNpcKinds: [] }),
}))
