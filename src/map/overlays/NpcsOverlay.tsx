import { useMemo } from 'react'
import { useRegionData } from '../../data/regionData'
import { NPC_KINDS } from '../../ui/kinds'
import CircleMarkers, { type CirclePoint } from './CircleMarkers'
import { useSelectById } from './useSelectById'

export default function NpcsOverlay() {
  const { npcs } = useRegionData()
  const selectById = useSelectById()
  const points = useMemo<CirclePoint[]>(
    () =>
      npcs.map((npc) => ({
        id: `npc:${npc.name}:${npc.title}`,
        pos: npc.pos,
        color: NPC_KINDS[npc.kind].color,
        label: `${npc.name} — ${npc.title || NPC_KINDS[npc.kind].label}`,
      })),
    [npcs],
  )
  return <CircleMarkers points={points} radius={5} onSelect={selectById} />
}
