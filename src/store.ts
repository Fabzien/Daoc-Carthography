import { create } from 'zustand'
import { DEFAULT_REGION, type RegionName } from './data/regions'

interface MapState {
  region: RegionName
  setRegion: (region: RegionName) => void
}

export const useMapStore = create<MapState>()((set) => ({
  region: DEFAULT_REGION,
  setRegion: (region) => set({ region }),
}))
