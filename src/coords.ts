import { toGame, toMap, type Region } from './data/regions'
import type { GameZone, LatLng } from './data/types'
import type { SearchResult } from './search'

type Calibration = NonNullable<Region['dol']>

// In-game coordinates of a map point: global DOL ones, and the zone-relative
// ones the /loc command shows when the point is in a zone.
export interface GameLocation {
  x: number
  y: number
  zone: GameZone | null
  loc: [number, number] | null
}

export function locate(dol: Calibration, zones: GameZone[], pos: LatLng): GameLocation {
  const [x, y] = toGame(dol, pos)
  const zone = zones.find((z) => x >= z.origin[0] && x < z.origin[0] + z.size[0] && y >= z.origin[1] && y < z.origin[1] + z.size[1]) ?? null
  return { x, y, zone, loc: zone && [x - zone.origin[0], y - zone.origin[1]] }
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
  const add = (id: string, name: string, detail: string, x: number, y: number) => {
    const pos = toMap(dol, x, y)
    if (isOnMap(pos)) results.push({ id, kind: 'location', name, detail, levels: null, positions: [pos] })
  }
  const named = parsed.zone.toLowerCase()
  for (const zone of zones) {
    if (named && !zone.name.toLowerCase().includes(named)) continue
    if (parsed.x >= zone.size[0] || parsed.y >= zone.size[1]) continue
    add(`loc:${zone.name}:${parsed.x}:${parsed.y}`, `${zone.name} · loc ${parsed.x}, ${parsed.y}`, zone.name, zone.origin[0] + parsed.x, zone.origin[1] + parsed.y)
  }
  if (!named) {
    const zone = locate(dol, zones, toMap(dol, parsed.x, parsed.y)).zone
    if (zone) add(`xy:${parsed.x}:${parsed.y}`, `X ${parsed.x}, Y ${parsed.y}`, zone.name, parsed.x, parsed.y)
  }
  return results
}
