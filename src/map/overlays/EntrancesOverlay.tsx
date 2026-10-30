import { Icon } from 'leaflet'
import { Marker, Tooltip } from 'react-leaflet'
import { useRegionData } from '../../data/regionData'
import { useEnter } from './useEnter'
import { useSelectById } from './useSelectById'

const entranceIcon = new Icon({ iconUrl: '/images/entrance.png', iconSize: [15, 15] })

// Clicking an entrance opens the map it leads to; entrances to places without
// a map are selected instead.
export default function EntrancesOverlay() {
  const { entrances } = useRegionData()
  const selectById = useSelectById()
  const enter = useEnter()
  return entrances.map((entrance, i) => (
    <Marker
      key={i}
      position={entrance.pos}
      icon={entranceIcon}
      eventHandlers={{ click: () => (entrance.target ? enter(entrance.target) : selectById(`entrance:${entrance.name}:`)) }}
    >
      <Tooltip>
        {entrance.name}
        {entrance.target && <em> · click to enter</em>}
      </Tooltip>
    </Marker>
  ))
}
