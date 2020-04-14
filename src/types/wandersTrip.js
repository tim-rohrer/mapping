/**
 * @desc Working object for a user's trip inside of Wanders. This is not designed for long-term storage.
 * @typedef {Object} WandersTrip
 * @property {String<TripId>} tripId - A UUID for the trip.
 * @property {String<WandersPlace>} startingWandersPlace - Our generated unique place identifier
 * @property {String<WandersPlace>} endingWandersPlace - Our generated unique place identifier for the trip's ending location.
 * @property {Array} routes - latlng literals of the calculated routes
 */ 