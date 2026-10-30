import { Suspense, useEffect, type ComponentType } from 'react'
import { CRS, latLngBounds } from 'leaflet'
import { MapContainer, Pane, TileLayer, useMap, useMapEvents, ZoomControl } from 'react-leaflet'
import { useRegionData } from '../data/regionData'
import { getRegion } from '../data/regions'
import { useMapStore, type LayerKey } from '../store'
import BindPointsOverlay from './overlays/BindPointsOverlay'
import EntrancesOverlay from './overlays/EntrancesOverlay'
import MobsOverlay from './overlays/MobsOverlay'
import NpcsOverlay from './overlays/NpcsOverlay'
import RoutesOverlay from './overlays/RoutesOverlay'
import SelectionOverlay from './overlays/SelectionOverlay'
import ZonesOverlay from './overlays/ZonesOverlay'

// Drawing order: later layers are on top.
const OVERLAYS: [LayerKey, ComponentType][] = [
  ['zones', ZonesOverlay],
  ['routes', RoutesOverlay],
  ['mobs', MobsOverlay],
  ['npcs', NpcsOverlay],
  ['bindPoints', BindPointsOverlay],
  ['entrances', EntrancesOverlay],
]

// Width of the search panel, kept clear when fitting the map to a selection.
const PANEL_WIDTH = 420

// Frames the whole drawn map when it loads or changes.
function FitRegion() {
  const map = useMap()
  const { zones } = useRegionData()
  useEffect(() => {
    if (zones.length === 0) return
    map.fitBounds(latLngBounds(zones.flatMap((z) => z.bounds)), { paddingTopLeft: [PANEL_WIDTH, 20], paddingBottomRight: [20, 20] })
  }, [map, zones])
  return null
}

// Flies to the selected result, and clears the selection on a click on the map itself.
function SelectionController() {
  const map = useMap()
  const selected = useMapStore((s) => s.selected)
  const select = useMapStore((s) => s.select)

  useEffect(() => {
    if (!selected) return
    map.flyToBounds(latLngBounds(selected.positions), { maxZoom: 5, paddingTopLeft: [PANEL_WIDTH, 60], paddingBottomRight: [60, 60] })
  }, [map, selected])

  useMapEvents({ click: () => select(null) })
  return null
}

export default function MapView() {
  const region = useMapStore((s) => s.region)
  const layers = useMapStore((s) => s.layers)
  const { tiles, maxNativeZoom } = getRegion(region)

  return (
    <MapContainer
      center={[-83, 80.5]}
      zoom={2}
      minZoom={1}
      maxZoom={7}
      doubleClickZoom={false}
      zoomControl={false}
      crs={CRS.Simple}
      preferCanvas
    >
      <TileLayer key={region} url={tiles} maxNativeZoom={maxNativeZoom} />
      <ZoomControl position="bottomright" />
      <Suspense fallback={null}>
        <FitRegion />
        {OVERLAYS.map(([key, Overlay]) => layers[key] && <Overlay key={key} />)}
      </Suspense>
      {/* Own pane (and canvas) so highlights stay above every other layer. Its canvas
          covers the whole map, so it must let mouse events through to the layers below. */}
      <Pane name="selection" style={{ zIndex: 450, pointerEvents: 'none' }}>
        <SelectionOverlay />
      </Pane>
      <SelectionController />
    </MapContainer>
  )
}
