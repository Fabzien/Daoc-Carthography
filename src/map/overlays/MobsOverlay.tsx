import { useDeferredValue, useMemo, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { useRegionData } from '../../data/regionData'
import { levelMatches, nameMatches, parseLevel } from '../../search'
import { useMapStore } from '../../store'
import { formatLevels, levelColor } from '../../ui/kinds'
import { clusterByGrid } from '../cluster'
import CircleMarkers, { type CirclePoint } from './CircleMarkers'
import ClusterMarkers, { type ClusterPoint } from './ClusterMarkers'
import { useSelectById } from './useSelectById'

// Up to this zoom, nearby mobs are drawn as count bubbles; beyond it, one by one.
const CLUSTER_MAX_ZOOM = 3
// Size on screen of a clustering cell.
const CELL_PIXELS = 48

type MobPoint = CirclePoint & { levels: [number, number] | null }

// All mobs, narrowed down by the search box and level filter.
export default function MobsOverlay() {
  const { mobs } = useRegionData()
  const query = useDeferredValue(useMapStore((s) => s.query))
  const levels = useDeferredValue(useMapStore((s) => s.levels))
  const selectById = useSelectById()
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })

  const points = useMemo<MobPoint[]>(() => {
    const result: MobPoint[] = []
    for (const [name, level, lat, lng] of mobs) {
      const parsed = parseLevel(level)
      if (!nameMatches(name, query) || !levelMatches(parsed, levels)) continue
      result.push({ id: `mob:${name}:`, pos: [lat, lng], color: levelColor(parsed), label: `${name} (${level})`, levels: parsed })
    }
    return result
  }, [mobs, query, levels])

  const { singles, clusters } = useMemo(() => {
    if (zoom > CLUSTER_MAX_ZOOM) return { singles: points, clusters: [] }
    // Cells of CELL_PIXELS on screen: map units shrink as the zoom grows.
    const groups = clusterByGrid(points, (p) => p.pos, CELL_PIXELS / 2 ** zoom)
    const singles: MobPoint[] = []
    const clusters: ClusterPoint[] = []
    for (const group of groups) {
      if (group.members.length === 1) {
        singles.push(group.members[0])
        continue
      }
      const known = group.members.map((m) => m.levels).filter((l) => l !== null)
      const span: [number, number] | null = known.length ? [Math.min(...known.map((l) => l[0])), Math.max(...known.map((l) => l[1]))] : null
      const average = known.length ? Math.round(known.reduce((sum, l) => sum + l[0], 0) / known.length) : null
      clusters.push({
        pos: group.pos,
        count: group.members.length,
        color: levelColor(average === null ? null : [average, average]),
        label: `${group.members.length} mobs · ${formatLevels(span)}`,
        bounds: group.bounds,
      })
    }
    return { singles, clusters }
  }, [points, zoom])

  return (
    <>
      <CircleMarkers points={singles} radius={3} onSelect={selectById} />
      <ClusterMarkers clusters={clusters} maxZoom={CLUSTER_MAX_ZOOM + 2} />
    </>
  )
}
