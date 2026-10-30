import { use } from 'react'
import { useMapStore } from '../store'
import type { RegionName } from './regions'
import type { RegionData } from './types'

const EMPTY: RegionData = { source: '', zones: [], mobs: [], npcs: [], routes: [], entrances: [], bindPoints: [] }

// One request per region for the whole session, shared by every overlay.
const cache = new Map<RegionName, Promise<RegionData>>()

export function loadRegionData(region: RegionName): Promise<RegionData> {
  let data = cache.get(region)
  if (!data) {
    data = fetch(`/data/${encodeURIComponent(region)}.json`)
      .then((response) => {
        if (!response.ok) throw new Error(`No data for ${region}: HTTP ${response.status} (run npm run import-dol)`)
        return response.json() as Promise<RegionData>
      })
      .catch((error: unknown) => {
        console.error(error)
        return EMPTY
      })
    cache.set(region, data)
  }
  return data
}

// Data of the current region. Suspends while it loads.
export function useRegionData(): RegionData {
  const region = useMapStore((s) => s.region)
  return use(loadRegionData(region))
}
