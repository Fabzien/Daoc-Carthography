import { Polyline, Tooltip } from 'react-leaflet'
import { useRegionData } from '../../data/regionData'
import { ROUTE_COLORS } from '../../ui/kinds'

export default function RoutesOverlay() {
  const { routes } = useRegionData()
  return routes.map((route, i) => (
    <Polyline key={i} positions={route.path} pathOptions={{ color: ROUTE_COLORS[route.kind], weight: 2, opacity: 0.8 }}>
      <Tooltip sticky>{route.name}</Tooltip>
    </Polyline>
  ))
}
