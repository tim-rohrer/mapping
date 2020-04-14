/**
 * Places Google
 * @module ducks/placesGoogle
 * @author Tim Rohrer (@tim_rohrer)
 * 
 * @desc placesGoogle contains Redux actions, reducers and values 
 * specific to the a place obtained from Google.
 * 
 */

 // Places Google Actions

 export const GOOGLE_PLACE_IS_ADDED = 'mapping/placesGoogle/placeIsAdded'
 export const PLACE_DETAILS_LOADED_STATUS_SET = 'mapping/placesGoogle/placesLoaded'

 // Initial State
 const initialState = { 
     places: [],
     placesLoaded: false
 }

 // Action Creators
 export const googlePlaceAdded = (placeDetails) => {
     return { type: GOOGLE_PLACE_IS_ADDED, placeDetails}
 }

 // Skipping this for now
 export const placeDetailsAreLoadedStatus = (status) => {
     return { type: PLACE_DETAILS_LOADED_STATUS_SET, status }
 }

 // Thunks

//  export const checkAndFetchPlaceDetails = (orderedStops, gMaps) => (dispatch, getState) => {
//     let places = getState().placesGoogle.places
//     const placesService = new gMaps.places.PlacesService(document.createElement('div'))
//     let requests = orderedStops.map( stopId => {
//         if (places[stopId] === undefined) {
//             return new Promise((resolve) => {
//                 fetchGoogleDetailsForPlaceId(stopId, placesService, resolve)
//             }).then (placeDetails => {
//                 dispatch(googlePlaceAdded(placeDetails))
//             })
//         } else debugger
//     })
//     Promise.all(requests).then(() => dispatch(placeDetailsAreLoadedStatus(true)))
// }

 // Reducer
 const reducer = (state = initialState, action) => {
     switch (action.type) {
        case GOOGLE_PLACE_IS_ADDED:
            return {
                ...state,
                places: {
                    ...state.places,
                    [action.placeDetails.place_id]: action.placeDetails
                }
            }
        case PLACE_DETAILS_LOADED_STATUS_SET:
            return {
                ...state,
                placesLoaded: action.status
            }
        default:
            return state
     }
 }

export default reducer