import { Polyline, Tooltip } from 'react-leaflet'
import { useRegionData } from '../../data/regionData'

const COLORS = { horse: '#d4a373', boat: '#4ea8de' }

export default function RoutesOverlay() {
  const { routes } = useRegionData()
  return routes.map((route, i) => (
    <Polyline key={i} positions={route.path} pathOptions={{ color: COLORS[route.kind], weight: 2, opacity: 0.8 }}>
      <Tooltip sticky>{route.name}</Tooltip>
    </Polyline>
  ))
}
