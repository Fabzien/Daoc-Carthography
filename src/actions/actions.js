export const UPDATE_TEXTINPUT = 'UPDATE_TEXTINPUT'
export const UPDATE_REGIONINPUT = 'UPDATE_REGIONINPUT'
export const SEARCH = 'SEARCH'
export const RECEIVE_MOBS_RESULTS = 'RECEIVE_MOBS_RESULTS'
export const CLEAN_MOBS_RESULTS = 'CLEAN_MOBS RESULTS'

export const updateTextInput = payload => ({
  type: UPDATE_TEXTINPUT,
  payload
})

export const updateRegionInput = payload => ({
  type: UPDATE_REGIONINPUT,
  payload
})

export const search = payload => dispatch => {
  let filter = {
    Name: payload.searchOptions.userInput,
    Region: payload.searchOptions.region
  }
 
  console.log(payload.searchOptions.userInput)
  console.log(payload.searchOptions.region) 
  let url = new URL(
    process.env.REACT_APP_API_ENDPOINT
  ),
    params = {
      filter: JSON.stringify(filter),
      range: '[0, 99]',
      sort: '["Name","DESC"]'
    }

  url.search = new URLSearchParams(params)

  return fetch(url)
    .then(response => response.json())
    .then(data =>
      dispatch(parseMobsResponse(data))
    )
    .catch(error => console.error(error))
}

export const parseMobsResponse = (json) => dispatch => {
  dispatch(receiveMobsResults(json))
}

export const receiveMobsResults = results => ({
  type: RECEIVE_MOBS_RESULTS,
  mobsResults: results
})

export const clearMobsResults = () => ({
  type: RECEIVE_MOBS_RESULTS,
  mobsResults: []
})