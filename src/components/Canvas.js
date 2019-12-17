import React from 'react';
import Map from './Map';

const Canvas = () => {

    return (
        <div>
            <div>
                {title}
            </div>
            <div
                id="google-map"
                ref={googleMapRef}
                style={{ width: '100%', height: '400px' }}
             />


            <Map id="MyMap" title="Tim's Map" mapOptions={{
                center: { lat: 39.833333, lng: -98.583333},
                zoom: 4,
                disableDefaultUI: true
                }} 
            />
        </div>
    )
}

export default Canvas;