import { toGame, toMap, type Calibration } from './data/regions'
import type { GameZone, LatLng } from './data/types'
import type { SearchResult } from './search'

// In-game coordinates of a map point: global DOL ones, and the zone-relative
// ones the /loc command shows when the point is in a zone.
export interface GameLocation {
  x: number
  y: number
  zone: GameZone | null
  loc: [number, number] | null
}

function within([[lat1, lng1], [lat2, lng2]]: [LatLng, LatLng], [lat, lng]: LatLng): boolean {
  return lat <= Math.max(lat1, lat2) && lat >= Math.min(lat1, lat2) && lng >= Math.min(lng1, lng2) && lng <= Math.max(lng1, lng2)
}

function inZone(zone: GameZone, x: number, y: number): boolean {
  return x >= zone.origin[0] && x < zone.origin[0] + zone.size[0] && y >= zone.origin[1] && y < zone.origin[1] + zone.size[1]
}

// Inside the square of a drawn capital, the coordinates are that
// region's; elsewhere, the map's own.
export function locate(dol: Calibration, zones: GameZone[], pos: LatLng): GameLocation {
  const city = zones.find((z) => z.area && within(z.area.bounds, pos))
  const [x, y] = toGame(city?.area ?? dol, pos)
  const zone = city ?? zones.find((z) => !z.area && inZone(z, x, y)) ?? null
  return { x, y, zone, loc: zone && inZone(zone, x, y) ? [x - zone.origin[0], y - zone.origin[1]] : null }
}

export interface ParsedCoordinates {
  zone: string
  x: number
  y: number
}

// Coordinates typed in the search box: "27323, 8475", "Camelot Hills 27323 8475",
// or a /loc line such as "Camelot Hills: loc=27323,8475,2140 dir=180". A third
// number (height) and anything after it are ignored.
export function parseCoordinates(query: string): ParsedCoordinates | null {
  const match = /^([^\d]*?)[\s:]*(?:loc\s*=?\s*)?(\d+)\s*[,\s]\s*(\d+)(?:\s*[,\s]\s*-?\d+)?(?:\s.*)?$/i.exec(query.trim())
  if (!match) return null
  return { zone: match[1].trim(), x: Number(match[2]), y: Number(match[3]) }
}

function isOnMap([lat, lng]: LatLng): boolean {
  return lat <= 0 && lat >= -256 && lng >= 0 && lng <= 256
}

// Search results for coordinates on the current map: zone-relative ones (in the
// named zone, or in every zone they fit when none is named) and global ones.
export function coordinateResults(query: string, dol: Calibration, zones: GameZone[]): SearchResult[] {
  const parsed = parseCoordinates(query)
  if (!parsed) return []
  const results: SearchResult[] = []
  const add = (id: string, name: string, detail: string, x: number, y: number, area?: GameZone['area']) => {
    const pos = toMap(area ?? dol, x, y)
    if (isOnMap(pos) && (!area || within(area.bounds, pos))) results.push({ id, kind: 'location', name, detail, levels: null, positions: [pos] })
  }
  const named = parsed.zone.toLowerCase()
  for (const zone of zones) {
    if (named && !zone.name.toLowerCase().includes(named)) continue
    if (parsed.x >= zone.size[0] || parsed.y >= zone.size[1]) continue
    add(`loc:${zone.name}:${parsed.x}:${parsed.y}`, `${zone.name} · loc ${parsed.x}, ${parsed.y}`, zone.name, zone.origin[0] + parsed.x, zone.origin[1] + parsed.y, zone.area)
  }
  if (!named) {
    const zone = locate(dol, zones, toMap(dol, parsed.x, parsed.y)).zone
    if (zone) add(`xy:${parsed.x}:${parsed.y}`, `X ${parsed.x}, Y ${parsed.y}`, zone.name, parsed.x, parsed.y)
  }
  return results
}
