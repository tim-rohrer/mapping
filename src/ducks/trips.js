/**
 * Trips
 * @module ducks/trips
 * @author Tim Rohrer (@tim_rohrer)
 * 
 * @desc Trips contains Redux actions, reducers and values for all of the user's trips. 
 * @todo Separate dependence on any one mapping service.  
 * 
 */

// Trip Actions

export const WANDERS_TRIP_IS_ADDED = 'mapping/trips/wandersTripIsAdded'

// Initial State
const initialState = {
    trips: [],
    tripsLoaded: false
}

// Action Creators
export const wandersTripAdded = (wandersTrip) => {
    return { type: WANDERS_TRIP_IS_ADDED, wandersTrip }
}

// Thunks


// Reducer
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case WANDERS_TRIP_IS_ADDED:
            return {
                ...state,
                trips: {
                    ...state.trips,
                    [action.wandersTrip.tripId]: action.wandersTrip
                }
            }
        default:
            return state
    }
}

export default reducer