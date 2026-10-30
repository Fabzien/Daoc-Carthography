import { useState } from 'react'
import { REGIONS, type Region } from '../data/regions'
import { useMapStore } from '../store'

// The whole map at zoom 0 makes a ready-made thumbnail.
const thumbnail = (region: Region) => region.tiles.replace('{z}/{x}/{y}', '0/0/0')
const label = (region: Region) => region.name.replace('-', ' · ')

// Map picker in the bottom-left corner, like Google Maps' layer switcher.
export default function RegionSwitcher() {
  const [open, setOpen] = useState(false)
  const regionName = useMapStore((s) => s.region)
  const setRegion = useMapStore((s) => s.setRegion)
  const current = REGIONS.find((r) => r.name === regionName)!

  return (
    <div className="region-switcher">
      {open && (
        <div className="region-list">
          {REGIONS.map((region) => (
            <button
              key={region.name}
              className={`region-option${region.name === regionName ? ' region-option-on' : ''}`}
              onClick={() => {
                setRegion(region.name)
                setOpen(false)
              }}
            >
              <img src={thumbnail(region)} alt="" />
              <span>{label(region)}</span>
            </button>
          ))}
        </div>
      )}
      <button className="region-current" aria-expanded={open} onClick={() => setOpen(!open)}>
        <img src={thumbnail(current)} alt="" />
        <span>{label(current)}</span>
      </button>
    </div>
  )
}
