import { fetchGoogleRoutes, extractAllRoutePointsFromGoogleRoutes, fetchGoogleDetailsForPlaceId, generateRouteAndStopSolverMarkerPoints } from '../assets/googleUtilities'
import { calculateDistanceOfArrayOfLatLngs } from '../assets/stopSolverCore'
import { googlePlaceAdded, placeDetailsAreLoadedStatus } from './placesGoogle'
import { wandersTripAdded } from './trips'

/**
 * Selected Trips
 * @module ducks/selectedTrip
 * @author Tim Rohrer (@tim_rohrer)
 * 
 * @desc selectedTrip contains Redux actions, reducers and values specific to user's active trip. 
 * @todo Separate dependence on any one mapping service.  
 * 
 */

// Selected Trip Actions

export const SELECTED_TRIP_IS_LOADED = 'mapping/selectedTrip/tripIsLoaded'
export const SELECTED_TRIP_IS_SHOWN = 'mapping/selectedTrip/tripIsShown'
export const SELECTED_TRIP_IS_HIDDEN = 'mapping/selectedTrip/tripIsHidden'
export const SELECTED_TRIP_IS_CLEARED = 'mapping/selectedTrip/tripIsCleared'
export const SELECTED_TRIP_PLACES_LOADED = 'mapping/selectedTrip/tripPlacesLoaded'

// Initial State
const initialState = {
    selectedTripIsLoaded: false, // This means all information is loaded or calculated, and the trip can be shown on the map
    selectedTripIsShown: false,
    selectedTripIsHidden: false, // Not sure this is needed
    selectedTripIsCleared: false,
    selectedTripPlacesLoaded: false
}

// Action Creators
const selectedTripPlacesLoaded = () => {
    return { type: SELECTED_TRIP_PLACES_LOADED }
}

const selectedTripIsLoaded = (wandersTrip) => {
    return { type: SELECTED_TRIP_IS_LOADED, wandersTrip }
} 

export const selectedTripIsShown = () => {
    return { type: SELECTED_TRIP_IS_SHOWN }
}

// Thunks

const loadSelectedTripPlaces = orderedStops => (dispatch, getState) => {
    let places = getState().placesGoogle.places
    let placesNeedingDetails = []
    orderedStops.forEach(stopId => {
        if (places[stopId] === undefined) {
            placesNeedingDetails.push(stopId)
        }
    })
    let requests = placesNeedingDetails.map((stopId) => {
        return new Promise((resolve, reject) => fetchGoogleDetailsForPlaceId(stopId, resolve, reject))
            .then (results => dispatch(googlePlaceAdded(results)))
            .catch (error => { console.log("Error: ", error) })
    })
    Promise.all(requests)
    .then(() => {
        dispatch(selectedTripPlacesLoaded())
        dispatch(placeDetailsAreLoadedStatus(true))
    })
    .catch((error) => { console.log("Error: ", error) })
}

const loadSelectedTripRoutes = orderedStops => dispatch => {

}

export /**
 * Generates trip data (places, routes, Stop Solver points) so the route 
 * and stop solver points can be mapped.
 *
 * @param {TripParameters} tripParameters - Basic, minimum, data to generate full trip information.
 * @returns {WandersTrip} wandersTrip
 * 
 */
const assembleSelectedTripData = ({ orderedStops, noStopsDesired}, gMaps) => (dispatch) => {

    const directionsService = new gMaps.DirectionsService() // Google

    dispatch(loadSelectedTripPlaces(orderedStops))

    /** @todo Needs to also handle waypoints or intermediate stops */
    fetchGoogleRoutes(directionsService, orderedStops[0], orderedStops[orderedStops.length-1])
    .then((result) => {
        // We want our routes based just on latlng literals
        let allRoutesCoordinatePoints = extractAllRoutePointsFromGoogleRoutes(result)
        /** @desc tripRoutesInfo is an array of objects describing distance and 
         * positions along each route. It is used to calculate specific Stop Solver
         * locations. 
         * Each object contains indexed objects containing the position, the calculated distance
         * along the route, and the index which refers to the kilometer along the route.
         * This is part of Stop Solver
         */
        let tripRoutesInfo = []
        allRoutesCoordinatePoints.forEach((route, indx) => {
            tripRoutesInfo.push(calculateDistanceOfArrayOfLatLngs(route))
        })
        debugger
        /** @desc routeDistanceArray is an array of distances (text & numeric values)
         * for each route.
         */
        let routeDistanceArray = []
        result.routes.forEach( route => {
            routeDistanceArray.push(route.legs[0].distance) // Tied to Google
        })

        /** @desc wandersTripRoutesMarkers requires the desired number of stops, each route's distances and the route */
        let wandersTripRoutesMarkers = generateRouteAndStopSolverMarkerPoints(noStopsDesired, routeDistanceArray, tripRoutesInfo)

        /** At this point, we should have the data we need to store the wandersTrip */
        let wandersTrip = {
            tripId: "w.00001",
            orderedStops: orderedStops,
            googleRoutes: result,
            stopSolverRoutesInfo: tripRoutesInfo,
            stopSolverMarkersByRoute: wandersTripRoutesMarkers
        }
        dispatch(wandersTripAdded(wandersTrip))
        // dispatch(selectedTripIsLoaded(true))
    })
    .then(() => dispatch(selectedTripIsLoaded(true)))
}

// Reducer
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case SELECTED_TRIP_PLACES_LOADED:
            return {
                ...state,
                selectedTripPlacesLoaded: true
            }
        case SELECTED_TRIP_IS_LOADED:
            return {
                ...state,
                selectedTripIsLoaded: true
            }
        case SELECTED_TRIP_IS_SHOWN:
            return {
                ...state,
                selectedTripIsShown: true
            }
        default:
            return state
    }
}

export default reducer