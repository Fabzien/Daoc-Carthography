import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {
    Marker,
    Popup
} from "react-leaflet";
import { connect } from "react-redux"

class MobsMarkers extends Component {
    static propTypes = {
        mapControls: PropTypes.object.isRequired,
        dispatch: PropTypes.func.isRequired
    }

    render() {
        const mobsResults = this.props.mapControls.mobsResults
        console.log(mobsResults)
        return (
            mobsResults.map(mob =>
                <Marker key={mob._id} position={mob.loc.coordinates}>
                    <Popup>
                        <ul>
                            <li>Name: {mob.Name}</li>
                            <li>Type: {mob.attributes.type}</li>
                        </ul>
                    </Popup>
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

//export default MobsMarkers
export default connect(mapStateToProps)(MobsMarkers)
