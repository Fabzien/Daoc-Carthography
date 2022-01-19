import { connect } from "react-redux"
import React, {
    Component,
    useState
} from 'react';
import {  useMapEvents } from "react-leaflet";

class Listener extends Component {
    componentDidUpdate(prevProps) {
        // const map = useMapEvents({
        //     baselayerchange(e) {
    
        //         console.log(e)
        //         // dispatch(
        //         //     CLEAN_MOBS_RESULTS({
        //         //         clearMobsResults
        //         //     })
        //         // );
        //     },
        // })
        console.log("ALLLLLLLLLOW")
      }

      render() {
          return null
      }
}

const mapStateToProps = state => {
    const region = state.mapControls.region
    return {
        region
    }
}

export default connect(mapStateToProps)(Listener)