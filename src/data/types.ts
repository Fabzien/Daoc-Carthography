// Coordinates are CRS.Simple pixel-space values, not geographic ones.
export type LatLng = [number, number]

export interface Zone {
  name: string
  loc: [LatLng, LatLng]
}

export interface HorseRoute {
  name: string
  description: string
  loc: LatLng
  path: LatLng[][]
}

export interface Entrance {
  name: string
  loc: LatLng
}
