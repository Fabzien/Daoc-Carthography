import { useCallback } from 'react'
import { useSearchIndex } from '../../data/regionData'
import { useMapStore } from '../../store'

// Selects the search result a clicked map point belongs to.
export function useSelectById(): (id: string) => void {
  const index = useSearchIndex()
  const select = useMapStore((s) => s.select)
  return useCallback((id: string) => select(index.find((r) => r.id === id) ?? null), [index, select])
}
