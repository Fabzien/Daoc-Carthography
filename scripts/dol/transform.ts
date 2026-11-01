// Pure transformations from DOL database tables to the map's RegionData.
import { REGIONS, toMap, type Calibration, type Region } from '../../src/data/regions.ts'
import type { Entrance, GameZone, LatLng, Npc, NpcKind, RegionData, Route, Zone } from '../../src/data/types.ts'

// Subsets of the DOL tables (see DOLDatabase/Tables in DOLSharp) used here.
export interface DolMob {
  Name: string | null
  Guild: string | null
  X: number
  Y: number
  Region: number
  Level: number
  Realm: number
  ClassType: string
  NPCTemplateID: number
}
export interface DolNpcTemplate {
  TemplateId: number
  Name: string
  Level: string
}
export interface DolZone {
  ZoneID: number
  Name: string
  RegionID: number
  OffsetX: number
  OffsetY: number
  Width: number
  Height: number
}
export interface DolPathPoint {
  PathID: string
  Step: number
  X: number
  Y: number
}
export interface DolZonePoint {
  SourceRegion: number
  SourceX: number
  SourceY: number
  TargetRegion: number
  TargetX: number
  TargetY: number
}
export interface DolRegion {
  RegionID: number
  Description: string
}
export interface DolBindPoint {
  Region: number
  X: number
  Y: number
}

export interface DolTables {
  mobs: DolMob[]
  templates: DolNpcTemplate[]
  zones: DolZone[]
  pathPoints: DolPathPoint[]
  zonePoints: DolZonePoint[]
  regions: DolRegion[]
  bindPoints: DolBindPoint[]
}

// Zone offsets and sizes are expressed in units of 8192 game units.
const ZONE_UNIT = 8192
// A stable master's route starts next to them (DOL itself checks 500 units).
const ROUTE_START_DISTANCE = 1000
const MAP_SIZE = 256
// Zones on the map's edge can overshoot it slightly because of calibration.
const MAP_TOLERANCE = 1

const NPC_KINDS: [RegExp, NpcKind][] = [
  [/BoatStableMaster/, 'boat'],
  [/StableMaster/, 'stable'],
  [/Merchant/, 'merchant'],
  [/Trainer/, 'trainer'],
  [/Healer/, 'healer'],
  [/Teleporter/, 'teleporter'],
  [/Guard/, 'guard'],
  [/Blacksmith|Enchanter|Recharger/, 'crafting'],
  [/VaultKeeper/, 'vault'],
]

// Service NPC kind from the mob's ClassType, or null for a plain GameNPC.
export function npcKind(classType: string): NpcKind | null {
  return NPC_KINDS.find(([pattern]) => pattern.test(classType))?.[1] ?? null
}

// "HS_SnowdoniaFortress_Humberton" -> "Snowdonia Fortress → Humberton"
export function routeName(pathId: string): string {
  const words = (s: string) => s.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b[a-z]/g, (c) => c.toUpperCase())
  const match = /^(?:hs|bt)_([^_]+)_([^_]+)$/i.exec(pathId)
  return match ? `${words(match[1])} → ${words(match[2])}` : words(pathId.replace(/_/g, ' '))
}

function isOnMap([lat, lng]: LatLng): boolean {
  const t = MAP_TOLERANCE
  return lat <= t && lat >= -MAP_SIZE - t && lng >= -t && lng <= MAP_SIZE + t
}

function contains([[lat1, lng1], [lat2, lng2]]: [LatLng, LatLng], [lat, lng]: LatLng): boolean {
  return lat <= Math.max(lat1, lat2) && lat >= Math.min(lat1, lat2) && lng >= Math.min(lng1, lng2) && lng <= Math.max(lng1, lng2)
}

function groupPaths(pathPoints: DolPathPoint[]): Map<string, DolPathPoint[]> {
  const paths = new Map<string, DolPathPoint[]>()
  for (const point of pathPoints) {
    const path = paths.get(point.PathID) ?? []
    path.push(point)
    paths.set(point.PathID, path)
  }
  for (const path of paths.values()) path.sort((a, b) => a.Step - b.Step)
  return paths
}

