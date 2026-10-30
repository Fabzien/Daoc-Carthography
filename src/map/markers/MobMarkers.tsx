import { Marker, Popup } from 'react-leaflet'
import { useMapStore } from '../../store'

export default function MobMarkers() {
  const mobs = useMapStore((s) => s.mobs)
  return mobs.map((mob) => (
    <Marker key={mob._id} position={mob.loc.coordinates}>
      <Popup>
        <ul>
          <li>Name: {mob.Name}</li>
          <li>Type: {mob.attributes.type}</li>
        </ul>
      </Popup>
    </Marker>
  ))
}
