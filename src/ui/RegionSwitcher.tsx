import { useState } from 'react'
import { getRegion, REGIONS, thumbnailUrl, type RegionGroup } from '../data/regions'
import { useMapStore } from '../store'

const GROUPS = [...new Set(REGIONS.map((r) => r.group))] as RegionGroup[]

// Map picker in the bottom-left corner, like Google Maps' layer switcher.
export default function RegionSwitcher() {
  const [open, setOpen] = useState(false)
  const regionName = useMapStore((s) => s.region)
  const setRegion = useMapStore((s) => s.setRegion)
  const current = getRegion(regionName)

  return (
    <div className="region-switcher">
      {open && (
        <div className="region-list" role="dialog" aria-label="Maps">
          {GROUPS.map((group) => (
            <section key={group}>
              <h3>{group}</h3>
              <div className="region-options">
                {REGIONS.filter((r) => r.group === group).map((region) => (
                  <button
                    key={region.name}
                    className={`region-option${region.name === regionName ? ' region-option-on' : ''}`}
                    onClick={() => {
                      setRegion(region.name)
                      setOpen(false)
                    }}
                  >
                    <img src={thumbnailUrl(region)} alt="" loading="lazy" />
                    <span>{region.label}</span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <button className="region-current" aria-expanded={open} onClick={() => setOpen(!open)}>
        <img src={thumbnailUrl(current)} alt="" />
        <span>{current.label}</span>
      </button>
    </div>
  )
}
