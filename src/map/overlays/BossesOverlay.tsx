import { useDeferredValue, useMemo } from 'react'
import { useRegionData } from '../../data/regionData'
import type { MobTier } from '../../data/types'
import { levelMatches, nameMatches, parseLevel } from '../../search'
import { useMapStore } from '../../store'
import { bossBadgeHtml } from '../../ui/badges'
import { BOSS_TIERS } from '../../ui/kinds'
import IconMarkers, { type IconPoint } from './IconMarkers'
import { useSelectById } from './useSelectById'

const SIZES: Record<MobTier, number> = { 1: 20, 2: 28 }

// Epic encounters and named bosses, always drawn as badges (never clustered),
// narrowed down by the search box and level filter like the other mobs.
export default function BossesOverlay() {
  const { mobs } = useRegionData()
  const query = useDeferredValue(useMapStore((s) => s.query))
  const levels = useDeferredValue(useMapStore((s) => s.levels))
  const selectById = useSelectById()

  const byTier = useMemo(() => {
    const points: Record<MobTier, IconPoint[]> = { 1: [], 2: [] }
    for (const [name, level, lat, lng, tier] of mobs) {
      if (!tier || !nameMatches(name, query) || !levelMatches(parseLevel(level), levels)) continue
      points[tier].push({ id: `mob:${name}:`, pos: [lat, lng], html: bossBadgeHtml(tier), label: `${name} (${level}) — ${BOSS_TIERS[tier].label}` })
    }
    return points
  }, [mobs, query, levels])

  return (
    <>
      <IconMarkers points={byTier[1]} size={SIZES[1]} onSelect={selectById} />
      <IconMarkers points={byTier[2]} size={SIZES[2]} onSelect={selectById} />
    </>
  )
}
