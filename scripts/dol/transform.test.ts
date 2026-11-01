import { REGIONS, toMap } from '../../src/data/regions.ts'
import { buildRegionData, mobTier, npcKind, routeDestination, routeName, type DolMob, type DolTables } from './transform.ts'

const albion = REGIONS.find((r) => r.name === 'Albion-Classic')!
const ZONE = 8192
// Camelot Hills: zone offset (67, 59), 8x8.
const inZone = { X: 70 * ZONE, Y: 62 * ZONE }

function mob(overrides: Partial<DolMob>): DolMob {
  return { Name: 'wolf', Guild: '', ...inZone, Region: 1, Level: 10, Realm: 0, ClassType: 'DOL.GS.GameNPC', NPCTemplateID: 0, Flags: 0, AggroLevel: 50, ...overrides }
}

function tables(overrides: Partial<DolTables>): DolTables {
  return {
    mobs: [],
    templates: [],
    zones: [{ ZoneID: 0, Name: 'Camelot Hills', RegionID: 1, OffsetX: 67, OffsetY: 59, Width: 8, Height: 8 }],
    pathPoints: [],
    zonePoints: [],
    regions: [],
    bindPoints: [],
    ...overrides,
  }
}

describe('npcKind', () => {
  it.each([
    ['DOL.GS.GameMerchant', 'merchant'],
    ['DOL.GS.Trainer.ClericTrainer', 'trainer'],
    ['DOL.GS.GameBoatStableMaster', 'boat'],
    ['DOL.GS.GameStableMaster', 'stable'],
    ['DOL.GS.Keeps.GuardFighter', 'guard'],
    ['DOL.GS.GameNPC', null],
  ])('%s -> %s', (classType, kind) => {
    expect(npcKind(classType)).toBe(kind)
  })
})

describe('routeName', () => {
  it('names stable routes after their ends', () => {
    expect(routeName('HS_SnowdoniaFortress_Humberton')).toBe('Snowdonia Fortress → Humberton')
    expect(routeName('bt_theisle_fintain')).toBe('Theisle → Fintain')
  })

  it('reads a ticket route destination without its handler name', () => {
    expect(routeDestination('Dragonfly_ticket_to_Castle_SauvageFlambon')).toBe('Castle Sauvage')
    expect(routeDestination('HS_SnowdoniaFortress_Humberton')).toBe('Humberton')
  })

  it('falls back to a readable path id', () => {
    expect(routeName('Dragonfly_ticket_to_Castle_Sauvage')).toBe('Dragonfly Ticket To Castle Sauvage')
  })
})

describe('mobTier', () => {
  it('marks listed epic encounters, including name variants', () => {
    expect(mobTier('Golestandt', 80, 1, 80)).toBe(2)
    expect(mobTier('Third Head of Myrddraxis', 80, 1, 80)).toBe(2)
  })

  it('marks unique, hostile, high-level named mobs as named bosses', () => {
    expect(mobTier('Prince Abdin', 78, 1, 80)).toBe(1)
    expect(mobTier('Olen den Bartender', 67, 1, 0)).toBeUndefined()
    expect(mobTier('legionarius', 70, 1, 80)).toBeUndefined()
    expect(mobTier('Granite Giant', 70, 12, 80)).toBeUndefined()
    expect(mobTier('Mob Boss', 60, 1, 80)).toBeUndefined()
  })
})

