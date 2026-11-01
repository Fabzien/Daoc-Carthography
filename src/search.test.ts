import type { RegionData } from './data/types'
import { ANY_LEVEL, buildIndex, levelMatches, parseLevel, search } from './search'

const data: RegionData = {
  source: 'test',
  zones: [{ name: 'Camelot Hills', bounds: [[-55, 127], [-87, 159]] }],
  mobs: [
    ['wolf', '10-12', -60, 130],
    ['wolf', '14', -61, 131],
    ['werewolf', '45', -70, 140],
    ['bandit', '?', -65, 135],
    ['Golestandt', '80', -80, 150, 2],
  ],
  npcs: [{ name: 'Raguel', title: 'Armor Merchant', kind: 'merchant', pos: [-62, 132] }],
  routes: [{ name: 'Camelot → Humberton', kind: 'horse', path: [[-60, 130], [-70, 140]], master: 'Edarg', from: [-60, 130], to: 'Humberton' }],
  entrances: [{ name: 'Darkness Falls', pos: [-81, 152] }],
  bindPoints: [],
  gameZones: [],
}
const index = buildIndex(data)

describe('parseLevel / levelMatches', () => {
  it('parses single levels, ranges and unknown levels', () => {
    expect(parseLevel('45')).toEqual([45, 45])
    expect(parseLevel('51-55')).toEqual([51, 55])
    expect(parseLevel('?')).toBeNull()
  })

  it('matches overlapping ranges, and unknown levels only without a filter', () => {
    expect(levelMatches([51, 55], { min: 54, max: 60 })).toBe(true)
    expect(levelMatches([51, 55], { min: 56, max: 60 })).toBe(false)
    expect(levelMatches(null, { min: 1, max: 10 })).toBe(false)
    expect(levelMatches(null, ANY_LEVEL)).toBe(true)
  })
})

describe('search', () => {
  it('groups spawns of a mob under one result with their level span', () => {
    const [wolf] = search(index, 'wolf', ANY_LEVEL)
    expect(wolf).toMatchObject({ kind: 'mob', name: 'wolf', levels: [10, 14] })
    expect(wolf.positions).toHaveLength(2)
  })

  it('ranks exact and prefix matches first', () => {
    expect(search(index, 'wolf', ANY_LEVEL).map((r) => r.name)).toEqual(['wolf', 'werewolf'])
  })

  it('finds every kind, including NPCs by title', () => {
    expect(search(index, 'armor', ANY_LEVEL).map((r) => r.name)).toEqual(['Raguel'])
    expect(search(index, 'darkness', ANY_LEVEL)[0].kind).toBe('entrance')
    expect(search(index, 'camelot', ANY_LEVEL).map((r) => r.kind).sort()).toEqual(['route', 'zone'])
  })

  it('lists mobs in a level range with an empty query', () => {
    expect(search(index, '', { min: 40, max: 50 }).map((r) => r.name)).toEqual(['werewolf'])
  })

  it('returns nothing without a query or level filter', () => {
    expect(search(index, '  ', ANY_LEVEL)).toEqual([])
  })
})

describe('notable mobs', () => {
  it('carries the boss tier into the search result', () => {
    expect(search(index, 'golestandt', ANY_LEVEL)[0]).toMatchObject({ kind: 'mob', tier: 2 })
    expect(search(index, 'wolf', ANY_LEVEL)[0].tier).toBeUndefined()
  })
})

describe('stable masters', () => {
  it('lists the routes departing from where the master stands', () => {
    const withMaster: RegionData = { ...data, npcs: [...data.npcs, { name: 'Edarg', title: 'Stable Master', kind: 'stable', pos: [-60, 130] }] }
    const [master] = search(buildIndex(withMaster), 'edarg', ANY_LEVEL)
    expect(master.routes?.map((r) => r.to)).toEqual(['Humberton'])
  })
})
