import { useCallback } from 'react'
import { getRegion, isRegionName } from '../../data/regions'
import type { Entrance } from '../../data/types'
import { useMapStore } from '../../store'

// Opens the map an entrance leads to, at its arrival point when known.
export function useEnter(): (target: NonNullable<Entrance['target']>) => void {
  const region = useMapStore((s) => s.region)
  const enter = useMapStore((s) => s.enter)
  return useCallback(
    (target) => {
      if (!isRegionName(target.map)) return
      enter(target.map, target.pos && { pos: target.pos, label: `Arrival from ${getRegion(region).label}` })
    },
    [region, enter],
  )
}
