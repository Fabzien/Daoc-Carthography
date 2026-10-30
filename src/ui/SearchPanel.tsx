import { Suspense, useDeferredValue, useEffect, useMemo, useRef, type KeyboardEvent } from 'react'
import { coordinateResults } from '../coords'
import { useRegionData, useSearchIndex } from '../data/regionData'
import { getRegion, isRegionName, type RegionName } from '../data/regions'
import { useEnter } from '../map/overlays/useEnter'
import { isAnyLevel, MAX_LEVEL, search, type SearchResult } from '../search'
import { useMapStore, type LayerKey } from '../store'
import { describe, levelColor, NPC_KINDS, npcKindCounts, RESULT_KINDS, ROUTE_COLORS } from './kinds'

const RESULT_LIMIT = 100

const LAYER_CHIPS: { key: LayerKey; label: string; color: string }[] = [
  { key: 'mobs', label: 'Mobs', color: RESULT_KINDS.mob.color },
  { key: 'npcs', label: 'NPCs', color: RESULT_KINDS.npc.color },
  { key: 'entrances', label: 'Dungeons', color: RESULT_KINDS.entrance.color },
  { key: 'routes', label: 'Routes', color: ROUTE_COLORS.horse },
  { key: 'zones', label: 'Zones', color: RESULT_KINDS.zone.color },
  { key: 'bindPoints', label: 'Bind points', color: '#00acc1' },
]

function resultColor(result: SearchResult): string {
  return result.kind === 'mob' ? levelColor(result.levels) : RESULT_KINDS[result.kind].color
}

function SearchBox() {
  const query = useMapStore((s) => s.query)
  const setQuery = useMapStore((s) => s.setQuery)
  const selected = useMapStore((s) => s.selected)
  const select = useMapStore((s) => s.select)

  const submitSearch = useMapStore((s) => s.submitSearch)

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') submitSearch()
    if (event.key !== 'Escape') return
    if (selected) select(null)
    else setQuery('')
  }

  return (
    <div className="search-box">
      <span className="search-icon" aria-hidden>
        ⌕
      </span>
      <input
        type="search"
        placeholder="Search mobs, NPCs, dungeons, zones, /loc…"
        aria-label="Search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          select(null)
        }}
        onKeyDown={handleKeyDown}
      />
      {(query || selected) && (
        <button
          className="icon-button"
          aria-label="Clear search"
          onClick={() => {
            setQuery('')
            select(null)
          }}
        >
          ✕
        </button>
      )}
    </div>
  )
}

function LayerChips() {
  const layers = useMapStore((s) => s.layers)
  const toggleLayer = useMapStore((s) => s.toggleLayer)
  return (
    <div className="chips" role="group" aria-label="Map layers">
      {LAYER_CHIPS.map(({ key, label, color }) => (
        <button key={key} className={`chip${layers[key] ? ' chip-on' : ''}`} aria-pressed={layers[key]} onClick={() => toggleLayer(key)}>
          <span className="dot" style={{ background: color }} />
          {label}
        </button>
      ))}
    </div>
  )
}

