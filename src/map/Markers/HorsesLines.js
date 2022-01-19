import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {
    Polyline,
    Marker,
    Popup,
} from "react-leaflet";
import { connect } from "react-redux"
import { Icon } from 'leaflet'

const imageHorse = new Icon({
    iconUrl: './images/horse.png',
    iconSize: [15, 15],
})


export const LinesAlbClassic =
    [
        {
            Name: 'Flabom',
            Description: 'Snowdonia Station, Camelot North Gate, Llyn Barfog, Castle Sauvage',
            loc: [-2.566905999764159, 111.44312357019679],
            path: [
                [
                    [-2.566905999764159, 111.44312357019679],
                    [-19.3240971921607, 115.32503251804323],
                ],
                [
                    [-2.566905999764159, 111.44312357019679],
                    [-12.089099259775487, 94.12684051698163],
                ],
                [
                    // Castle Sauvage
                    [-2.566905999764159, 111.44312357019679],
                    [-58.287770447184094, 145.1258826210676],
                ],
                [
                    // Camelot North Gate
                    [-2.566905999764159, 111.44312357019679],
                    [-62.56901741419627, 112.0635821176103],
                ]
            ]
        },
        {
            Name: 'Kelin',
            Description: 'Snowdonia Fortress',
            loc: [-12.089099259775487, 94.12684051698163],
            path: [
                [
                    [-12.089099259775487, 94.12684051698163],
                    [-2.566905999764159, 111.44312357019679],
                ],
            ]
        },
        {
            Name: 'Trachon',
            Description: 'Llyn Barfog, Camelot East Gate',
            loc: [-19.3240971921607, 115.32503251804323],
            path: [
                [
                    [-19.3240971921607, 115.32503251804323],
                    [-12.089099259775487, 94.12684051698163],
                ],
                [
                    [-19.3240971921607, 115.32503251804323],
                    [-70.1711280229011, 129.704145232754033],
                ],
            ]
        },
        {
            Name: 'Vuloch',
            Description: 'Snowdonia Station, Castle Sauvage, Caer Ulfwych, Campocorentin Station',
            loc: [-70.1711280229011, 129.704145232754033],
            path: [
                [
                    // Snowdonia Station
                    [-70.1711280229011, 129.704145232754033],
                    [-19.3240971921607, 115.32503251804323],
                ],
                [
                    // Castle Sauvage
                    [-70.1711280229011, 129.704145232754033],
                    [-58.287770447184094, 145.1258826210676],
                ],
                [
                    // Caer Ulfwych
                    [-70.1711280229011, 129.704145232754033],
                    [-137.94991709694852, 72.79590015941181],
                ],
                [
                    // Campocorentin Station
                    [-70.1711280229011, 129.704145232754033],
                    [-109.0289259597218, 100.22207514496104],
                ],
            ]
        },
        {
            Name: 'Ridder',
            Description: 'Avalon Marsh, East Camelot Gates, Gronyr\'s Farm',
            loc: [-109.0289259597218, 100.22207514496104],
            path: [
                [
                    // Snowdonia Station
                    [-109.0289259597218, 100.22207514496104],
                    [-19.3240971921607, 115.32503251804323],
                ],
                [
                    // Castle Sauvage
                    [-109.0289259597218, 100.22207514496104],
                    [-58.287770447184094, 145.1258826210676],
                ],
                [
                    // Gates, Gronyr\'s Farm
                    [-109.0289259597218, 100.22207514496104],
                    [-71.3951891917834, 142.5085087521658],
                ],
            ]
        },
        {
            Name: 'Fluvon',
            Description: 'West Downs, Nobs Stable, Cotswold',
            loc: [-71.3951891917834, 142.5085087521658],
            path: [
                [
                    // West Downs
                    [-71.3951891917834, 142.5085087521658],
                    [-91.90388654423579, 142.32393705307888],
                ],
                [
                    // Cotswold
                    [-71.3951891917834, 142.5085087521658],
                    [-69.68724974327858, 132.7247419259448],
                ],
                [
                    // Nobs Stable
                    [-71.3951891917834, 142.5085087521658],
                    [-66.08467177428817, 139.0418578815534],
                ],
            ]
        },
        {
            Name: 'Haruld',
            Description: 'Camelot North Gate',
            loc: [-66.08467177428817, 139.0418578815534],
            path: [
                [
                    // Camelot North Gate
                    [-66.08467177428817, 139.0418578815534],
                    [-62.56901741419627, 112.0635821176103],
                ],
            ]
        },
        {
            Name: 'Uliam',
            Description: 'Ludlow, West Cornwall',
            loc: [-58.287770447184094, 145.1258826210676],
            path: [
                [
                    // Ludlow
                    [-66.08467177428817, 139.0418578815534],
                    [-53.13284694273766, 118.1987233534363],
                ],
                [
                    // West Corwall
                    [-66.08467177428817, 139.0418578815534],
                    [-151.85528063450639, 40.35249811705865],
                ],
            ]
        },
        {
            Name: 'Yaren',
            Description: 'Castle Sauvage',
            loc: [-53.13284694273766, 118.1987233534363],
            path: [
                [
                    // Castle Sauvage
                    [-53.13284694273766, 118.1987233534363],
                    [-58.287770447184094, 145.1258826210676],
                ],
            ]
        },
        {
            Name: 'Addard Yarley',
            Description: 'Avalon Marsh, East Camelot Gates, West Downs',
            loc: [-151.85528063450639, 40.35249811705865],
            path: [
                [
                    // East Camelot Gates
                    [-151.85528063450639, 40.35249811705865],
                    [-70.1711280229011, 129.704145232754033],
                ],
                [
                    // West Downs
                    [-151.85528063450639, 40.35249811705865],
                    [-91.90388654423579, 142.32393705307888],
                ],
                [
                    // Avalon Marsh
                    [-151.85528063450639, 40.35249811705865],
                    [-129.40586059419246, 87.10272394517882],
                ],
            ]
        },
    ]

const redOptions = {
    color: 'grey',
    opacity: 0.8
}

// const test = [
//     [-2.2736586045526366, 110.84262365685467],
//     [-3.476309157232462, 109.51212983378491],
// ]

// function ClosePopUp() {
//     useMapEvents({
//         on(e) {
//             console.log(e.name)
//             store.dispatch({ type: 'RECEIVE_MOBS_RESULTS', mobsResults: [] });
//             store.dispatch(
//                 updateRegionInput({
//                     regionValue: e.name
//                 })
//             );
//         },
//     })
//     return null
// }

class HorsesLines extends Component {
    static propTypes = {
        mapControls: PropTypes.object.isRequired,
    }

    state = {
        lines: []
    };


    // componentDidMount() {
    //     this.fetchData();
    // }


    // test() {
    //     console.log("test close")
    // }

    render() {
        const region = this.props.mapControls.region
        console.log(region)
        let lines
        switch (region) {
            default:
                lines = []
                break
            case 'Albion-Classic':
                lines = LinesAlbClassic
                break
            case 'Albion-SI':
                lines = []
                break
            case 'Hibernian-Classic':
                lines = []
                break
            case 'Hibernian-SI':
                lines = []
                break
            case 'Midgard-Classic':
                lines = []
                break
            case 'Midgard-SI':
                lines = []
                break
        }
        console.log(lines)
        return (
            lines.map(line =>
                <Marker key={line.Name} position={line.loc} icon={imageHorse}>
                    <Popup>
                        <p>{line.Name}</p>
                        <p>{line.Description}</p>
                        <Polyline pathOptions={redOptions} positions={line.path} >
                        </Polyline >
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

export default connect(mapStateToProps)(HorsesLines)