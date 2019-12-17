import { PlacesService } from './placesService';

// const googleMapsClient = require('@google/maps').createClient({
//     key: 'AIzaSyBRwt64TVZDetx93vr_No2w1BTE1GqVu8I'
// });

// export const myPlacesService = () => {
//     return googleMapsClient.place();

//     // const mapDiv = document.createElement('div');
//     // console.log(window.google);
//     // let pS = new window.google.maps(mapDiv);
//     // console.log(JSON.stringify(new window.google.maps.places.PlacesService(document.createElement('div'))));
//     // return new window.google.maps.places.PlacesService(document.createElement('div'));
// }

/**
 * 
 * This function is called when we have a placeId for which we need to acquire
 * the details for that place from Google.
 * 
 * It returns the complete set of details if the status is 'OK', or the status value
 * itself if not 'OK'
 */

export const fetchGoogleDetailsForPlaceId = (placeId) => {

    // let placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
    let placesService = PlacesService();
    console.log("What is this: ",placesService);

    return new Promise( (resolve, reject) => {
        console.log("Ok, let's run the api call", placesService.getDetails);
        console.log("Place ID: ", placeId);
        placesService.getDetails({ placeId: placeId }, (placeDetails, status) => {
            console.log("We have status", status);
            if (status === 'OK') {
                console.log("Our status: ", status);
                console.log('Details: ', placeDetails);
                resolve(placeDetails);
            } else { 
                console.log('Status--', status);
                reject(status)
            }
        });
        reject("Never got it!");
    });
}

// export const fetchGoogleDetailsForPlaceId = (placeId, resolve, reject) => {
//     let placesService = myPlacesService();
//     placesService.getDetails({ placeId: placeId }, function (placeDetails, status) {
//         if (status === 'OK') {
//             let googlePlaceDetails = {
//                 key: placeId,
//                 object: {
//                     placeId: placeId,
//                     name: placeDetails.name,
//                     address: placeDetails.formatted_address,
//                     phone: "",
//                     website: "",
//                     email: null,
//                     types: placeDetails.types,
//                     photos: placeDetails.photos,
//                     photo: "",
//                     geometry: placeDetails.geometry,
//                     position: "",
//                     reviews: placeDetails.reviews
//                 }
//             }

//             if (placeDetails.formatted_phone_number) {
//                 googlePlaceDetails.object.phone = placeDetails.formatted_phone_number
//             };
            
//             if (placeDetails.email) {
//                 googlePlaceDetails.object.email = placeDetails.email
//             }
            
//             if (placeDetails.website) {
//                 googlePlaceDetails.object.website = placeDetails.website
//             }

//             if (placeDetails.geometry.location.lat) {
//                 googlePlaceDetails.object.position = {
//                     lat: placeDetails.geometry.location.lat(), 
//                     lng: placeDetails.geometry.location.lng()
//                 };
//             };

//             // [TGR_2/5/2019]: TODO: Make this random photo vice first
//             let photoUrl = '';
//             if (typeof placeDetails.photos !== 'undefined') {
//                 photoUrl = placeDetails.photos[0].getUrl({ maxWidth: 200, maxHeight: 200 });
//             };
//             googlePlaceDetails.object.photo = photoUrl;
//             resolve(googlePlaceDetails);
//         } else {
//             // debugger;
//             // alert('No Details Available for the PlaceId');
//             // reject(status);
//         };
//     }) // end getDetails */
// }