describe('buildRegionData', () => {
  it('splits hostile mobs from realm and service NPCs', () => {
    const data = buildRegionData(
      albion,
      tables({
        mobs: [
          mob({ Name: 'wolf' }),
          mob({ Name: 'Raguel', Guild: 'Armor Merchant', Realm: 1, ClassType: 'DOL.GS.GameMerchant' }),
          mob({ Name: 'Barkeep', Guild: null, Realm: 1 }),
        ],
      }),
      'test',
    )
    expect(data.mobs.map(([name]) => name)).toEqual(['wolf'])
    expect(data.npcs[1].title).toBe('')
    expect(data.npcs.map((n) => [n.name, n.kind])).toEqual([
      ['Raguel', 'merchant'],
      ['Barkeep', 'other'],
    ])
  })

  it('takes the level from the NPC template when the spawn has none', () => {
    const data = buildRegionData(albion, tables({ mobs: [mob({ Level: 0, NPCTemplateID: 7 })], templates: [{ TemplateId: 7, Name: 'wolf', Level: '10-12' }] }), 'test')
    expect(data.mobs[0][1]).toBe('10-12')
  })

  it('drops entities outside the drawn zones and other regions', () => {
    const data = buildRegionData(albion, tables({ mobs: [mob({ X: 10 * ZONE }), mob({ Region: 2 })] }), 'test')
    expect(data.mobs).toEqual([])
  })

  it('keeps paths that start at a stable master, with their destination', () => {
    const data = buildRegionData(
      albion,
      tables({
        mobs: [
          mob({ Name: 'Flambon', Realm: 1, ClassType: 'DOL.GS.GameStableMaster' }),
          mob({ Name: 'Uliam', Realm: 1, ClassType: 'DOL.GS.GameStableMaster', X: inZone.X + 5000 }),
        ],
        pathPoints: [
          { PathID: 'HS_A_B', Step: 2, X: inZone.X + 5000, Y: inZone.Y },
          { PathID: 'HS_A_B', Step: 1, X: inZone.X + 100, Y: inZone.Y },
          // Uliam's own route names his town; the ticket route ending at him leads there.
          { PathID: 'HS_Caer_A', Step: 1, X: inZone.X + 5000, Y: inZone.Y },
          { PathID: 'HS_Caer_A', Step: 2, X: inZone.X, Y: inZone.Y },
          { PathID: 'Dragonfly_ticket_to_Somewhere_Flambon', Step: 1, X: inZone.X, Y: inZone.Y },
          { PathID: 'Dragonfly_ticket_to_Somewhere_Flambon', Step: 2, X: inZone.X + 5000, Y: inZone.Y },
          // A guard patrol starting next to a stable master isn't a route.
          { PathID: 'Cotswold_Guard_2', Step: 1, X: inZone.X, Y: inZone.Y },
          { PathID: 'Cotswold_Guard_2', Step: 2, X: inZone.X + 3000, Y: inZone.Y },
          { PathID: 'patrol', Step: 1, X: inZone.X + 20000, Y: inZone.Y },
          { PathID: 'patrol', Step: 2, X: inZone.X + 30000, Y: inZone.Y },
        ],
      }),
      'test',
    )
    expect(data.routes.map((r) => [r.name, r.master, r.to])).toEqual([
      ['A → B', 'Flambon', 'Caer'],
      ['Caer → A', 'Uliam', 'A'],
      ['Dragonfly Ticket To Somewhere Flambon', 'Flambon', 'Caer'],
    ])
    expect(data.routes[0].kind).toBe('horse')
    expect(data.routes[0].path[0][1]).toBeLessThan(data.routes[0].path[1][1])
  })

  it('names entrances after their target region and skips unknown targets', () => {
    const data = buildRegionData(
      albion,
      tables({
        regions: [{ RegionID: 249, Description: 'Darkness Falls' }],
        zonePoints: [
          { SourceRegion: 1, SourceX: inZone.X, SourceY: inZone.Y, TargetRegion: 249, TargetX: 0, TargetY: 0 },
          { SourceRegion: 1, SourceX: inZone.X + 10, SourceY: inZone.Y, TargetRegion: 249, TargetX: 0, TargetY: 0 },
          { SourceRegion: 1, SourceX: inZone.X, SourceY: inZone.Y, TargetRegion: 1007, TargetX: 0, TargetY: 0 },
        ],
      }),
      'test',
    )
    expect(data.entrances.map((e) => e.name)).toEqual(['Darkness Falls'])
  })

  it('links entrances to the map they lead to, with the arrival point', () => {
    const data = buildRegionData(
      albion,
      tables({
        regions: [{ RegionID: 23, Description: 'Catacombs of Cardova' }],
        zonePoints: [{ SourceRegion: 1, SourceX: inZone.X, SourceY: inZone.Y, TargetRegion: 23, TargetX: 30000, TargetY: 35000 }],
      }),
      'test',
    )
    expect(data.entrances[0].target?.map).toBe('Catacombs-of-Cardova')
    expect(data.entrances[0].target?.pos).toEqual(expect.arrayContaining([expect.any(Number)]))
  })

  it('lists every zone of the region in game units', () => {
    const data = buildRegionData(albion, tables({}), 'test')
    expect(data.gameZones).toEqual([{ name: 'Camelot Hills', origin: [67 * ZONE, 59 * ZONE], size: [8 * ZONE, 8 * ZONE] }])
  })

  it('returns no data for maps without DOL calibration', () => {
    const treibh = REGIONS.find((r) => r.name === 'Treibh-Caillte')!
    const data = buildRegionData(treibh, tables({ mobs: [mob({ Region: 224 })] }), 'test')
    expect(data.mobs).toEqual([])
  })

  it('keeps what falls on a floor plan, without zones', () => {
    const catacombs = REGIONS.find((r) => r.name === 'Catacombs-of-Cardova')!
    const data = buildRegionData(
      catacombs,
      tables({
        zones: [{ ZoneID: 1, Name: 'Catacombs of Cardova', RegionID: 23, OffsetX: 1, OffsetY: 1, Width: 8, Height: 8 }],
        mobs: [mob({ Region: 23, X: 30000, Y: 35000 }), mob({ Region: 23, X: 90000, Y: 35000 })],
      }),
      'test',
    )
    expect(data.zones).toEqual([])
    expect(data.mobs).toHaveLength(1)
  })

  it('places a capital drawn on the map with its own calibration', () => {
    const camelot = albion.drawnCities![0]
    const [[top, left], [bottom, right]] = camelot.bounds
    // A point of region 10 at the middle of its drawn square.
    const middle = { X: ((left + right) / 2 - camelot.offset[0]) * camelot.scale, Y: (-(top + bottom) / 2 - camelot.offset[1]) * camelot.scale }
    const data = buildRegionData(
      albion,
      tables({
        zones: [
          { ZoneID: 0, Name: 'Camelot Hills', RegionID: 1, OffsetX: 67, OffsetY: 59, Width: 8, Height: 8 },
          { ZoneID: 26, Name: 'City of Camelot', RegionID: 10, OffsetX: 1, OffsetY: 1, Width: 8, Height: 8 },
        ],
        regions: [{ RegionID: 10, Description: 'Camelot City' }],
        mobs: [mob({ Name: 'Guard', Realm: 1, Region: 10, ...middle })],
        zonePoints: [{ SourceRegion: 1, SourceX: inZone.X, SourceY: inZone.Y, TargetRegion: 10, TargetX: middle.X, TargetY: middle.Y }],
      }),
      'test',
    )
    expect(data.npcs.map((n) => n.name)).toEqual(['Guard'])
    expect(data.zones.find((z) => z.name === 'City of Camelot')?.bounds).toEqual(camelot.bounds)
    // The entrance to the city stays on this map, arriving in the city.
    expect(data.entrances[0].target).toEqual({ map: 'Albion-Classic', pos: toMap(camelot, middle.X, middle.Y) })
    expect(data.gameZones.find((z) => z.name === 'City of Camelot')?.area?.scale).toBe(camelot.scale)
  })

  it('marks bosses on mobs and turns peaceful realm-0 creatures into NPCs', () => {
    const data = buildRegionData(
      albion,
      tables({ mobs: [mob({ Name: 'Golestandt', Level: 80 }), mob({ Name: 'Explorer Tegena', Level: 80, Flags: 16 })] }),
      'test',
    )
    expect(data.mobs).toEqual([['Golestandt', '80', expect.any(Number), expect.any(Number), 2]])
    expect(data.npcs.map((n) => n.name)).toEqual(['Explorer Tegena'])
  })
})
