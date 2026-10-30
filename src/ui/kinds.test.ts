import type { Npc } from '../data/types'
import { npcKindCounts } from './kinds'

const npc = (kind: Npc['kind']): Npc => ({ name: 'x', title: '', kind, pos: [0, 0] })

describe('npcKindCounts', () => {
  it('counts present kinds in legend order', () => {
    expect(npcKindCounts([npc('other'), npc('merchant'), npc('guard'), npc('merchant')])).toEqual([
      ['merchant', 2],
      ['guard', 1],
      ['other', 1],
    ])
  })
})
