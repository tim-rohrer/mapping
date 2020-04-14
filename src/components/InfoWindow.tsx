import React from 'react';

/**
 * Provides component for trip information
 *
 * @component
 * @param {Trip} tripInfo - This is not going to be the final
 */
const InfoWindow = (tripInfo) => {

    const {startingPlaceId, endingPlaceId, routeDistance} = tripInfo

    return (
        <div className="InfoWindow">
            <div className="trip-info-item">
                <span>
                    Starting PlaceId: 
                </span>
                <span>
                    {startingPlaceId}
                </span>
            </div>
            <div>
                <span>
                    "Ending PlaceId: "
                </span>
                <span>
                    {endingPlaceId}
                </span>
            </div>
            <div>
                <span>
                    Route Distance: 
                </span>
                <span>
                    { routeDistance !== undefined
                    ? routeDistance.text
                    : null}
                </span>
            </div>
        </div>
    )
}

export default InfoWindow;