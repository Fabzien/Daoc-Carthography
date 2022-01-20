import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {
    Marker,
    Tooltip
} from "react-leaflet";
import { connect } from "react-redux"
import { Icon } from 'leaflet'
import server from '../../data/server.json'

const imageEntrance = new Icon({
    iconUrl: './images/entrance.png',
    // shadowUrl: './images/entrance.png',
    iconSize: [15, 15], // size of the icon
    // shadowSize: [50, 64], // size of the shadow
    // iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    // popupAnchor: [-3, -76]// point from which the popup should open relative to the iconAnchor
})

class EntrancesMarkers extends Component {
    static propTypes = {
        mapControls: PropTypes.object.isRequired,
    }


    render() {
        const region = this.props.mapControls.region
        console.log(server)
        console.log(region)
        let entrances
        switch (region) {
            default:
                entrances = []
                break
            case 'Albion-Classic':
                entrances = server.World['Albion-Classic'].Entrances
                break
            case 'Albion-SI':
                entrances = server.World['Albion-SI'].Entrances
                break
            case 'Hibernian-Classic':
                entrances = server.World['Hibernian-Classic'].Entrances
                break
            case 'Hibernian-SI':
                entrances = server.Wolrd['Hibernian-SI'].Entrances
                break
            case 'Midgard-Classic':
                entrances = server.Wolrd['Midgard-Classic'].Entrances
                break
            case 'Midgard-SI':
                entrances = server.Wolrd['Midgard-SI'].Entrances
                break
        }
        console.log(entrances)
        return (
            entrances.map(entrance =>
                <Marker key={entrance.name} position={entrance.loc} icon={imageEntrance}>
                    <Tooltip>
                        {entrance.name}
                    </Tooltip>
                </Marker>)
        )
    }
}

const mapStateToProps = (state) => {
    const mapControls = state.mapControls
    return {
        mapControls
    }
}

export default connect(mapStateToProps)(EntrancesMarkers)