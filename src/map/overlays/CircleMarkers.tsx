import { useEffect, useRef } from 'react'
import { useLeafletContext } from '@react-leaflet/core'
import { circleMarker, layerGroup } from 'leaflet'
import type { LatLng } from '../../data/types'

export interface CirclePoint {
  // Search result id selected when the point is clicked.
  id: string
  pos: LatLng
  color: string
  label: string
}

// Draws many circle markers imperatively: thousands of react-leaflet components
// would be far slower. Rendered on the map's canvas (MapContainer preferCanvas).
// `points` must be memoized by the caller.
export default function CircleMarkers({ points, radius, onSelect }: { points: CirclePoint[]; radius: number; onSelect?: (id: string) => void }) {
  const { map, layerContainer } = useLeafletContext()
  // Read through a ref so a new callback doesn't rebuild thousands of markers.
  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    const container = layerContainer ?? map
    const group = layerGroup(
      points.map((p) =>
        // bubblingMouseEvents: false keeps the click from reaching the map, which would clear the selection.
        circleMarker(p.pos, { radius, color: '#000', weight: 1, fillColor: p.color, fillOpacity: 0.9, bubblingMouseEvents: false })
          // Tooltip strings are inserted as HTML; DB names are plain text.
          .bindTooltip(escapeHtml(p.label))
          .on('click', () => onSelectRef.current?.(p.id)),
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
