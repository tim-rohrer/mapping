/*
 src/reducers/rootReducer.js
*/
import { combineReducers } from 'redux'
import appStatus from './appStatus'
import trips from './trips'
import selectedTrip from './selectedTrip'
import stopSolver from './stopSolver'
import placesGoogle from './placesGoogle'

export default combineReducers({
    appStatus,
    trips,
    selectedTrip,
    stopSolver,
    placesGoogle
})
