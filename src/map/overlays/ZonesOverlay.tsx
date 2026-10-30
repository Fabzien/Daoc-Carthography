import { Rectangle, Tooltip } from 'react-leaflet'
import { useRegionData } from '../../data/regionData'

// Invisible rectangles whose only purpose is to show the zone name on hover.
export default function ZonesOverlay() {
  const { zones } = useRegionData()
  return zones.map((zone) => (
    <Rectangle key={zone.name} bounds={zone.bounds} pathOptions={{ opacity: 0, fillOpacity: 0 }}>
      <Tooltip direction="bottom" opacity={0.5} sticky>
        {zone.name}
      </Tooltip>
    </Rectangle>
  ))
}
