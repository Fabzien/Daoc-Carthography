import { Icon } from 'leaflet'
import { Marker, Tooltip } from 'react-leaflet'
import { useRegionData } from '../../data/regionData'
import { useSelectById } from './useSelectById'

const entranceIcon = new Icon({ iconUrl: '/images/entrance.png', iconSize: [15, 15] })

export default function EntrancesOverlay() {
  const { entrances } = useRegionData()
  const selectById = useSelectById()
  return entrances.map((entrance, i) => (
    <Marker key={i} position={entrance.pos} icon={entranceIcon} eventHandlers={{ click: () => selectById(`entrance:${entrance.name}:`) }}>
      <Tooltip>{entrance.name}</Tooltip>
    </Marker>
  ))
}
