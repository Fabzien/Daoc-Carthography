import { useMemo } from 'react'
import { useRegionData } from '../../data/regionData'
import type { NpcKind } from '../../data/types'
import CircleMarkers, { type CirclePoint } from './CircleMarkers'

const KIND_STYLES: Record<NpcKind, { color: string; label: string }> = {
  merchant: { color: '#f5b700', label: 'Merchant' },
  trainer: { color: '#9b5de5', label: 'Trainer' },
  healer: { color: '#00c49a', label: 'Healer' },
  stable: { color: '#a0522d', label: 'Stable master' },
  boat: { color: '#1e90ff', label: 'Boat master' },
  teleporter: { color: '#ff5ecb', label: 'Teleporter' },
  guard: { color: '#e63946', label: 'Guard' },
  crafting: { color: '#ff8c42', label: 'Crafting' },
  vault: { color: '#c0c0c0', label: 'Vault keeper' },
  other: { color: '#ffffff', label: 'NPC' },
}

export default function NpcsOverlay() {
  const { npcs } = useRegionData()
  const points = useMemo<CirclePoint[]>(
    () =>
      npcs.map((npc) => ({
        pos: npc.pos,
        color: KIND_STYLES[npc.kind].color,
        label: `${npc.name} — ${npc.title || KIND_STYLES[npc.kind].label}`,
      })),
    [npcs],
  )
  return <CircleMarkers points={points} radius={5} />
}
