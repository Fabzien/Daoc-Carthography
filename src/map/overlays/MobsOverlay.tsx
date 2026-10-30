import { useDeferredValue, useMemo } from 'react'
import { useRegionData } from '../../data/regionData'
import { levelMatches, nameMatches, parseLevel } from '../../search'
import { useMapStore } from '../../store'
import { levelColor } from '../../ui/kinds'
import CircleMarkers, { type CirclePoint } from './CircleMarkers'
import { useSelectById } from './useSelectById'

// All mobs, narrowed down by the search box and level filter.
export default function MobsOverlay() {
  const { mobs } = useRegionData()
  const query = useDeferredValue(useMapStore((s) => s.query))
  const levels = useDeferredValue(useMapStore((s) => s.levels))
  const selectById = useSelectById()

  const points = useMemo<CirclePoint[]>(() => {
    const result: CirclePoint[] = []
    for (const [name, level, lat, lng] of mobs) {
      const parsed = parseLevel(level)
      if (!nameMatches(name, query) || !levelMatches(parsed, levels)) continue
      result.push({ id: `mob:${name}:`, pos: [lat, lng], color: levelColor(parsed), label: `${name} (${level})` })
    }
    return result
  }, [mobs, query, levels])

  return <CircleMarkers points={points} radius={3} onSelect={selectById} />
}
