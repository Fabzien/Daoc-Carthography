import { Polyline, Tooltip } from 'react-leaflet'
import { useRegionData } from '../../data/regionData'
import { routeResult } from '../../search'
import { useMapStore } from '../../store'
import { ROUTE_COLORS } from '../../ui/kinds'

// Horse and boat routes; clicking one selects it (its card shows its master and destination).
export default function RoutesOverlay() {
  const { routes } = useRegionData()
  const select = useMapStore((s) => s.select)
  return routes.map((route, i) => (
    <Polyline
      key={i}
      positions={route.path}
      // bubblingMouseEvents: false keeps the click from reaching the map, which would clear the selection.
      pathOptions={{ color: ROUTE_COLORS[route.kind], weight: 2, opacity: 0.8, bubblingMouseEvents: false }}
      eventHandlers={{ click: () => select(routeResult(route)) }}
    >
      <Tooltip sticky>
        {route.master} → {route.to}
      </Tooltip>
    </Polyline>
  ))
}
