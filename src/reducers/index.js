import { combineReducers } from 'redux'
import {
  UPDATE_TEXTINPUT,
  UPDATE_REGIONINPUT,
  SEARCH,
  RECEIVE_MOBS_RESULTS
} from '../actions/actions'


export const initialMapControlsState = {
  userInput: "",
  region: 'Albion-Classic',
  mobsResults: []
}


// our reducer constant returning an unchanged or updated state object depending on the users action, many cases will follow
const mapControls = (state = initialMapControlsState, action) => {
  switch (action.type) {
    default:
      return state
    case UPDATE_TEXTINPUT:
      return {
        ...state,
        userInput: action.payload.inputValue
      }
    case UPDATE_REGIONINPUT:
      return {
        ...state,
        region: action.payload.regionValue
      }
    case SEARCH:
      return {
        ...state,
      }
    case RECEIVE_MOBS_RESULTS:
      return {
        ...state,
        mobsResults: action.mobsResults
      }
  }

}

// creates a root reducer and combines different reducers if needed
const rootReducer = combineReducers({
  mapControls
})

export default rootReducer