import { CircleMarker, Polyline, Rectangle, Tooltip } from 'react-leaflet'
import type { LatLng, Route } from '../../data/types'
import { useMapStore } from '../../store'
import { ROUTE_COLORS } from '../../ui/kinds'

const HIGHLIGHT = { color: '#fff', weight: 2, fillColor: '#ea4335', fillOpacity: 1 }
// Brighter than the routes layer's colors, to stand out above it.
const ROUTE_HIGHLIGHT = { horse: '#ff8f00', boat: '#1e88e5' }

// A route drawn bold, with its destination labelled at its end.
function HighlightedRoute({ route }: { route: Route }) {
  const end = route.path[route.path.length - 1]
  return (
    <>
      <Polyline positions={route.path} pathOptions={{ color: '#000', weight: 8, opacity: 0.5 }} interactive={false} />
      <Polyline positions={route.path} pathOptions={{ color: ROUTE_HIGHLIGHT[route.kind], weight: 5 }} interactive={false} />
      <CircleMarker center={end} radius={6} pathOptions={{ color: '#fff', weight: 2, fillColor: ROUTE_COLORS[route.kind], fillOpacity: 1 }} interactive={false}>
        <Tooltip permanent direction="right" offset={[8, 0]} className="route-destination">
          {route.to}
        </Tooltip>
      </CircleMarker>
    </>
  )
}

// Highlights every location of the selected search result, Google Maps pin
// style, and the routes of a selected route or stable master.
export default function SelectionOverlay() {
  const selected = useMapStore((s) => s.selected)
  if (!selected) return null
  if (selected.kind === 'zone') {
    return <Rectangle bounds={selected.positions as [LatLng, LatLng]} pathOptions={{ color: '#ea4335', weight: 3, fillOpacity: 0.08 }} interactive={false} />
  }
  return (
    <>
      {selected.routes?.map((route, i) => <HighlightedRoute key={i} route={route} />)}
      {selected.kind !== 'route' && selected.positions.map((pos, i) => <CircleMarker key={i} center={pos} radius={8} pathOptions={HIGHLIGHT} interactive={false} />)}
    </>
  )
}
