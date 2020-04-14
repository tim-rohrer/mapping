import { distanceBetweenLatLngPoints } from './utilities'
/**
 * Stop Solver (Core)
 * @module assets/stopSolverCore
 * @author Tim Rohrer (@tim_rohrer)
 * 
 * @desc Core business logic of Stop Solver-related data. Stop Solver is a feature that divides up 
 * a user's trip based on parameters related to desired distance or time to travel each day. The goal 
 * is to keep these functions independent of the mapping service used.
 * 
 */

export /**
* Sums the distance over an array of lat/lng literal objects
*
* @param {Array} latlngSet
* @returns {number} The total distance in kilometers
* @todo Refactor to split Wanders logic from generic logic
*/
const calculateDistanceOfArrayOfLatLngs = (latlngSet) => {

   const routePositionObject = (distanceKey, cumulativeDistance, latlngLiteral) => {
     return {
       distanceKilometersKey: distanceKey,
       cumulativeDistanceAlongRoute: cumulativeDistance,
       posit: latlngLiteral
     }
   }

   let prevLat = latlngSet[0].lat
   let prevLng = latlngSet[0].lng
   let distanceKey = 0
   let cumulativeDistance = 0
   let tripRoute = {}
   tripRoute['startingPt'] = routePositionObject('startingPt', cumulativeDistance, latlngSet[0])
   latlngSet.forEach((latlng, latlngIndx) => {
       let currentLat = latlng.lat
       let currentLng = latlng.lng
       cumulativeDistance += distanceBetweenLatLngPoints(prevLat, prevLng, currentLat, currentLng)
       if (cumulativeDistance - distanceKey > 1) {
         distanceKey += 1
         tripRoute[distanceKey] = routePositionObject(distanceKey, cumulativeDistance, latlngSet[latlngIndx])
       }
       prevLat = currentLat
       prevLng = currentLng
   })
   tripRoute['endingPt'] = routePositionObject('endingPt', cumulativeDistance, {lat: prevLat, lng: prevLng})
 return tripRoute
} 