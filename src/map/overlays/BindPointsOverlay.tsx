import { useMemo } from 'react'
import { useRegionData } from '../../data/regionData'
import CircleMarkers, { type CirclePoint } from './CircleMarkers'

export default function BindPointsOverlay() {
  const { bindPoints } = useRegionData()
  const points = useMemo<CirclePoint[]>(() => bindPoints.map((pos, i) => ({ id: `bind:${i}`, pos, color: '#3df5ff', label: 'Bind point' })), [bindPoints])
  return <CircleMarkers points={points} radius={6} />
}
