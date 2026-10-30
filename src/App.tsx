import MapView from './map/MapView'
import RegionSwitcher from './ui/RegionSwitcher'
import SearchPanel from './ui/SearchPanel'

export default function App() {
  return (
    <>
      <MapView />
      <SearchPanel />
      <RegionSwitcher />
      <footer className="footer">
        <a href="https://github.com/Fabzien/Daoc-Carthography" target="_blank" rel="noreferrer">
          <img src="/assets/GitHub-Mark-Light-32px.png" alt="GitHub repository" />
        </a>
      </footer>
    </>
  )
}
