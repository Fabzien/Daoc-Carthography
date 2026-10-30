import { useState } from 'react'
import { CRS, type LatLng } from 'leaflet'
import { LayersControl, MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import { DEFAULT_REGION, isRegionName, REGIONS } from '../data/regions'
import { useMapStore } from '../store'
import EntranceMarkers from './markers/EntranceMarkers'
import HorseRoutes from './markers/HorseRoutes'
import ZoneRectangles from './markers/ZoneRectangles'

// Keeps the store's region in sync with the base layer picked in the layers control.
function RegionSync() {
  const setRegion = useMapStore((s) => s.setRegion)
  useMapEvents({
    baselayerchange(e) {
      if (isRegionName(e.name)) setRegion(e.name)
    },
  })
  return null
}

// Dev helper: click the map to drop a marker showing its coordinates, to place
// new entrances, zones, or horse routes.
function CoordinatePicker() {
  const [markers, setMarkers] = useState<LatLng[]>([])
  useMapEvents({
    click(e) {
      setMarkers((prev) => [...prev, e.latlng])
    },
  })
  return markers.map((position, i) => (
    <Marker key={i} position={position}>
      <Popup>
        Marker is at lat: {position.lat} lng: {position.lng}
      </Popup>
    </Marker>
  ))
}

export default function MapView() {
  return (
    <MapContainer center={[-83, 80.5]} zoom={2} minZoom={1} maxZoom={7} doubleClickZoom={false} crs={CRS.Simple}>
      <LayersControl position="bottomright">
        {REGIONS.map((region) => (
          <LayersControl.BaseLayer key={region.name} name={region.name} checked={region.name === DEFAULT_REGION}>
            <TileLayer url={region.tiles} />
          </LayersControl.BaseLayer>
        ))}
      </LayersControl>
      <ZoneRectangles />
      <EntranceMarkers />
      <HorseRoutes />
      <RegionSync />
      {import.meta.env.DEV && <CoordinatePicker />}
    </MapContainer>
  )
}
