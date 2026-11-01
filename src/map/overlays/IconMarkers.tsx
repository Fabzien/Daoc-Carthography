import { useEffect, useRef } from 'react'
import { useLeafletContext } from '@react-leaflet/core'
import { divIcon, layerGroup, marker } from 'leaflet'
import type { LatLng } from '../../data/types'

export interface IconPoint {
  // Search result id selected when the point is clicked.
  id: string
  pos: LatLng
  // Trusted markup of the icon (see npcBadgeHtml).
  html: string
  label: string
}

// Points drawn as HTML icons (DOM markers, unlike the canvas CircleMarkers):
// fine for hundreds of points, too slow for thousands. `points` must be
// memoized by the caller.
export default function IconMarkers({ points, size, onSelect }: { points: IconPoint[]; size: number; onSelect?: (id: string) => void }) {
  const { map, layerContainer } = useLeafletContext()
  // Read through a ref so a new callback doesn't rebuild every marker.
  const onSelectRef = useRef(onSelect)
  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  useEffect(() => {
    const container = layerContainer ?? map
    const icons = new Map<string, ReturnType<typeof divIcon>>()
    const group = layerGroup(
      points.map((p) => {
        // One icon object per distinct markup, shared by its markers.
        let icon = icons.get(p.html)
        if (!icon) {
          icon = divIcon({ className: 'icon-marker', html: p.html, iconSize: [size, size] })
          icons.set(p.html, icon)
        }
        return marker(p.pos, { icon, keyboard: false })
          .bindTooltip(escapeHtml(p.label))
          .on('click', () => onSelectRef.current?.(p.id))
      }),
    )
    container.addLayer(group)
    return () => {
      container.removeLayer(group)
    }
  }, [points, size, map, layerContainer])

  return null
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}
