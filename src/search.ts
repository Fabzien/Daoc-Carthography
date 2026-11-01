import type { Entrance, LatLng, MobTier, RegionData, Route } from './data/types'

export type ResultKind = 'mob' | 'npc' | 'entrance' | 'zone' | 'route' | 'location'

// One search result: entities sharing a name are grouped (a mob name usually
// has many spawns), so `positions` holds every location to show.
export interface SearchResult {
  id: string
  kind: ResultKind
  name: string
  detail: string
  levels: [number, number] | null
  positions: LatLng[]
  // Where an entrance leads.
  target?: Entrance['target']
  // For a notable mob: named boss or epic encounter.
  tier?: MobTier
  // For a stable or boat master: the routes departing from them. For a route: itself.
  routes?: Route[]
}

// A route as a search result, shown whole.
export function routeResult(route: Route): SearchResult {
  return { id: `route:${route.master}:${route.name}`, kind: 'route', name: route.name, detail: route.kind, levels: null, positions: route.path, routes: [route] }
}

export interface LevelFilter {
  min: number
  max: number
}

export const MAX_LEVEL = 90
export const ANY_LEVEL: LevelFilter = { min: 0, max: MAX_LEVEL }

export function isAnyLevel(filter: LevelFilter): boolean {
  return filter.min <= ANY_LEVEL.min && filter.max >= ANY_LEVEL.max
}

// "51-55" -> [51, 55], "45" -> [45, 45], "?" -> null
export function parseLevel(level: string): [number, number] | null {
  const [min, max = min] = level.split('-').map((v) => Number.parseInt(v, 10))
  return Number.isNaN(min) || Number.isNaN(max) ? null : [min, max]
}

// Mob level ranges match when they overlap the filter; unknown levels only match "any level".
export function levelMatches(levels: [number, number] | null, filter: LevelFilter): boolean {
  if (isAnyLevel(filter)) return true
  return levels !== null && levels[0] <= filter.max && levels[1] >= filter.min
}

export function nameMatches(name: string, query: string): boolean {
  return name.toLowerCase().includes(query.trim().toLowerCase())
}

function group(
  results: Map<string, SearchResult>,
  kind: ResultKind,
  name: string,
  detail: string,
  pos: LatLng,
  levels: [number, number] | null = null,
) {
  const id = `${kind}:${name}:${detail}`
  const result = results.get(id)
  if (!result) {
    results.set(id, { id, kind, name, detail, levels, positions: [pos] })
    return
  }
  result.positions.push(pos)
  if (levels) result.levels = result.levels ? [Math.min(result.levels[0], levels[0]), Math.max(result.levels[1], levels[1])] : levels
}

// Every searchable entity of a region, grouped by name.
export function buildIndex(data: RegionData): SearchResult[] {
  const results = new Map<string, SearchResult>()
  for (const [name, level, lat, lng, tier] of data.mobs) {
    group(results, 'mob', name, '', [lat, lng], parseLevel(level))
    if (tier) results.get(`mob:${name}:`)!.tier = tier
  }
  for (const npc of data.npcs) group(results, 'npc', npc.name, npc.title, npc.pos)
  // Stable and boat masters list the routes leaving from where they stand.
  for (const route of data.routes) {
    const master = [...results.values()].find((r) => r.kind === 'npc' && r.name === route.master && r.positions.some(([lat, lng]) => lat === route.from[0] && lng === route.from[1]))
    if (master) (master.routes ??= []).push(route)
  }
  for (const entrance of data.entrances) {
    group(results, 'entrance', entrance.name, '', entrance.pos)
    const result = results.get(`entrance:${entrance.name}:`)!
    result.target ??= entrance.target
  }
  // Zones and routes are shown whole: their positions are their outline or path.
  for (const zone of data.zones) {
    results.set(`zone:${zone.name}`, { id: `zone:${zone.name}`, kind: 'zone', name: zone.name, detail: '', levels: null, positions: zone.bounds })
  }
  for (const route of data.routes) {
    const result = routeResult(route)
    results.set(result.id, result)
  }
  return [...results.values()]
}

// Results for a query and level filter. With an empty query, the level filter
// alone lists the mobs in that range; with neither, there is nothing to list.
export function search(index: SearchResult[], query: string, levels: LevelFilter): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q && isAnyLevel(levels)) return []
  const matches = index.filter((r) => {
    if (q && !nameMatches(r.name, q) && !nameMatches(r.detail, q)) return false
    if (isAnyLevel(levels)) return true
    return r.kind === 'mob' && levelMatches(r.levels, levels)
  })
  const rank = (r: SearchResult) => (r.name.toLowerCase() === q ? 0 : r.name.toLowerCase().startsWith(q) ? 1 : 2)
  return matches.sort((a, b) => rank(a) - rank(b) || (a.levels?.[0] ?? 0) - (b.levels?.[0] ?? 0) || a.name.localeCompare(b.name))
}
