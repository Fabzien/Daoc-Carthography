import { REGIONS, toMap, type RegionName } from './regions'

const region = (name: RegionName) => REGIONS.find((r) => r.name === name)!
const ZONE = 8192

describe('toMap', () => {
  // Zone corners hand-placed on the tiles before the DOL import existed.
  it.each([
    ['Albion-Classic', [43, 77], [-127.8, 31.64]], // Cornwall
    ['Albion-Classic', [67, 59], [-55.77, 127.63]], // Camelot Hills
    ['Albion-SI', [60, 60], [-65.41, 127.91]], // Isle of Glass
    ['Hibernian-Classic', [27, 51], [-0.04, 0.03]], // Cliffs of Moher
    ['Hibernian-Classic', [43, 87], [-144.03, 64]], // Bog of Cullen
  ] as const)('places %s zone offset %j on its drawn corner', (name, [x, y], [lat, lng]) => {
    const [actualLat, actualLng] = toMap(region(name).dol!, x * ZONE, y * ZONE)
    expect(Math.abs(actualLat - lat)).toBeLessThan(0.5)
    expect(Math.abs(actualLng - lng)).toBeLessThan(0.5)
  })

  it('accounts for the double-scale Midgard-SI tiles', () => {
    // Aegir's Landing (zone offset 30, 38) is the left edge of the drawn map.
    const [, lng] = toMap(region('Midgard-SI').dol!, 30 * ZONE, 38 * ZONE)
    expect(Math.abs(lng)).toBeLessThan(1)
  })
})

describe('dungeon maps', () => {
  it('spreads a fitted zone map over the 256-unit map', () => {
    // Darkness Falls: 85.447 game units per pixel of the zone map resized to 512 px, top-left at (8084, 8814).
    const dol = region('Darkness-Falls').dol!
    expect(toMap(dol, 8084, 8814)).toEqual([-0, 0])
    expect(toMap(dol, 8084 + 512 * 85.447, 8814 + 512 * 85.447)).toEqual([-256, 256])
  })

  it('spreads a fitted floor plan over the 256-unit map', () => {
    // Muire Tomb: 13.899 game units per pixel of a 1024 px plan, top-left at (26562, 26744).
    const dol = region('Muire-Tomb').dol!
    expect(toMap(dol, 26562 + 1024 * 13.899, 26744 + 1024 * 13.899)).toEqual([-256, 256])
  })

  it('keeps maps without a reliable fit reachable but without DOL calibration', () => {
    expect(region('Tur-Suil').dol).toBeUndefined()
    expect(region('Tur-Suil').dolRegion).toBe(190)
    expect(region('Tur-Suil').zoneMap).toBe('zone190')
  })
})
