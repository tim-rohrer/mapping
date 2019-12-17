export const PlacesService = () => {
    if (window.google) {
        console.log("Exists!")
    } else {
        console.log("Doesn't Exist!");
    }
    // console.log(JSON.stringify(new window.google.maps.places.PlacesService(document.createElement('div'))));
    // console.log(new window.google.maps.places.PlacesService(document.createElement('div')));
    return new window.google.maps.places.PlacesService(document.createElement('div'));
};