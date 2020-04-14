/**
 * Utilities
 * @module assets/utilities
 * @author Tim Rohrer (@tim_rohrer)
 * 
 * @desc These utility functions are generic and provide miscellaneous support.
 * 
 */

/**
 * Converts degrees to radians
 *
 * @param {number} deg
 * @returns {number} 
 */
const deg2rad = (deg) => {
  return deg * (Math.PI/180)
}

export /**
 * Converts kilometers to miles
 *
 * @param {number} km
 * @returns {number}
 */
const km2miles = (km) => {
  return km *  0.62137
}

export /**
 * Calculates the distance between two lat/lng points using the method 
 * described at https://stackoverflow.com/a/21623206
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance (kilometers) between two lat/lng points
 */
const distanceBetweenLatLngPoints = (lat1, lon1, lat2, lon2) => {
  let p = 0.017453292519943295;    // Math.PI / 180
  let c = Math.cos;
  let a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

export /**
 * Calculates the distance between two lat/lng points using the Haversine method
 *
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} Distance (kilometers) between two lat/lng points
 */
const calculateDistanceBetweenLatLngInKm = (lat1,lon1,lat2,lon2) => {
  const R = 6371; // Radius of the earth in km
  let dLat = deg2rad(lat2-lat1); 
  let dLon = deg2rad(lon2-lon1); 
  let a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  let d = R * c; // Distance in km
  return d;
}

