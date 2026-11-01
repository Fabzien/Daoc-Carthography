import MapView from './map/MapView'
import AppFooter from './ui/AppFooter'
import RegionSwitcher from './ui/RegionSwitcher'
import SearchPanel from './ui/SearchPanel'

export default function App() {
  return (
    <>
      <MapView />
      <SearchPanel />
      <RegionSwitcher />
      <AppFooter />
    </>
  )
}
