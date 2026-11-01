import { divIcon } from 'leaflet'
import { Marker, Tooltip } from 'react-leaflet'
import { useRegionData } from '../../data/regionData'
import { getRegion, isRegionName } from '../../data/regions'
import { useMapStore } from '../../store'
import { cityBadgeHtml, entranceBadgeHtml } from '../../ui/badges'
import { useEnter } from './useEnter'
import { useSelectById } from './useSelectById'

const ICON_SIZE = 22
const enterableIcon = divIcon({ className: 'icon-marker', html: entranceBadgeHtml(true), iconSize: [ICON_SIZE, ICON_SIZE] })
const otherIcon = divIcon({ className: 'icon-marker', html: entranceBadgeHtml(false), iconSize: [ICON_SIZE, ICON_SIZE] })
const cityIcon = divIcon({ className: 'icon-marker', html: cityBadgeHtml(), iconSize: [28, 28] })

// Clicking an entrance opens the map it leads to; entrances to places without
// a map are selected instead. Drawn capitals get a badge opening their own map.
export default function EntrancesOverlay() {
  const { entrances } = useRegionData()
  const region = useMapStore((s) => s.region)
  const setRegion = useMapStore((s) => s.setRegion)
  const selectById = useSelectById()
  const enter = useEnter()
  const cities = getRegion(region).drawnCities ?? []

  return (
    <>
      {entrances.map((entrance, i) => (
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
      ))}
      {cities.map((city) => {
        if (!isRegionName(city.map)) return null
        const map = city.map
        const [[top, left], [bottom, right]] = city.bounds
        return (
          <Marker key={map} position={[(top + bottom) / 2, (left + right) / 2]} icon={cityIcon} eventHandlers={{ click: () => setRegion(map) }}>
            <Tooltip>
              {getRegion(map).label.replace(' · old layout', '')}
              <em> · click to open the city map with its NPCs (old layout, as in the DOL database)</em>
            </Tooltip>
          </Marker>
        )
      })}
    </>
  )
}
