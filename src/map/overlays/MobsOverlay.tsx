import { useMemo } from 'react'
import { useRegionData } from '../../data/regionData'
import CircleMarkers, { type CirclePoint } from './CircleMarkers'

// Green for low levels to red for level 60+. Levels can be ranges ("51-55").
function levelColor(level: string): string {
  const value = Number.parseInt(level, 10)
  if (Number.isNaN(value)) return '#888'
  return `hsl(${120 - Math.min(value, 60) * 2}, 85%, 50%)`
}

export default function MobsOverlay() {
  const { mobs } = useRegionData()
  const points = useMemo<CirclePoint[]>(
    () => mobs.map(([name, level, lat, lng]) => ({ pos: [lat, lng], color: levelColor(level), label: `${name} (${level})` })),
    [mobs],
  )
  return <CircleMarkers points={points} radius={3} />
}
