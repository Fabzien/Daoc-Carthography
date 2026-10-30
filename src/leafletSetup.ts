import { Icon } from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Leaflet guesses the default marker image path from its CSS, which breaks
// once the CSS goes through a bundler. Point it at the bundled assets instead.
delete (Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})
