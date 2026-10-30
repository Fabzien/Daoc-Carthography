import { create } from 'zustand'
import { fetchMobs } from './api/mobs'
import { DEFAULT_REGION, type RegionName } from './data/regions'
import type { Mob } from './data/types'

interface MapState {
  region: RegionName
  userInput: string
  mobs: Mob[]
  setRegion: (region: RegionName) => void
  setUserInput: (value: string) => void
  search: () => Promise<void>
}

export const useMapStore = create<MapState>()((set, get) => ({
  region: DEFAULT_REGION,
  userInput: '',
  mobs: [],
  // Mob results belong to one region, so they are cleared when it changes.
  setRegion: (region) => set({ region, mobs: [] }),
  setUserInput: (userInput) => set({ userInput }),
  search: async () => {
    const { userInput, region } = get()
    try {
      const mobs = await fetchMobs(userInput, region)
      // Ignore results that arrive after the user switched maps.
      if (get().region === region) set({ mobs })
    } catch (error) {
      console.error(error)
    }
  },
}))
