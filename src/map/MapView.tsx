import { Suspense, useState, type ComponentType } from 'react'
import { CRS, type LatLng } from 'leaflet'
import { LayerGroup, LayersControl, MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet'
import { DEFAULT_REGION, isRegionName, REGIONS } from '../data/regions'
import { useMapStore } from '../store'
import BindPointsOverlay from './overlays/BindPointsOverlay'
import EntrancesOverlay from './overlays/EntrancesOverlay'
import MobsOverlay from './overlays/MobsOverlay'
import NpcsOverlay from './overlays/NpcsOverlay'
import RoutesOverlay from './overlays/RoutesOverlay'
import ZonesOverlay from './overlays/ZonesOverlay'

// Toggleable layers, all fed by the current region's generated data file.
const OVERLAYS: { name: string; checked: boolean; Component: ComponentType }[] = [
  { name: 'Zones', checked: true, Component: ZonesOverlay },
  { name: 'Entrances', checked: true, Component: EntrancesOverlay },
  { name: 'Horse & boat routes', checked: true, Component: RoutesOverlay },
  { name: 'NPCs', checked: false, Component: NpcsOverlay },
  { name: 'Mobs', checked: false, Component: MobsOverlay },
  { name: 'Bind points', checked: false, Component: BindPointsOverlay },
]

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

// Dev helper: click the map to drop a marker showing its coordinates.
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
    <MapContainer
      center={[-83, 80.5]}
      zoom={2}
      minZoom={1}
      maxZoom={7}
      doubleClickZoom={false}
      crs={CRS.Simple}
      preferCanvas
    >
      <LayersControl position="bottomright">
        {REGIONS.map((region) => (
          <LayersControl.BaseLayer key={region.name} name={region.name} checked={region.name === DEFAULT_REGION}>
            <TileLayer url={region.tiles} />
          </LayersControl.BaseLayer>
        ))}
        {OVERLAYS.map(({ name, checked, Component }) => (
          <LayersControl.Overlay key={name} name={name} checked={checked}>
            <LayerGroup>
              <Suspense fallback={null}>
                <Component />
              </Suspense>
            </LayerGroup>
          </LayersControl.Overlay>
        ))}
      </LayersControl>
      <RegionSync />
      {import.meta.env.DEV && <CoordinatePicker />}
    </MapContainer>
  )
}
