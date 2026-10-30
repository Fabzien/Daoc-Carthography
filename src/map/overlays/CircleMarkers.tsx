import { useEffect } from 'react'
import { useLeafletContext } from '@react-leaflet/core'
import { circleMarker, layerGroup } from 'leaflet'
import type { LatLng } from '../../data/types'

export interface CirclePoint {
  pos: LatLng
  color: string
  label: string
}

// Draws many circle markers imperatively: thousands of react-leaflet components
// would be far slower. Rendered on the map's canvas (MapContainer preferCanvas).
// `points` must be memoized by the caller.
export default function CircleMarkers({ points, radius }: { points: CirclePoint[]; radius: number }) {
  const { map, layerContainer } = useLeafletContext()

  useEffect(() => {
    const container = layerContainer ?? map
    const group = layerGroup(
      points.map((p) =>
        circleMarker(p.pos, { radius, color: '#000', weight: 1, fillColor: p.color, fillOpacity: 0.9 })
          // Tooltip strings are inserted as HTML; DB names are plain text.
          .bindTooltip(escapeHtml(p.label)),
      ),
    )
    container.addLayer(group)
    return () => {
      container.removeLayer(group)
    }
  }, [points, radius, map, layerContainer])

  return null
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}
