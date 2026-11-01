import type { MobTier, Npc, NpcKind } from '../data/types'
import type { ResultKind, SearchResult } from '../search'

export const NPC_KINDS: Record<NpcKind, { color: string; label: string }> = {
  merchant: { color: '#f5b700', label: 'Merchant' },
  trainer: { color: '#9b5de5', label: 'Trainer' },
  healer: { color: '#00c49a', label: 'Healer' },
  stable: { color: '#a0522d', label: 'Stable master' },
  boat: { color: '#1e90ff', label: 'Boat master' },
  teleporter: { color: '#ff5ecb', label: 'Teleporter' },
  guard: { color: '#e63946', label: 'Guard' },
  crafting: { color: '#ff8c42', label: 'Crafting' },
  vault: { color: '#607d8b', label: 'Vault keeper' },
  // Not white: icons draw a white pictogram on this color.
  other: { color: '#8a8f94', label: 'NPC' },
}

// How many NPCs of each kind, in NPC_KINDS order, leaving out absent kinds.
export function npcKindCounts(npcs: Npc[]): [NpcKind, number][] {
  const counts = new Map<NpcKind, number>()
  for (const npc of npcs) counts.set(npc.kind, (counts.get(npc.kind) ?? 0) + 1)
  return (Object.keys(NPC_KINDS) as NpcKind[]).filter((kind) => counts.has(kind)).map((kind) => [kind, counts.get(kind)!])
}

export const BOSS_TIERS: Record<MobTier, { color: string; label: string }> = {
  1: { color: '#c62828', label: 'Named boss' },
  2: { color: '#7b1fa2', label: 'Epic encounter' },
}

export const RESULT_KINDS: Record<ResultKind, { color: string; label: string }> = {
  mob: { color: '#e8710a', label: 'Mob' },
  npc: { color: '#1a73e8', label: 'NPC' },
  entrance: { color: '#263238', label: 'Dungeon entrance' },
  zone: { color: '#188038', label: 'Zone' },
  route: { color: '#a0522d', label: 'Route' },
  location: { color: '#d93025', label: 'Game location' },
}

export const ROUTE_COLORS = { horse: '#d4a373', boat: '#4ea8de' }

// Green for low levels to red for level 60+.
export function levelColor(levels: [number, number] | null): string {
  if (!levels) return '#888'
  return `hsl(${120 - Math.min(levels[0], 60) * 2}, 85%, 50%)`
}

export function formatLevels(levels: [number, number] | null): string {
  if (!levels) return 'level ?'
  return levels[0] === levels[1] ? `level ${levels[0]}` : `level ${levels[0]}–${levels[1]}`
}

// Second line of a result: what it is, and the details that tell homonyms apart.
export function describe(result: SearchResult): string {
  switch (result.kind) {
    case 'mob': {
      const spawns = result.positions.length
      return `${result.tier ? BOSS_TIERS[result.tier].label : 'Mob'} · ${formatLevels(result.levels)} · ${spawns} spawn${spawns > 1 ? 's' : ''}`
    }
    case 'npc':
      return result.detail ? `NPC · ${result.detail}` : 'NPC'
    case 'route':
      return result.detail === 'boat' ? 'Boat route' : 'Horse route'
    case 'location':
      return result.detail ? `Game location · ${result.detail}` : 'Game location'
    default:
      return RESULT_KINDS[result.kind].label
  }
}
