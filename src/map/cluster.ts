import type { LatLng } from '../data/types'

export interface Cluster<T> {
  // Mean position of the members.
  pos: LatLng
  members: T[]
  // South-west and north-east corners of the members, to zoom onto them.
  bounds: [LatLng, LatLng]
}

// Groups points falling in the same square cell of `cellSize` map units.
// Clusters of one member are kept: callers draw them as plain points.
export function clusterByGrid<T>(points: T[], positionOf: (point: T) => LatLng, cellSize: number): Cluster<T>[] {
  const cells = new Map<string, { members: T[]; lat: number; lng: number; minLat: number; minLng: number; maxLat: number; maxLng: number }>()
  for (const point of points) {
    const [lat, lng] = positionOf(point)
    const key = `${Math.floor(lat / cellSize)}:${Math.floor(lng / cellSize)}`
    const cell = cells.get(key)
    if (!cell) {
      cells.set(key, { members: [point], lat, lng, minLat: lat, minLng: lng, maxLat: lat, maxLng: lng })
      continue
    }
    cell.members.push(point)
    cell.lat += lat
    cell.lng += lng
    cell.minLat = Math.min(cell.minLat, lat)
    cell.minLng = Math.min(cell.minLng, lng)
    cell.maxLat = Math.max(cell.maxLat, lat)
    cell.maxLng = Math.max(cell.maxLng, lng)
  }
  return [...cells.values()].map((c) => ({
    pos: [c.lat / c.members.length, c.lng / c.members.length],
    members: c.members,
    bounds: [
      [c.minLat, c.minLng],
      [c.maxLat, c.maxLng],
    ],
  }))
}
