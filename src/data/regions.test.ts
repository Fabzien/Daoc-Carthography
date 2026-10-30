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
    const [actualLat, actualLng] = toMap(region(name), x * ZONE, y * ZONE)
    expect(Math.abs(actualLat - lat)).toBeLessThan(0.5)
    expect(Math.abs(actualLng - lng)).toBeLessThan(0.5)
  })

  it('accounts for the double-scale Midgard-SI tiles', () => {
    // Aegir's Landing (zone offset 30, 38) is the left edge of the drawn map.
    const [, lng] = toMap(region('Midgard-SI'), 30 * ZONE, 38 * ZONE)
    expect(Math.abs(lng)).toBeLessThan(1)
  })
})
