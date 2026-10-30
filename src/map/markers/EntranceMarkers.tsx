import { Icon } from 'leaflet'
import { Marker, Tooltip } from 'react-leaflet'
import { getRegionData } from '../../data/regions'
import { useMapStore } from '../../store'

const entranceIcon = new Icon({ iconUrl: '/images/entrance.png', iconSize: [15, 15] })

export default function EntranceMarkers() {
  const region = useMapStore((s) => s.region)
  return getRegionData(region).entrances.map((entrance) => (
    <Marker key={entrance.name} position={entrance.loc} icon={entranceIcon}>
      <Tooltip>{entrance.name}</Tooltip>
    </Marker>
  ))
}
