import { Rectangle, Tooltip } from 'react-leaflet'
import { getRegionData } from '../../data/regions'
import { useMapStore } from '../../store'

// Invisible rectangles whose only purpose is to show the zone name on hover.
export default function ZoneRectangles() {
  const region = useMapStore((s) => s.region)
  return getRegionData(region).zones.map((zone) => (
    <Rectangle key={zone.name} bounds={zone.loc} pathOptions={{ opacity: 0, fillOpacity: 0 }}>
      <Tooltip direction="bottom" opacity={0.5} sticky>
        {zone.name}
      </Tooltip>
    </Rectangle>
  ))
}
