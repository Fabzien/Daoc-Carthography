import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/styles';
import FormControl from '@material-ui/core/FormControl'
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { connect } from "react-redux"
import { flowRight as compose } from 'lodash';
import PropTypes from "prop-types"

import {
    updateTextInput,
    updateRegionInput,
    search
} from "../../actions/actions";

const styles = theme => ({
    root: {
        margin: `10px auto`,
        padding: 10 * 2,
        maxWidth: 400,
        //backgroundColor: "red"
    },
});

const POSITION_CLASSES = {
    bottomleft: 'leaflet-bottom leaflet-left',
    bottomright: 'leaflet-bottom leaflet-right',
    topleft: 'leaflet-top leaflet-left',
    topright: 'leaflet-top leaflet-right',
}

class Control extends Component {
    static propTypes = {
        userTextInput: PropTypes.string.isRequired,
    }

    state = {
        position: {},
        positionClass: {},
        message: ""
    };

    componentDidMount() {
        const position = this.props.position;
        const positionClass =
            (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright

        this.setState({
            positionClass
        })
    }

    search = () => {
        const { dispatch, userTextInput, region } = this.props
        const searchOptions = {
            userInput: userTextInput,
            region: region

        }
        
        dispatch(
            search({
                searchOptions
            })
        );
    }

    handleChange = (event) => {
        const { dispatch } = this.props
        dispatch(
            updateTextInput({
                inputValue: event.target.value
            })
        );
    }

    handleChangeRegion = (event) => {
        const { dispatch } = this.props
        dispatch(
            updateRegionInput({
                regionValue: event.target.value
            })
        );
    }

    render() {
        const {
            positionClass
        } = this.state

        const { 
            classes,
            userTextInput,
        } = this.props
        return (
            <div className={positionClass}>
                <div>
                    <div className="leaflet-control leaflet-bar">
                        {/* <Paper className={classes.root}>
                            <FormControl autoComplete="off">
                                <InputLabel>Region</InputLabel>
                                <Select
                                    native
                                    value={region}
                                    onChange={this.handleChangeRegion}
                                    defaultValue="albion"
                                    inputProps={{
                                        name: 'region',
                                        id: 'region',
                                    }}
                                >
                                    <option value="albion">Albion</option>
                                    <option value="hibernian">Hibernian</option>
                                </Select>
                            </FormControl>
                        </Paper> */}
                        <Paper className={classes.root}>
                            <FormControl autoComplete="off">
                                <List>
                                    <ListItem >
                                        <TextField required id="standard-required"  defaultValue={userTextInput} label="Name" onChange={this.handleChange} />
                                    </ListItem>
                                    {/* <ListItem >
                                        <InputLabel>Type</InputLabel>
                                        <Select
                                            native
                                            // value={state.age}
                                            //   onChange={handleChange}
                                            inputProps={{
                                                name: 'age',
                                                id: 'age-native-simple',
                                            }}
                                        >
                                            <option aria-label="None" value="" />
                                            <option value={10}>Ten</option>
                                            <option value={20}>Twenty</option>
                                            <option value={30}>Thirty</option>
                                        </Select>
                                    </ListItem> */}
                                    <ListItem >
                                        <Button variant="contained" onClick={this.search}>
                                            Filter
</Button>
                                    </ListItem>
                                </List>
                            </FormControl >
                        </Paper>
                    </div>
                </div>
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

const enhance = compose(
    withStyles(styles),
    connect(mapStateToProps)
);
//export default connect(mapStateToProps)(Control)
//export default withStyles(styles)(Control);
export default enhance(Control)