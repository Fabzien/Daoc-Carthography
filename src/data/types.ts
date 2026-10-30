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

// Shape returned by the external mob search API (REST, react-admin style).
export interface Mob {
  _id: string
  Name: string
  loc: { coordinates: LatLng }
  attributes: { type: string }
}
