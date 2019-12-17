export const getMyLocation = () => {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                if (position) {
                    let pos = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude
                    };
                    console.log('Position: ', pos);
                    resolve(pos)
                } else {
                    alert ("Geolocation not supported. Default positition will be used.");
                    resolve( { lat: 30.0097,
                        lng: -99.1250 } )
                };
            });
    } else {
        alert("Here!")
        debugger;
    }})

}