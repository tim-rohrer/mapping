/**
 * @desc An object used to characterize the minimum trip information necessary for
 * gathering and calculating WandersTrip
 * @typedef {Object} TripParameters
 * @property {String<TripId>} tripId - The UUID for the trip.
 * @property {String<WandersPlace>} startingWandersPlace - Starting place for trip.
 * @property {String<WandersPlace>} endingWandersPlace - Ending place of trip.
 * @property {Number} noStopsDesired - User entered number of stops desired along route.
 * @see WandersPlace
 * @see WandersTrip
 * @todo Expand to include specified interim stops.
 * @todo Expand to include number of miles driven per day.
 */