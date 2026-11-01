import { divIcon } from 'leaflet'
import { Marker, Tooltip } from 'react-leaflet'
import { useRegionData } from '../../data/regionData'
import { entranceBadgeHtml } from '../../ui/badges'
import { useEnter } from './useEnter'
import { useSelectById } from './useSelectById'

const ICON_SIZE = 22
const enterableIcon = divIcon({ className: 'icon-marker', html: entranceBadgeHtml(true), iconSize: [ICON_SIZE, ICON_SIZE] })
const otherIcon = divIcon({ className: 'icon-marker', html: entranceBadgeHtml(false), iconSize: [ICON_SIZE, ICON_SIZE] })

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
      icon={entrance.target ? enterableIcon : otherIcon}
      eventHandlers={{ click: () => (entrance.target ? enter(entrance.target) : selectById(`entrance:${entrance.name}:`)) }}
    >
      <Tooltip>
        {entrance.name}
        {entrance.target ? <em> · click to enter</em> : <em> · no map yet</em>}
      </Tooltip>
    </Marker>
  ))
}
