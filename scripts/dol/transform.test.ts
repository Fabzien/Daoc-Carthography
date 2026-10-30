import { REGIONS } from '../../src/data/regions.ts'
import { buildRegionData, npcKind, routeName, type DolMob, type DolTables } from './transform.ts'

const albion = REGIONS.find((r) => r.name === 'Albion-Classic')!
const ZONE = 8192
// Camelot Hills: zone offset (67, 59), 8x8.
const inZone = { X: 70 * ZONE, Y: 62 * ZONE }

function mob(overrides: Partial<DolMob>): DolMob {
  return { Name: 'wolf', Guild: '', ...inZone, Region: 1, Level: 10, Realm: 0, ClassType: 'DOL.GS.GameNPC', NPCTemplateID: 0, ...overrides }
}

function tables(overrides: Partial<DolTables>): DolTables {
  return {
    mobs: [],
    templates: [],
    zones: [{ Name: 'Camelot Hills', RegionID: 1, OffsetX: 67, OffsetY: 59, Width: 8, Height: 8 }],
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

  it('falls back to a readable path id', () => {
    expect(routeName('Dragonfly_ticket_to_Castle_Sauvage')).toBe('Dragonfly Ticket To Castle Sauvage')
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

  it('keeps paths that start at a stable master', () => {
    const data = buildRegionData(
      albion,
      tables({
        mobs: [mob({ Realm: 1, ClassType: 'DOL.GS.GameStableMaster' })],
        pathPoints: [
          { PathID: 'HS_A_B', Step: 2, X: inZone.X + 5000, Y: inZone.Y },
          { PathID: 'HS_A_B', Step: 1, X: inZone.X + 100, Y: inZone.Y },
          { PathID: 'patrol', Step: 1, X: inZone.X + 20000, Y: inZone.Y },
          { PathID: 'patrol', Step: 2, X: inZone.X + 30000, Y: inZone.Y },
        ],
      }),
      'test',
    )
    expect(data.routes).toHaveLength(1)
    expect(data.routes[0]).toMatchObject({ name: 'A → B', kind: 'horse' })
    expect(data.routes[0].path[0][1]).toBeLessThan(data.routes[0].path[1][1])
  })

  it('names entrances after their target region and skips unknown targets', () => {
    const data = buildRegionData(
      albion,
      tables({
        regions: [{ RegionID: 249, Description: 'Darkness Falls' }],
        zonePoints: [
          { SourceRegion: 1, SourceX: inZone.X, SourceY: inZone.Y, TargetRegion: 249 },
          { SourceRegion: 1, SourceX: inZone.X + 10, SourceY: inZone.Y, TargetRegion: 249 },
          { SourceRegion: 1, SourceX: inZone.X, SourceY: inZone.Y, TargetRegion: 1007 },
        ],
      }),
      'test',
    )
    expect(data.entrances.map((e) => e.name)).toEqual(['Darkness Falls'])
  })
})
