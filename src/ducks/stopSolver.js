/**
 * Stop Solver
 * @module ducks/stopSolver
 * @author Tim Rohrer (@tim_rohrer)
 * 
 * @desc stopSolver contains Redux actions, reducers and values specific to the positions provided 
 * by stop solving interactions. 
 * 
 */

// Stop Solver Actions

export const STOP_SOLVER_RESULTS_ADDED = 'mapping/stopSolver/resultsAreAdded'

// Initial State
const initialState = {
    stopSolverResults: {}
}

// Action Creators

// const stopSolverResultsAreAdded = () => {
//     return { type: STOP_SOLVER_RESULTS_ADDED }
// } 


// Thunks

export /**
 * Obtains results within the designated search radius, and stores the results in the store
 *
 * @param {*} position - a LatLng Literal is desried, but the event-provided position 
 * probably contains lat/lng functions
 */
const assembleStopSolverSearchResults = searchPosition => dispatch => {
    console.log("Position passed: ", searchPosition)
}

// Reducer
const reducer = (state = initialState, action) => {

    switch (action.type) {
        // case STOP_SOLVER_RESULTS_ADDED:
        //     return state
        //     // return {
        //     //     ...state,
        //     //     stopSolverResults: {
        //     //         ...state.stopSolverResults,
        //     //         test: action.results
        //     //     }
            // }
        default:
            return state
    }
}

export default reducer