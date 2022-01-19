import React, { Component } from 'react';
import PropTypes from 'prop-types'
import {
    Rectangle,
    Tooltip
} from "react-leaflet";
import { connect } from "react-redux"

export const zonesAlbClassic =
    [
        {
            name: 'Camelot',
            loc: [[-63.796875, 95.640625], [-95.7890625, 127.609375]]
        },
        {
            name: 'Lyoness',
            loc: [[-127.796875, 0.0078125], [-159.78125, 31.625]]
        },
        {
            name: 'Cornwall',
            loc: [[-127.796875, 31.640625], [-159.78125, 63.625]]
        },
        {
            name: 'Dartmoor',
            loc: [[-159.78125, 31.640625], [-191.78125, 63.625]]
        },
        {
            name: 'Avalon Marsh',
            loc: [[-119.7890625, 63.6484375], [-151.765625, 95.6328125]]
        },
        {
            name: 'Campacorentin Forrest',
            loc: [[-103.7890625, 95.640625], [-135.71875, 127.6015625]]
        },
        {
            name: 'Salisbury Plains',
            loc: [[-87.78125, 127.6328125], [-119.765625, 159.6171875]]
        },
        {
            name: 'Camelot Hills',
            loc: [[-55.7734375, 127.6328125], [-87.7421875, 159.6171875]]
        },
        {
            name: 'Black Mountain South',
            loc: [[-31.8125, 95.6328125], [-63.7421875, 127.6328125]]
        },
        {
            name: 'Black Mountain North',
            loc: [[-0.0390625, 95.6328125], [-31.765625, 127.6328125]]
        },
        {
            name: 'Llyn Barfog',
            loc: [[-0.0625, 63.65625], [-31.765625, 95.6171875]]
        },
    ]

export const zonesAlbSI =
    [
        {
            name: 'Inishail Island',
            loc: [[-33.4375, 0], [-65.3984375, 31.9921875]]
        },
        {
            name: 'Gwyddneau',
            loc: [[-33.4375, 32.0078125], [-65.4375, 64]]
        },
        {
            name: 'Caldey',
            loc: [[-1.453125, 39.9609375], [-33.390625, 71.9375]]
        },
        {
            name: 'Dales of Devwy',
            loc: [[-9.4296875, 71.9453125], [-41.40625, 103.9375]]
        },
        {
            name: 'Avalon Isle',
            loc: [[-41.390625, 95.8984375], [-73.390625, 127.90625]]
        },
        {
            name: 'Aldland',
            loc: [[-57.3671875, 64.0234375], [-89.3515625, 96.0078125]]
        },
        {
            name: 'Isle of Glass',
            loc: [[-65.40625, 127.9140625], [-97.4375, 159.921875]]
        },
    ]

export const zonesHibernianClassic =
    [
        {
            name: 'Cliffs of Moher',
            loc: [[-0.0390625, 0.03125], [-32.015625, 32.0078125]]
        },
        {
            name: 'Connacht',
            loc: [[-0.0390625, 32.0078125], [-32, 64]]
        },
        {
            name: 'Lough Derg',
            loc: [[-32.046875, 47.984375], [-64.015625, 79.984375]]
        },
        {
            name: 'Valley of Bri Leith',
            loc: [[-32.015625, 79.9765625], [-64, 111.96875]]
        },
        {
            name: 'Cursed Forest',
            loc: [[-32.015625, 111.9765625], [-64, 143.96875]]
        },
        {
            name: 'Silvermine Mountains',
            loc: [[-64.0390625, 47.9765625], [-95.992187, 79.984375]]
        },
        {
            name: 'Shannon Estuary',
            loc: [[-96.046875, 32.1328125], [-127.96875, 64.0703125]]
        },
        {
            name: 'Lough Gur',
            loc: [[-128.046875, 32.1328125], [-160.0078125, 64.0703125]]
        },
        {
            name: 'Sheeroe Hills',
            loc: [[-112, 64], [-143.9921875, 96.1015625]]
        },
        {
            name: 'Bog of Cullen',
            loc: [[-144.03125, 64], [-176.0078125, 96.1015625]]
        },
    ]

class ZonesMarkers extends Component {
    static propTypes = {
        mapControls: PropTypes.object.isRequired,
    }


    render() {
        const region = this.props.mapControls.region
        console.log(region)
        let rectangles
        switch (region) {
            default:
                rectangles = []
                break
            case 'Albion-Classic':
                rectangles = zonesAlbClassic
                break
            case 'Albion-SI':
                rectangles = zonesAlbSI
                break
            case 'Hibernian-Classic':
                rectangles = zonesHibernianClassic
                break
        }
        console.log(rectangles)
        return (
            rectangles.map(zone =>
                <Rectangle key={zone.name} bounds={zone.loc} opacity={0} pathOptions={{ color: 'rgba(0,0,0,0)' }}>
                    <Tooltip direction="bottom" opacity={0.5} sticky>
                        {zone.name}
                    </Tooltip>
                </Rectangle>)

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

export default connect(mapStateToProps)(ZonesMarkers)