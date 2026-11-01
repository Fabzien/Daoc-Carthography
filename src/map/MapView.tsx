import { Suspense, useEffect, useState, type ComponentType } from 'react'
import { CRS, latLngBounds, type LatLng, type Point } from 'leaflet'
import { MapContainer, Pane, TileLayer, useMap, useMapEvents, ZoomControl } from 'react-leaflet'
import { locate } from '../coords'
import { useRegionData } from '../data/regionData'
import { getRegion } from '../data/regions'
import { useMapStore, type LayerKey } from '../store'
import BindPointsOverlay from './overlays/BindPointsOverlay'
import BossesOverlay from './overlays/BossesOverlay'
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
  ['bosses', BossesOverlay],
  ['npcs', NpcsOverlay],
  ['bindPoints', BindPointsOverlay],
  ['entrances', EntrancesOverlay],
]

// Width of the search panel, kept clear when fitting the map to a selection.
const PANEL_WIDTH = 420

// Frames the whole drawn map when it loads or changes: its zones, or for maps
// without any (floor plans, maps without DOL data) its extent.
function FitRegion() {
  const map = useMap()
  const { zones } = useRegionData()
  const extent = getRegion(useMapStore((s) => s.region)).extent ?? 256
  useEffect(() => {
    // Arriving through an entrance selects the arrival point: fly there instead.
    if (useMapStore.getState().selected) return
    const bounds = zones.length > 0 ? latLngBounds(zones.flatMap((z) => z.bounds)) : latLngBounds([0, 0], [-extent, extent])
    map.fitBounds(bounds, { paddingTopLeft: [PANEL_WIDTH, 20], paddingBottomRight: [20, 20] })
  }, [map, zones, extent])
  return null
}

// In-game position under the cursor: zone and /loc, then global coordinates.
function CursorLocation() {
  const { dol } = getRegion(useMapStore((s) => s.region))
  const { gameZones } = useRegionData()
  // Kept in screen space so the readout follows the map when it pans or flies
  // under a still cursor.
  const [cursor, setCursor] = useState<{ point: Point; latlng: LatLng } | null>(null)
  const map = useMapEvents({
    mousemove: (e) => setCursor({ point: e.containerPoint, latlng: e.latlng }),
    move: () => setCursor((c) => c && { point: c.point, latlng: map.containerPointToLatLng(c.point) }),
    mouseout: () => setCursor(null),
  })
  if (!dol || !cursor) return null
  const { x, y, zone, loc } = locate(dol, gameZones, [cursor.latlng.lat, cursor.latlng.lng])
  return (
    <div className="cursor-location">
      {zone && loc && (
        <>
          <strong>{zone.name}</strong> · loc {loc[0]}, {loc[1]} ·{' '}
        </>
      )}
      <span className="muted">
        X {x} Y {y}
      </span>
    </div>
  )
}

// Flies to the selected result, and clears the selection on a click on the map itself.
function SelectionController() {
  const map = useMap()
  const selected = useMapStore((s) => s.selected)
  const select = useMapStore((s) => s.select)

  useEffect(() => {
    if (!selected) return
    // A stable master's routes are framed with them.
    const points = [...selected.positions, ...(selected.routes ?? []).flatMap((r) => r.path)]
    map.flyToBounds(latLngBounds(points), { maxZoom: 5, paddingTopLeft: [PANEL_WIDTH, 60], paddingBottomRight: [60, 60] })
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
        <CursorLocation />
        {OVERLAYS.map(([key, Overlay]) => layers[key] && <Overlay key={key} />)}
      </Suspense>
      {/* Own pane (and canvas) so highlights stay above every other layer, icon
          markers included (marker pane: 600). Its canvas covers the whole map, so it
          must let mouse events through to the layers below. */}
      <Pane name="selection" style={{ zIndex: 620, pointerEvents: 'none' }}>
        <SelectionOverlay />
      </Pane>
      <SelectionController />
    </MapContainer>
  )
}
