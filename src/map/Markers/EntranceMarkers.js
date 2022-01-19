import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {
    Marker,
    Tooltip
} from "react-leaflet";
import { connect } from "react-redux"
import { Icon } from 'leaflet'

const imageEntrance = new Icon({
    iconUrl: './images/entrance.png',
    // shadowUrl: './images/entrance.png',
    iconSize: [15, 15], // size of the icon
    // shadowSize: [50, 64], // size of the shadow
    // iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
    // popupAnchor: [-3, -76]// point from which the popup should open relative to the iconAnchor
})

export const entrancesAlbClassic =
    [
        {
            name: 'Darkness Falls (15-50+)',
            loc: [-81.53095424205651, 152.42746077048042]
        },
        {
            name: 'Camelot East',
            loc: [-69.78416710136426, 129.20476556835075]
        },
        {
            name: 'Camelot North',
            loc: [-62.85903479900238, 112.08476891234814]
        },
        {
            name: 'Stonehenge Barrows (30-50)',
            loc: [-105.4908885465558, 145.6326484016529]
        },
        {
            name: 'Keltoi Fogou (15-30)',
            loc: [-130.15015241800884, 125.2182896217063]
        },
        {
            name: 'Catacombs of Cardova (25-35)',
            loc: [-152.50568172198473, 47.12195088065232]
        },
        {
            name: 'Tepok\'s Mine (17-38)',
            loc: [-32.98992627664469, 98.05136608683695]
        },
        {
            name: 'Tomb of Mithra (7-20)',
            loc: [-75.14233838303603, 154.2472402461189]
        },
    ]

export const entrancesAlbSI =
    [
        {
            name: 'Avalon City (35-50)',
            loc: [-57.43847121205962, 110.12248390501384]
        },
        {
            name: 'Krondon (50+)',
            loc: [-60.04382026026673, 68.539526401925]
        },
        {
            name: 'Krondon (50+)',
            loc: [-60.48115041294821, 76.81699986865982]
        },
        {
            name: 'Caer Sidi (50+)',
            loc: [-4.777699541130136, 43.05452782401284]
        },
    ]

export const entrancesHibernianClassic =
    [
        {
            name: 'Koalinth Caverns (20-30)',
            loc: [-26.269499771991878, 14.642175717849096]
        },
        {
            name: 'Darkness Falls (15-50+)',
            loc: [-7.865422301082497, 50.866403691209115]
        },
        {
            name: 'Muire Tomb (10-28)',
            loc: [-19.646147355861757, 49.68850693879458]
        },
        {
            name: 'Tir Na Nog North',
            loc: [-25.920927895405875, 44.024122942031596]
        },
        {
            name: 'Tir Na Nog East',
            loc: [-34.022955948162824, 55.45286026920286]
        },
        {
            name: 'Coruscating Mine (30-45)',
            loc: [-34.60067990054125, 86.19399783889165]
        },
        {
            name: 'Spraggon Den (20-25)',
            loc: [-73.63866057718974, 50.93095971260273]
        },
        {
            name: 'Treibh Caillte (25-45)',
            loc: [-140.7461541714306, 36.65464675474591]
        },
    ]

export const entrancesHibernianSI =
    [
        {
            name: 'Fomor (50+)',
            loc: [-96.49576828874817, 45.21369611509543]
        },
        {
            name: 'Tur Suil (50+)',
            loc: [-110.4467384809325, 12.158802769544572]
        },
        {
            name: 'Galladoria (50+)',
            loc: [-38.76052468434862, 66.07074878663525]
        },
    ]

export const entrancesMidgardClassic =
    [
        {
            name: 'Vendo Caverns (18-30)',
            loc: [-19.778989254186126, 98.06862870182277]
        },
        {
            name: 'Darkness Falls (15-50+)',
            loc: [-30.44175468611151, 89.34264632347916]
        },
        {
            name: 'Nisse\'s Lair (7-26)',
            loc: [-74.73631143269186, 87.2211198104752]
        },
        {
            name: 'Cursed Tomb (15-22)',
            loc: [-106.89646605791, 99.27229028895152]
        },
        {
            name: 'Spindelhalla (30-45)',
            loc: [-120.05885434862742, 87.96589978621496]
        },
        {
            name: 'Varulvhamn (30-40)',
            loc: [-148.35637234204754, 64.32413470070094]
        },
    ]

export const entrancesMidgardSI =
    [
        {
            name: 'Tuscaren Glacier (50+)',
            loc: [-25.557752680816943, 149.76726191892536]
        },
        {
            name: 'Trollheim (?)',
            loc: [-32.75957020298573, 56.717753643979876]
        },
        {
            name: 'Iarnvidiur\'s Lair (45-50+)',
            loc: [-185.0167947799986, 171.14453644180026]
        },
    ]

class EntrancesMarkers extends Component {
    static propTypes = {
        mapControls: PropTypes.object.isRequired,
    }

    render() {
        const region = this.props.mapControls.region
        console.log(region)
        let entrances
        switch (region) {
            default:
                entrances = []
                break
            case 'Albion-Classic':
                entrances = entrancesAlbClassic
                break
            case 'Albion-SI':
                entrances = entrancesAlbSI
                break
            case 'Hibernian-Classic':
                entrances = entrancesHibernianClassic
                break
            case 'Hibernian-SI':
                entrances = entrancesHibernianSI
                break
            case 'Midgard-Classic':
                entrances = entrancesMidgardClassic
                break
            case 'Midgard-SI':
                entrances = entrancesMidgardSI
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
        // return null
    }
}

const mapStateToProps = (state) => {
    const mapControls = state.mapControls
    return {
        mapControls
    }
}

export default connect(mapStateToProps)(EntrancesMarkers)