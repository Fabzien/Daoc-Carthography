import React, {
    Component,
    useState,
} from 'react';
import {
    MapContainer,
    TileLayer,
    useMapEvents,
    LayersControl,
} from "react-leaflet";
import { CRS } from 'leaflet';
import Control from './Controls/Control'
import MobsMarkers from './Markers/MobsMarkers'
import { connect } from "react-redux"
import {
    updateRegionInput
} from "../actions/actions";
import store from '../index'


/// DEV ONLY
import {
    Marker,
    Popup
} from "react-leaflet";
import ZonesMarkers from './Markers/ZonesMarkers';
import EntrancesMarkers from './Markers/EntranceMarkers';
import HorsesLines from './Markers/HorsesLines';

function AddMarkerToClick() {
    const [markers, setMarkers] = useState([]);
    useMapEvents({
        click(e) {
            const newMarker = e.latlng
            setMarkers([...markers, newMarker]);
        },
    })

    return (
        <>
            {markers.map(marker =>
                <Marker position={marker}>
                    <Popup>Marker is at lat: {marker.lat}  lng: {marker.lng}</Popup>
                </Marker>
            )}
        </>
    )
}

// Work but seems like a hack, TODO USE useDispath, MapToDispath ?, useStore? use context?
function CleanMarkers() {
    useMapEvents({
        baselayerchange(e) {
            console.log(e.name)
            store.dispatch({ type: 'RECEIVE_MOBS_RESULTS', mobsResults: [] });
            store.dispatch(
                updateRegionInput({
                    regionValue: e.name
                })
            );
        },
    })
    return null
}

class Map extends Component {
    render() {
        const REACT_APP_MAP_ALBION_CLASSIC = "/maps/albion/classic/tiles/{z}/{x}/{y}.png"
        const REACT_APP_MAP_ALBION_SI = "/maps/albion/SI/tiles/{z}/{x}/{y}.png"
        const REACT_APP_MAP_HIBERNIAN_CLASSIC ="/maps/hibernian/classic/tiles/{z}/{x}/{y}.png"
        const REACT_APP_MAP_HIBERNIAN_SI = "/maps/hibernian/SI/tiles/{z}/{x}/{y}.png"
        const REACT_APP_MAP_MIDGARD_CLASSIC = "/maps/midgard/classic/tiles/{z}/{x}/{y}.png"
        const REACT_APP_MAP_MIDGARD_SI = "/maps/midgard/SI/tiles/{z}/{x}/{y}.png"
        const REACT_APP_MAP_FRONTIERS = "/maps/frontiers/tiles/{z}/{x}/{y}.png"
        return (
            <div>
                <MapContainer
                    center={[-83, 80.5]}
                    zoom={2}
                    minZoom={1}
                    maxZoom={7}
                    onClick={this.handleClick}
                    doubleClickZoom={false}
                    crs={CRS.Simple}                   
                >
                    <LayersControl position="bottomright">
                        <LayersControl.BaseLayer checked name="Albion-Classic">
                            <TileLayer
                                url={REACT_APP_MAP_ALBION_CLASSIC}

                            >
                            </TileLayer>

                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Albion-SI">
                            <TileLayer
                                url={REACT_APP_MAP_ALBION_SI}

                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Hibernian-Classic">
                            <TileLayer
                                url={REACT_APP_MAP_HIBERNIAN_CLASSIC}
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Hibernian-SI">
                            <TileLayer
                                url={REACT_APP_MAP_HIBERNIAN_SI}
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Midgard-Classic">
                            <TileLayer
                                url={REACT_APP_MAP_MIDGARD_CLASSIC}
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Midgard-SI">
                            <TileLayer
                                url={REACT_APP_MAP_MIDGARD_SI}
                            />
                        </LayersControl.BaseLayer>
                        <LayersControl.BaseLayer name="Frontiers">
                            <TileLayer
                                url={REACT_APP_MAP_FRONTIERS}
                            />
                        </LayersControl.BaseLayer>
                    </LayersControl>
                    <Control position="topright" />
                    <MobsMarkers />
                    <ZonesMarkers />
                    <EntrancesMarkers />
                    <HorsesLines />
                    {/* DEV ONLY */}
                    {process.env.NODE_ENV === 'development' &&
                        <AddMarkerToClick />
                    }
                    <CleanMarkers />
                </MapContainer>
            </div>
        );
    }

}

const mapStateToProps = state => {
    const userTextInput = state.mapControls.userInput
    const region = state.mapControls.region
    return {
        userTextInput,
        region
    }
}

export default connect(mapStateToProps)(Map)
