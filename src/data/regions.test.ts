import server from './server.json'
import { getRegionData, isRegionName, REGIONS } from './regions'

describe('regions', () => {
  it('has a region entry for every World key in server.json', () => {
    for (const name of Object.keys(server.World)) {
      expect(isRegionName(name)).toBe(true)
    }
  })

  it('returns entrances for every region declared in server.json', () => {
    for (const region of REGIONS) {
      const expected = region.name in server.World ? 1 : 0
      expect(getRegionData(region.name).entrances.length >= expected).toBe(true)
    }
  })

  it('returns empty data for a region with nothing configured', () => {
    expect(getRegionData('Frontiers')).toEqual({ zones: [], horses: [], entrances: [] })
  })
})
