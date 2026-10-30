import type { LatLng } from '../data/types'
import { clusterByGrid } from './cluster'

const at = (p: LatLng) => p

describe('clusterByGrid', () => {
  it('merges points of a cell, with their mean position and bounds', () => {
    const clusters = clusterByGrid<LatLng>([[-1, 1], [-3, 3], [-21, 21]], at, 10)
    expect(clusters).toHaveLength(2)
    const [pair, single] = clusters
    expect(pair.members).toHaveLength(2)
    expect(pair.pos).toEqual([-2, 2])
    expect(pair.bounds).toEqual([[-3, 1], [-1, 3]])
    expect(single.members).toEqual([[-21, 21]])
  })

  it('splits the same points with smaller cells', () => {
    expect(clusterByGrid<LatLng>([[-1, 1], [-3, 3]], at, 1)).toHaveLength(2)
  })
})