export function buildRegionData(region: Region, tables: DolTables, source: string): RegionData {
  const { dol } = region
  if (!dol) return { source, zones: [], mobs: [], npcs: [], routes: [], entrances: [], bindPoints: [], gameZones: [] }
  const id = dol.region
  const cities = region.drawnCities ?? []
  // Calibration of a DOL region on this map: its own, or that of a capital drawn on it.
  const calibrationOf = (regionId: number): Calibration | undefined => (regionId === id ? dol : cities.find((c) => c.region === regionId))
  const pos = (x: number, y: number) => toMap(dol, x, y)
  const regionNames = new Map(tables.regions.map((r) => [r.RegionID, r.Description]))
  const zoneOf = (regionId: number) => tables.zones.find((z) => z.RegionID === regionId)

  // Only zones drawn on the map's tiles; everything else is filtered by them,
  // which drops spawns in zones the map doesn't show. A floor plan covers part
  // of its region's single zone: there, keep what falls on the plan. A drawn
  // capital is a zone square of its own.
  const zones: Zone[] = [
    ...tables.zones
      .filter((z) => z.RegionID === id && !region.plan && (!region.drawnZones || region.drawnZones.includes(z.Name)))
      .map((z) => ({
        name: z.Name,
        bounds: [pos(z.OffsetX * ZONE_UNIT, z.OffsetY * ZONE_UNIT), pos((z.OffsetX + z.Width) * ZONE_UNIT, (z.OffsetY + z.Height) * ZONE_UNIT)] as [LatLng, LatLng],
      }))
      .filter((z) => isOnMap(z.bounds[0]) && isOnMap(z.bounds[1])),
    ...cities.map((c) => ({ name: zoneOf(c.region)?.Name ?? regionNames.get(c.region) ?? `Region ${c.region}`, bounds: [...c.bounds] as [LatLng, LatLng] })),
  ]
  const inZone = region.plan ? isOnMap : (p: LatLng) => zones.some((z) => contains(z.bounds, p))
  // Map position of a point of a DOL region shown on this map, when on a drawn zone.
  const place = (regionId: number, x: number, y: number): LatLng | null => {
    const calibration = calibrationOf(regionId)
    if (!calibration) return null
    const p = toMap(calibration, x, y)
    return inZone(p) ? p : null
  }

  const templates = new Map(tables.templates.map((t) => [t.TemplateId, t]))
  const mobs: RegionData['mobs'] = []
  const npcs: Npc[] = []
  const masters: { x: number; y: number; kind: NpcKind }[] = []
  for (const m of tables.mobs) {
    if (/TrainingDummy/.test(m.ClassType)) continue
    const p = place(m.Region, m.X, m.Y)
    if (!p) continue
    const template = templates.get(m.NPCTemplateID)
    const name = m.Name || template?.Name || '?'
    const kind = npcKind(m.ClassType)
    if (kind === null && m.Realm === 0) {
      mobs.push([name, m.Level > 0 ? String(m.Level) : (template?.Level ?? '?'), p[0], p[1]])
    } else {
      npcs.push({ name, title: m.Guild ?? '', kind: kind ?? 'other', pos: p })
      // Paths are in the map's own region coordinates.
      if ((kind === 'stable' || kind === 'boat') && m.Region === id) masters.push({ x: m.X, y: m.Y, kind })
    }
  }

  const routes: Route[] = []
  for (const [pathId, points] of groupPaths(tables.pathPoints)) {
    const start = points[0]
    const master = masters.find((s) => Math.hypot(s.x - start.X, s.y - start.Y) < ROUTE_START_DISTANCE)
    if (!master || points.length < 2) continue
    routes.push({ name: routeName(pathId), kind: master.kind === 'boat' ? 'boat' : 'horse', path: points.map((p) => pos(p.X, p.Y)) })
  }

  const entrances: Entrance[] = []
  for (const zp of tables.zonePoints) {
    const target = regionNames.get(zp.TargetRegion)
    // Zone points to regions missing from the Regions table lead nowhere.
    if (zp.SourceX <= 0 || zp.TargetRegion === zp.SourceRegion || !target) continue
    const source = place(zp.SourceRegion, zp.SourceX, zp.SourceY)
    if (!source) continue
    const entrance: Entrance = { name: target, pos: source }
    const destination = mapForRegion(zp.TargetRegion, target, regionNames)
    if (destination) {
      const arrival = destination.calibration && toMap(destination.calibration, zp.TargetX, zp.TargetY)
      entrance.target = { map: destination.region.name, ...(arrival && isOnMap(arrival) && { pos: arrival }) }
    }
    // The same entrance often has one zone point per realm.
    const duplicate = entrances.some((e) => e.name === entrance.name && Math.hypot(e.pos[0] - entrance.pos[0], e.pos[1] - entrance.pos[1]) < 1)
    if (!duplicate) entrances.push(entrance)
  }

  const bindPoints = tables.bindPoints.map((b) => place(b.Region, b.X, b.Y)).filter((p) => p !== null)

  const gameZones: GameZone[] = [
    ...tables.zones
      .filter((z) => z.RegionID === id)
      .map((z): GameZone => ({ name: z.Name, origin: [z.OffsetX * ZONE_UNIT, z.OffsetY * ZONE_UNIT], size: [z.Width * ZONE_UNIT, z.Height * ZONE_UNIT] })),
    // A drawn capital's zone has its own coordinates, valid in its square only.
    ...cities.flatMap((c): GameZone[] => {
      const z = zoneOf(c.region)
      if (!z) return []
      return [{ name: z.Name, origin: [z.OffsetX * ZONE_UNIT, z.OffsetY * ZONE_UNIT], size: [z.Width * ZONE_UNIT, z.Height * ZONE_UNIT], area: { bounds: [...c.bounds] as [LatLng, LatLng], scale: c.scale, offset: [...c.offset] as [number, number] } }]
    }),
  ]

  return { source, zones, mobs, npcs, routes, entrances, bindPoints, gameZones }
}

// The map showing a DOL region, and the calibration of that region on it: the
// map's own region, or a capital drawn on it. Regions without a map of their
// own can still share a name with one that has a map: the Atlantis dungeons
// exist once per realm and only the Albion copies have maps.
function mapForRegion(regionId: number, name: string, regionNames: Map<number, string>): { region: Region; calibration?: Calibration } | undefined {
  const idOf = (r: Region) => r.dol?.region ?? r.dolRegion
  const own = REGIONS.find((r) => idOf(r) === regionId) ?? REGIONS.find((r) => idOf(r) !== undefined && regionNames.get(idOf(r)!) === name)
  if (own) return { region: own, calibration: own.dol }
  for (const r of REGIONS) {
    const city = r.drawnCities?.find((c) => c.region === regionId)
    if (city) return { region: r, calibration: city }
  }
  return undefined
}
