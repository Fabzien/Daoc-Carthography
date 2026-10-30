import { CircleMarker, Polyline, Rectangle } from 'react-leaflet'
import type { LatLng } from '../../data/types'
import { useMapStore } from '../../store'

const HIGHLIGHT = { color: '#fff', weight: 2, fillColor: '#ea4335', fillOpacity: 1 }

// Highlights every location of the selected search result, Google Maps pin style.
export default function SelectionOverlay() {
  const selected = useMapStore((s) => s.selected)
  if (!selected) return null
  if (selected.kind === 'zone') {
    return <Rectangle bounds={selected.positions as [LatLng, LatLng]} pathOptions={{ color: '#ea4335', weight: 3, fillOpacity: 0.08 }} interactive={false} />
  }
  if (selected.kind === 'route') {
    return <Polyline positions={selected.positions} pathOptions={{ color: '#ea4335', weight: 5 }} interactive={false} />
  }
  return selected.positions.map((pos, i) => <CircleMarker key={i} center={pos} radius={8} pathOptions={HIGHLIGHT} interactive={false} />)
}
