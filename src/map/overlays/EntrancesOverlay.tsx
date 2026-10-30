import { Icon } from 'leaflet'
import { Marker, Tooltip } from 'react-leaflet'
import { useRegionData } from '../../data/regionData'

const entranceIcon = new Icon({ iconUrl: '/images/entrance.png', iconSize: [15, 15] })

export default function EntrancesOverlay() {
  const { entrances } = useRegionData()
  return entrances.map((entrance, i) => (
    <Marker key={i} position={entrance.pos} icon={entranceIcon}>
      <Tooltip>{entrance.name}</Tooltip>
    </Marker>
  ))
}
