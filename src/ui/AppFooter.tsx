import { Suspense } from 'react'
import { useRegionData } from '../data/regionData'

const DISCLAIMER =
  'Positions of mobs, NPCs, entrances, routes and bind points come from the Dawn of Light emulator public ' +
  'database and from an approximate calibration of each map. They may be wrong, or differ from the live game.'

// Release of the DOL database the current map's data was generated from.
function DataSource() {
  const { source } = useRegionData()
  const release = /release (\S+)/.exec(source)?.[1]
  return release ? <span title={source}>data: DOL db-public {release}</span> : null
}

// Bottom-center bar: repository link, app version, data source and disclaimer.
export default function AppFooter() {
  return (
    <footer className="footer">
      <a href="https://github.com/Fabzien/Daoc-Carthography" target="_blank" rel="noreferrer">
        <img src="/assets/GitHub-Mark-Light-32px.png" alt="GitHub repository" />
      </a>
      <span title={`Commit ${__APP_COMMIT__}`}>
        v{__APP_VERSION__} · {__APP_COMMIT__}
      </span>
      <Suspense fallback={null}>
        <DataSource />
      </Suspense>
      <span className="disclaimer" title={DISCLAIMER}>
        ⚠ Positions may be inaccurate
      </span>
    </footer>
  )
}
