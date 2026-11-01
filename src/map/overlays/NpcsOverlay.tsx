import { useMemo, useState } from 'react'
import { useMap, useMapEvents } from 'react-leaflet'
import { useRegionData } from '../../data/regionData'
import { useMapStore } from '../../store'
import { NPC_KINDS } from '../../ui/kinds'
import { npcBadgeHtml } from '../../ui/badges'
import CircleMarkers, { type CirclePoint } from './CircleMarkers'
import IconMarkers, { type IconPoint } from './IconMarkers'
import { useSelectById } from './useSelectById'

// From this zoom NPCs show their kind's icon; below it, towns are a few pixels
// wide and icons would pile up, so they stay colored dots.
const ICON_MIN_ZOOM = 3

export default function NpcsOverlay() {
  const { npcs } = useRegionData()
  const hiddenKinds = useMapStore((s) => s.hiddenNpcKinds)
  const selectById = useSelectById()
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })
  const withIcons = zoom >= ICON_MIN_ZOOM

  const points = useMemo<(CirclePoint & IconPoint)[]>(
    () =>
      npcs
        .filter((npc) => !hiddenKinds.includes(npc.kind))
        .map((npc) => ({
          id: `npc:${npc.name}:${npc.title}`,
          pos: npc.pos,
          color: NPC_KINDS[npc.kind].color,
          html: npcBadgeHtml(npc.kind),
          label: `${npc.name} — ${npc.title || NPC_KINDS[npc.kind].label}`,
        })),
    [npcs, hiddenKinds],
  )

  return withIcons ? <IconMarkers points={points} size={20} onSelect={selectById} /> : <CircleMarkers points={points} radius={5} onSelect={selectById} />
}
