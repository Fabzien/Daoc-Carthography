import { Icon } from 'leaflet'
import { Marker, Polyline, Popup } from 'react-leaflet'
import { getRegionData } from '../../data/regions'
import { useMapStore } from '../../store'

const horseIcon = new Icon({ iconUrl: '/images/horse.png', iconSize: [15, 15] })

// Each stable is a marker; its routes are drawn only while its popup is open.
export default function HorseRoutes() {
  const region = useMapStore((s) => s.region)
  return getRegionData(region).horses.map((route) => (
    <Marker key={route.name} position={route.loc} icon={horseIcon}>
      <Popup>
        <p>{route.name}</p>
        <p>{route.description}</p>
        <Polyline pathOptions={{ color: 'grey', opacity: 0.8 }} positions={route.path} />
      </Popup>
    </Marker>
  ))
}
