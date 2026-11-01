import { coordinateResults, locate, parseCoordinates } from './coords'
import { REGIONS, toMap } from './data/regions'
import type { GameZone, LatLng } from './data/types'

const ZONE = 8192
const albion = REGIONS.find((r) => r.name === 'Albion-Classic')!.dol!
const zones: GameZone[] = [
  { name: 'Camelot Hills', origin: [67 * ZONE, 59 * ZONE], size: [8 * ZONE, 8 * ZONE] },
  { name: 'Salisbury Plains', origin: [67 * ZONE, 67 * ZONE], size: [8 * ZONE, 8 * ZONE] },
]

describe('parseCoordinates', () => {
  it.each([
    ['27323, 8475', { zone: '', x: 27323, y: 8475 }],
    ['27323 8475', { zone: '', x: 27323, y: 8475 }],
    ['Camelot Hills 27323 8475', { zone: 'Camelot Hills', x: 27323, y: 8475 }],
    ['Camelot Hills: loc=27323,8475,2140 dir=180', { zone: 'Camelot Hills', x: 27323, y: 8475 }],
  ])('parses %j', (query, expected) => {
    expect(parseCoordinates(query)).toEqual(expected)
  })

  it('ignores ordinary searches', () => {
    expect(parseCoordinates('wolf')).toBeNull()
    expect(parseCoordinates('level 12')).toBeNull()
  })
})

describe('locate', () => {
  it('gives global coordinates and the /loc in the zone under the point', () => {
    const location = locate(albion, zones, toMap(albion, 67 * ZONE + 1000, 59 * ZONE + 2000))
    expect(location.zone?.name).toBe('Camelot Hills')
    // toMap rounds to 1/100 map unit, about 20 game units.
    expect(Math.abs(location.loc![0] - 1000)).toBeLessThan(25)
    expect(Math.abs(location.loc![1] - 2000)).toBeLessThan(25)
  })
})

describe('coordinateResults', () => {
  it('places zone-relative coordinates in the named zone', () => {
    const [result] = coordinateResults('Salisbury 1000 2000', albion, zones)
    expect(result.name).toBe('Salisbury Plains · loc 1000, 2000')
    expect(result.positions[0]).toEqual(toMap(albion, 67 * ZONE + 1000, 67 * ZONE + 2000))
  })

  it('offers every zone when none is named, plus global coordinates inside a zone', () => {
    expect(coordinateResults('1000, 2000', albion, zones).map((r) => r.detail)).toEqual(['Camelot Hills', 'Salisbury Plains'])
    expect(coordinateResults(`${70 * ZONE} ${62 * ZONE}`, albion, zones).map((r) => r.name)).toEqual([`X ${70 * ZONE}, Y ${62 * ZONE}`])
  })
})

describe('locate in an embedded capital', () => {
  it("uses the capital's own coordinates inside its square", () => {
    const area = { bounds: [[-10, 10], [-42, 42]] as [LatLng, LatLng], scale: 300, offset: [0, 0] as [number, number] }
    const city: GameZone = { name: 'City of Camelot', origin: [8192, 8192], size: [65536, 65536], area }
    const location = locate(albion, [...zones, city], [-20, 30])
    expect(location.zone?.name).toBe('City of Camelot')
    expect([location.x, location.y]).toEqual([9000, 6000])
    expect(location.loc).toBeNull()
    expect(locate(albion, [...zones, city], [-20, 50]).zone?.name).not.toBe('City of Camelot')
  })
})
