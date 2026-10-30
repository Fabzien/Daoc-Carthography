import { use } from 'react'
import { buildIndex, type SearchResult } from '../search'
import { useMapStore } from '../store'
import type { RegionName } from './regions'
import type { RegionData } from './types'

const EMPTY: RegionData = { source: '', zones: [], mobs: [], npcs: [], routes: [], entrances: [], bindPoints: [] }

// One request per region for the whole session, shared by every overlay.
const cache = new Map<RegionName, Promise<RegionData>>()
const indexes = new WeakMap<RegionData, SearchResult[]>()

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

// Search index of the current region, built once per region.
export function useSearchIndex(): SearchResult[] {
  const data = useRegionData()
  let index = indexes.get(data)
  if (!index) {
    index = buildIndex(data)
    indexes.set(data, index)
  }
  return index
}