// Legend of the NPC colors, doubling as a filter: each chip shows or hides a kind.
function NpcKindFilter() {
  const { npcs } = useRegionData()
  const hidden = useMapStore((s) => s.hiddenNpcKinds)
  const toggleNpcKind = useMapStore((s) => s.toggleNpcKind)
  const showAllNpcKinds = useMapStore((s) => s.showAllNpcKinds)
  const counts = useMemo(() => npcKindCounts(npcs), [npcs])
  if (counts.length === 0) return null

  return (
    <div className="npc-kinds" role="group" aria-label="NPC kinds">
      <span>
        NPCs
        {hidden.length > 0 && (
          <button className="link-button" onClick={showAllNpcKinds}>
            Show all
          </button>
        )}
      </span>
      <div className="chips">
        {counts.map(([kind, count]) => {
          const on = !hidden.includes(kind)
          return (
            <button key={kind} className={`chip chip-small${on ? '' : ' chip-off'}`} aria-pressed={on} onClick={() => toggleNpcKind(kind)}>
              <span className="dot" style={{ background: NPC_KINDS[kind].color }} />
              {NPC_KINDS[kind].label} <small>{count}</small>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function LevelFilter() {
  const levels = useMapStore((s) => s.levels)
  const setLevels = useMapStore((s) => s.setLevels)
  // Empty inputs mean an open bound.
  const parse = (value: string, fallback: number) => (value === '' ? fallback : Math.max(0, Math.min(MAX_LEVEL, Number(value))))

  return (
    <div className="level-filter">
      <span>Mob level</span>
      <input
        type="number"
        min={0}
        max={MAX_LEVEL}
        placeholder="min"
        aria-label="Minimum level"
        value={levels.min > 0 ? levels.min : ''}
        onChange={(e) => setLevels({ ...levels, min: parse(e.target.value, 0) })}
      />
      <span>–</span>
      <input
        type="number"
        min={0}
        max={MAX_LEVEL}
        placeholder="max"
        aria-label="Maximum level"
        value={levels.max < MAX_LEVEL ? levels.max : ''}
        onChange={(e) => setLevels({ ...levels, max: parse(e.target.value, MAX_LEVEL) })}
      />
      {!isAnyLevel(levels) && (
        <button className="link-button" onClick={() => setLevels({ min: 0, max: MAX_LEVEL })}>
          Any level
        </button>
      )}
    </div>
  )
}

function PlaceCard({ result }: { result: SearchResult }) {
  const select = useMapStore((s) => s.select)
  const region = useMapStore((s) => s.region)
  const enter = useEnter()
  const target = result.target && isRegionName(result.target.map) ? result.target : undefined
  return (
    <div className="place-card">
      <button className="link-button" onClick={() => select(null)}>
        ← Results
      </button>
      <h2>
        <span className="dot dot-large" style={{ background: resultColor(result) }} />
        {result.name}
      </h2>
      <p>{describe(result)}</p>
      <p className="muted">{getRegion(region).label}</p>
      {/* A copy re-triggers the fly-to effect. */}
      <button className="primary-button" onClick={() => select({ ...result })}>
        Zoom to {result.kind === 'mob' && result.positions.length > 1 ? 'all spawns' : 'location'}
      </button>
      {target && (
        <button className="primary-button secondary-button" onClick={() => enter(target)}>
          Enter {getRegion(target.map as RegionName).label} →
        </button>
      )}
    </div>
  )
}

function Results() {
  const index = useSearchIndex()
  const { gameZones } = useRegionData()
  const { dol } = getRegion(useMapStore((s) => s.region))
  const query = useDeferredValue(useMapStore((s) => s.query))
  const levels = useDeferredValue(useMapStore((s) => s.levels))
  const selected = useMapStore((s) => s.selected)
  const select = useMapStore((s) => s.select)
  const submits = useMapStore((s) => s.submits)
  const results = useMemo(
    () => [...(dol ? coordinateResults(query, dol, gameZones) : []), ...search(index, query, levels)],
    [dol, gameZones, index, query, levels],
  )

  // Enter in the search box picks the first result, read through a ref so the
  // effect runs on submits only.
  const firstResult = useRef<SearchResult | undefined>(undefined)
  useEffect(() => {
    firstResult.current = results[0]
  }, [results])
  useEffect(() => {
    if (submits > 0 && firstResult.current) select(firstResult.current)
  }, [submits, select])

  if (selected) return <PlaceCard result={selected} />
  if (!query.trim() && isAnyLevel(levels)) return null
  if (results.length === 0) return <p className="panel-note">No results on this map.</p>

  return (
    <>
      <p className="panel-note">
        {results.length} result{results.length > 1 ? 's' : ''}
        {results.length > RESULT_LIMIT && `, showing the first ${RESULT_LIMIT}`}
      </p>
      <ul className="results">
        {results.slice(0, RESULT_LIMIT).map((result) => (
          <li key={result.id}>
            <button onClick={() => select(result)}>
              <span className="dot" style={{ background: resultColor(result) }} />
              <span className="result-text">
                <strong>{result.name}</strong>
                <small>{describe(result)}</small>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default function SearchPanel() {
  const showNpcKinds = useMapStore((s) => s.layers.npcs)
  return (
    <aside className="panel">
      <SearchBox />
      <LayerChips />
      <LevelFilter />
      <Suspense fallback={null}>{showNpcKinds && <NpcKindFilter />}</Suspense>
      <Suspense fallback={<p className="panel-note">Loading map data…</p>}>
        <Results />
      </Suspense>
    </aside>
  )
}
