import { useEffect } from 'react'
import { useLeafletContext } from '@react-leaflet/core'
import { divIcon, layerGroup, marker } from 'leaflet'
import type { LatLng } from '../../data/types'

export interface ClusterPoint {
  pos: LatLng
  count: number
  color: string
  label: string
  bounds: [LatLng, LatLng]
}

// Count bubbles for groups of points; clicking one zooms onto its members.
// `clusters` must be memoized by the caller.
export default function ClusterMarkers({ clusters, maxZoom }: { clusters: ClusterPoint[]; maxZoom: number }) {
  const { map, layerContainer } = useLeafletContext()

  useEffect(() => {
    const container = layerContainer ?? map
    const group = layerGroup(
      clusters.map((c) => {
        // Bigger bubbles for bigger groups, on a log scale; ~42px for 1000
        // points keeps them inside the 48px clustering cells.
        const size = Math.round(21 + Math.log10(c.count) * 7)
        const icon = divIcon({
          className: 'mob-cluster',
          html: `<span style="background:${c.color}">${c.count}</span>`,
          iconSize: [size, size],
        })
        return marker(c.pos, { icon, keyboard: false })
          .bindTooltip(c.label)
          .on('click', () => map.flyToBounds(c.bounds, { maxZoom, padding: [40, 40] }))
      }),
    )
    container.addLayer(group)
    return () => {
      container.removeLayer(group)
    }
  }, [clusters, maxZoom, map, layerContainer])

  return null
}
