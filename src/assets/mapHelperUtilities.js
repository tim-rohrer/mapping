import { getCustomGoogleMapMarker, getTripStopMarkerIconFromUrl } from './googleMarker';
import { convertActiveAPICampgroundLocationToGoogleLatLng, getMilesFromMeters, getMetersFromMiles, round } from './utilities';
import { stopSolverOrangeColor } from './wandersMuiTheme';

/* eslint-disable no-undef, no-loop-func, array-callback-return */

// ----------------------------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------------------------


/*  Summary:
    Constant list of our marker types. Used for distinguishing
    what type of map marker was acted, or need to be acted, upon.
*/
export const markerTypes = {
    tripStop: 'tripStop',
    stopSolver: 'stopSolver',
    searchResult: 'searchResult',
    tripStopPOI: 'tripStopPOI'
}

/*  [TGR_5/15/2019]: Going to try adding another const type to help us define
    what data service we're using. We're doing this because the code currently assumes
    that if the markerType is "stopSolver" that we're using the Active API. This is no longer
    the dase, and we need to start moving to multi-source. 
    This may be a temporary solution.
*/
export const DATASERVICE = {
    activeAPI: 'activeAPI',
    google: 'google'
}


// ----------------------------------------------------------------------------------------
// Functions
// ----------------------------------------------------------------------------------------


// --------------
// =C

/*  Summary:
    Given a list of current Trip Stops, and current Trip Stop markers, loop through the 
    markers, and compare the stop number shown on its label to the stop number from our
    list of current Trip Stops. If it needs to be udpated, then do so.
*/
export function checkForProperTripStopNumberOnTripStopMarkers(curTripStops, curTripStopMarkers, onNotFound) {

    // [JC_9/19/17]: added this so that we can check the 'not found' markers and make sure they aren't
    // caused by a Trip's Start/Ending locations changing. If so, then there is a possibility the marker
    // needs to be removed, but also re-added. And the reason this logic doesn't work is because the 
    // Trip Stops position has changed, so it can't be meshed with a map marker - since position is
    // usually how we check this.
    let markersNotFound = [];

    if (curTripStopMarkers) {
        curTripStopMarkers.forEach(function (tripStopMarker) {

            // Get the Trip Stop label from the Marker URL.
            let tripStopLabel = getCurrentTripStopMarkerLabel(tripStopMarker);
            console.log('Evaluate: %o', curTripStops);
            let tripStopNumber = getCorrectStopNumberGivenTripStopsAndATripStopMapMarker(curTripStops, tripStopMarker);
            if (tripStopNumber !== "na") {

                if (tripStopLabel) {

                    // Should be ...
                    var tripStopLabelShouldBe = tripStopNumber - 1;
                    if ((tripStopNumber - 1) === 0) {
                        tripStopLabelShouldBe = "start";
                    }
                    else if (tripStopNumber === curTripStops.length) {
                        tripStopLabelShouldBe = "stop";
                    }
                    else {
                        tripStopLabelShouldBe = tripStopNumber - 1;
                    }

                    if (tripStopLabel !== tripStopLabelShouldBe.toString()) {
                        let updatedIcon = getTripStopMarkerIconFromUrl(tripStopLabelShouldBe.toString());
                        tripStopMarker.setIcon(updatedIcon);
                    }

                }
                else {
                    // Error
                }
            }
            else {
                // Trip Stop not found (e.g. during a removal). 
                markersNotFound.push({ tripStopMarker, tripStopLabel });
            }

        });
    }

    if (markersNotFound.length) {
        // Handled by a method passed in from our 'Map.js'. Mainly because there is the
        // possibility we will have to update 'tripStopMapMarkers' objects in the Store.
        onNotFound(markersNotFound, curTripStops);
    }
}

/* Summary:
    Given a collection of 'stopSolverLocationMarkers' and a 'stopNumber', loop through
    the markers and find the one where the stopNumber equals that passed in. If the
    stopNumber passed in was 0, then we will be handling 'all' stopSolverLocationMarkers.
    Then, for each stopSolverLocationMarker, loop through its 'marker's and set the
    map for each to null.
*/
export function clearStopSolverLocationMarkers(stopSolverLocationMarkers, stopNumber) {
    stopSolverLocationMarkers.forEach(function (marker) {

        var _shouldClear = false;
        if (stopNumber === 0 || marker.stopNumber === stopNumber) {
            _shouldClear = true;
        }

        if (_shouldClear) {
            marker.markers.forEach(function (locationMarker) {
                locationMarker.setMap(null);
            });
        }

    });
}

/*  Summary:
    Given a set of results (i.e. positions), create map markers based on the type,
    Stop Solver Id (i.e. Stop Number) and assign the events passed in to the
    new markers.
    [TGR_5/7/2019]: It appears this is written to accept results as either tripStops or an array or potential POIs.
*/
export function createMapMarkersFromResults(results, map, markerType, stopSolverId, markerClickEvent, markerMouseOverEvent, markerMouseOutEvent) {
    var _markers = [];

    // Make sure icons are clickable, or else our HoverInfoWindows
    // won't show.
    map.setClickableIcons(true);

    // 1) Loop through all of the results and create our Map Marker, wire up the
    // necessary events, and push it into our '_markers' collection to return.
    // debugger;
    for (var i = 0; i < results.length; i++) {

        let _result = results[i];
        var _newMarker = "";
        var _campgroundSpecs = null;
        var _activeAPIInfo = null;
        var _iconType = "";
        var _location = null;
        var _placeId = null;
        var _markerLabel = "";
        var _dataObject = null;
        let _isStopSolverLocationMarker = markerType === markerTypes.stopSolver;

        // 2) Create our Map Marker based on the type of result passed in.
        if (markerType === markerTypes.tripStop) {

            let stopNumber = parseInt(_result.object.stopNumber, 10);
            let isDestination = _result.object.isDestination;
            _location = _result.object.position;
            _placeId = _result.object.placeId;

            // Icon Type and Marker Labels
            if (stopNumber === 1) {
                _iconType = "starting";
                _markerLabel = "";
            }
            else if (isDestination) {
                _iconType = "stoping";
                _markerLabel = "";
            }
            else {
                _iconType = "regular";
                _markerLabel = (stopNumber - 1).toString();
            }

            // Is it from Google or Active
            // [TGR_4/16/2019]: TODO: Investigate further where activeResult is set. Although, 
            // it should be okay to store it in Firebase so it may be okay.
            if (_result.object.activeResult) {
                _activeAPIInfo = _result.object.activeResult;
            }

            _dataObject = _result.object;

        }
        else if (markerType === markerTypes.tripStopPOI) {
            // For now, a POI will be a Google Result    
            _location = { lat: _result.object.position.lat, lng: _result.object.position.lng };
            _iconType = _iconType !== "" ? _iconType : _result.type;
            _placeId = _result.placeId;
            _dataObject = _result.object;
        }
        else {
            // [TGR_5/8/2019]: The assumption has been (incorrect!) that any stopSolver marker comes from 
            // Active API, so dataObject, required below, doesn't get populated. So...
            if (_result.$) {
                // Active API Result
                // NOTE: the results coming back have 'facility' misspelled. So it is 'faciltyPhoto'. Something to 
                // look for if they ever fix because our images will be empty again.
                _location = convertActiveAPICampgroundLocationToGoogleLatLng(_result.$.latitude, _result.$.longitude);
                _iconType = _iconType !== "" ? _iconType : "campground";
                _dataObject = {
                    dataService: DATASERVICE.activeAPI,
                    contractId: _result.$.contractID,
                    contractType: _result.$.contractType,
                    facilityId: _result.$.facilityID,
                    facilityName: _result.$.facilityName,
                    facilityPhoto: _result.$.faciltyPhoto,
                    sitesWithAmps: _result.$.sitesWithAmps,
                    sitesWithPetsAllowed: _result.$.sitesWithPetsAllowed,
                    sitesWithSewerHookup: _result.$.sitesWithSewerHookup,
                    sitesWithWaterHookup: _result.$.sitesWithWaterHookup,
                    location: _location
                };
            }
            else {
                // Google Result
                // [TGR_5/8/2019]: ...in this section, we'll define (TEMP) dataObject    
                _location = _result.geometry.location;
                _iconType = _iconType !== "" ? _iconType : _result.types[0];
                _placeId = _result.place_id;
                _dataObject = {
                    dataService: DATASERVICE.google,
                    facilityName: "Tim's Test!",
                    placeId: _placeId,
                    location: _location
                };
            }
        }
        // debugger;
        _newMarker = getCustomGoogleMapMarker(_location, map, _iconType, _placeId, markerType, _markerLabel);

        /*  Notes:
            [JC_6/14/17]: NOTE - for some reason the scope of the variables above
            gets lost if I don't re-assign them here. Needing to re-scope 'this', 
            makes sense, but having to do the others doesn't. Anyway, 'markerRef',
            'newMarkPos', and 'campCopy' are all declared for this reason.
            [JC_8/1/17]: still an issue.
        */
        let markerRef = _newMarker;
        let newMarkPos = _location;
        let _dataObjectCopy = _dataObject;
        _newMarker.addListener('mouseover', function (event) {

            /*  Notes:
                Don't show this marker on 'mouseover' if it is at the same location
                as our 'focusedInfoWindow'.
            
                [JC_6/21/2017]: using this as a way to tell the Map Marker's not to 
                render on 'hover'.
            */
            if (!map.getClickableIcons()) {
                return;
            }

            /*  Notes:
                'newMarkPos' - is used to determine if there is already a HoverInfoWindow
                               being shown at this position.
                 'markerRef' - is a reference to the Google Map Marker object we just created.
                  'campCopy' - a copy of the Campground object we created from the Active API
                               result this marker is based on.
            */
            markerMouseOverEvent(newMarkPos, markerRef, markerType, _dataObjectCopy);
            map.setOptions({ scrollwheel: false });

        });
        _newMarker.addListener('click', function (event) {
            markerClickEvent(markerRef, markerType, stopSolverId, _dataObjectCopy, _activeAPIInfo);
            if (event.ta) {
                event.ta.stopPropagation();
            }
            else {
                // ERROR - 'No TA'
            }
        });
        _newMarker.addListener('mouseout', function () {
            markerMouseOutEvent(markerRef);
            map.setOptions({ scrollwheel: true });
        });
        _markers.push(_newMarker);
    }

    // Return the collection of newly added Map Markers.
    return _markers;
}

/*  Summary (NOT USED):
    Creates a dashed outline version of the search radius circle (i.e. for either 25 or 100 miles).
*/
export function createReturnDashedSearchRadiusCircle(radius, point, map, isVisible = false) {

    var _lineSymbol = {
        path: 'M 0,-1 0,1',
        strokeOpacity: 1,
        scale: 3
    };

    var _dashedCirclePolyline = new google.maps.Polyline({
        path: getCirclePathFromGivenRadius(radius, point, 1),
        strokeOpacity: 0,
        icons: [{
            icon: _lineSymbol,
            offset: '0',
            repeat: '20px'
        }],
        strokeColor: "#ff9400",
        visible: isVisible
    });
    _dashedCirclePolyline.setMap(map);

    return _dashedCirclePolyline;

}

/*  Summary (NOT USED):
    Using geometry, add the search raduis marker label (i.e. 25 or 100 miles) to the 
    search radius circle.
*/
export function createReturnSearchRadiusMarkerLabel(radius, point, map, isVisible = false) {

    let d2r = Math.PI / 180;   // degrees to radians 
    let r2d = 180 / Math.PI;   // radians to degrees 
    let earthsradius = 3963; // 3963 is the radius of the earth in miles
    var rlat = (radius / earthsradius) * r2d;
    var rlng = rlat / Math.cos(point.lat() * d2r);
    var ey = point.lng() + (rlng * Math.sin(-90 * r2d));
    var ex = point.lat() + (rlat * Math.cos(-90 * r2d));
    let _markerPos = new google.maps.LatLng({ lat: ex, lng: ey });

    let _searchIconSize = new google.maps.Size(48, 22);
    let _searchIconUrl = "/images/searchRadiusMarker" + radius + "@2x.png";
    let _searchIcon = {
        url: _searchIconUrl,
        size: _searchIconSize,
        scaledSize: _searchIconSize
    };
    let _newMarker = new google.maps.Marker({
        position: _markerPos,
        map: map,
        icon: _searchIcon,
        optimized: false,
        clickable: false
    });

    return _newMarker;
}

/*  Summary:
    Creates our search radius circle (i.e. for either 25 or 100 miles).
*/
export function createReturnSearchRadiusCircle(radius, point, map, isVisible, hasBorder, editable, radiusChangedMethod, circleClickMethod) {

    let _strokeColor = stopSolverOrangeColor;
    let _fillColor = stopSolverOrangeColor;
    let _fillOpacity = 0.10;
    let _newCircle = new google.maps.Circle({
        strokeColor: _strokeColor,
        strokeOpacity: hasBorder ? 1.0 : 0,
        strokeWeight: hasBorder ? 2 : 0,
        fillColor: _fillColor,
        fillOpacity: 0.10,
        map: map,
        center: point,
        radius: getMetersFromMiles(radius),
        visible: isVisible,
        editable: editable
    });

    _newCircle.addListener('radius_changed', function () {
        let _newRadiusInMeters = this.getRadius();
        let _newRadiusInMiles = getMilesFromMeters(_newRadiusInMeters, 0);
        radiusChangedMethod(_newRadiusInMiles);
    });

    _newCircle.addListener('click', () => {
        circleClickMethod();
    });

    return _newCircle;
}

/*  Summary:
    Generic function to clear all of the given map markers from the map.
*/
export function clearMapMarkers(markers) {
    markers.forEach((marker) => {
        marker.setMap(null);
    });
}

// --------------
// =D

/*  Summary:
    Given a list of 'nextProps.stopSolverConfig.object.stops', loop through them all
    and make sure they all have a 'position'. If so, return true, else false.
*/
export function doAllStopSolverConfigStopsHaveAPosition(nextStops) {
    var _retVal = false;
    if (nextStops) {
        for (var i = 0; i < nextStops.length; i++) {
            let _nextStop = nextStops[i];
            if (_nextStop.position) {
                if (_nextStop.position.lat && _nextStop.position.lng) {
                    _retVal = true;
                }
            }
            else {
                _retVal = false;
                break;
            }
        }
    }
    return _retVal;
}


// --------------
// =F

/*  Summary:
    Given a mix of objects (i.e. Trip Stops and Google Waypoints), return a single
    list that has only Google Waypoint formatted objects, so that we can pass this
    into our routing method.
*/
export function formatWaypointsAsGoogleWaypoints(points) {
    let _formattedPoints = [];
    points.forEach(function (point) {
        if (point.object) {
            // Trip Stop - make sure these have 'stopOver' set to 'true'.
            let _formatPoint = {
                location: point.object.position,
                stopover: true
            }
            _formattedPoints.push(_formatPoint);
        }
        else if (point.lat && point.lng) {
            // [JC_12/1/17]: new waypoint coming from our Db. This is from
            // a drag operation, so the 'stopOver' is 'false'.
            let _formatPoint = {
                location: point,
                stopover: false
            }
            _formattedPoints.push(_formatPoint);
        }
        else {
            // Waypoint created by Google during a drag-route operation.
            _formattedPoints.push(point);
        }
    });
    return _formattedPoints;
}


// --------------
// =G

/*  Summary:
    Returns a sorted array of Trip Stops, in ascending order, based on the 
    Trip Stop number.
*/
export function getAscOrderedListOfTripStopsByStopNumber(tripStops) {
    function stopNumberCompare(a, b) {
        return parseInt(a.object.stopNumber, 10) - parseInt(b.object.stopNumber, 10);
    }
    return tripStops.sort(stopNumberCompare);
}

/*  Summary:
    Given a base point, and a list of positions, sort the positions based on their
    distance from the base point and return them in Ascending order.
*/
export function getAscOrderedListOfPositionsByDistanceFromBase(basePoint, positions) {
    function distanceCompare(a, b) {

        var _pointA = "";
        if (a.object) {
            _pointA = new google.maps.LatLng({ lat: a.object.position.lat, lng: a.object.position.lng });
        }
        else if (a.location) {
            _pointA = new google.maps.LatLng({ lat: a.location.lat, lng: a.location.lng });
        }
        else {
            _pointA = a;
        }

        var _pointB = "";
        if (b.object) {
            _pointB = new google.maps.LatLng({ lat: b.object.position.lat, lng: b.object.position.lng });
        }
        else if (b.location) {
            _pointB = new google.maps.LatLng({ lat: b.location.lat, lng: b.location.lng });
        }
        else {
            _pointB = b;
        }

        let _distance1 = google.maps.geometry.spherical.computeDistanceBetween(basePoint, _pointA);
        let _distance2 = google.maps.geometry.spherical.computeDistanceBetween(basePoint, _pointB);

        return _distance1 - _distance2;

    }
    return positions.sort(distanceCompare);
}

/*  Summary (NOT USED):
    ...
*/
export function getClosestPoint(basePoint, collection) {
    var isWithin5 = [];
    var isWithin10 = [];
    var isWithin20 = [];
    var isWithin30 = [];
    collection.map(function (obj) {
        let objPoint = new google.maps.LatLng({ lat: parseFloat(obj.$.latitude), lng: parseFloat(obj.$.longitude) });
        let distance = google.maps.geometry.spherical.computeDistanceBetween(basePoint, objPoint);
        let distanceInMiles = getMilesFromMeters(distance, 2);
        console.log(distanceInMiles);
        if (distanceInMiles < 6) {
            isWithin5.push(obj);
        }
        else if (distanceInMiles > 5 && distanceInMiles < 11) {
            isWithin10.push(obj);
        }
        else if (distanceInMiles > 10 && distanceInMiles < 21) {
            isWithin20.push(obj);
        }
        else if (distanceInMiles > 20 && distanceInMiles < 31) {
            isWithin30.push(obj);
        }
    });
    if (isWithin5.length > 0) {
        return [isWithin5, 5];
    }
    else if (isWithin10.length > 0) {
        return [isWithin10, 10];
    }
    else if (isWithin20.length > 0) {
        return [isWithin20, 20];
    }
    else if (isWithin30.length > 0) {
        return [isWithin30, 30];
    }
    else {
        return [];
    }
}

/*  Summary (NOT USED):
    Using geometry, return the polyline paths for a circle.
*/
export function getCirclePathFromGivenRadius(radius, point, dir) {
    let d2r = Math.PI / 180;   // degrees to radians 
    let r2d = 180 / Math.PI;   // radians to degrees 
    let earthsradius = 3963; // 3963 is the radius of the earth in miles

    let points = 32;

    // find the radius in lat/lng 
    let rlat = (radius / earthsradius) * r2d;
    let rlng = rlat / Math.cos(point.lat() * d2r);

    var extp = [];
    var start = 0;
    var end = 0;
    if (dir === 1) {
        // one extra here makes sure we connect the
        end = points + 1;
    }
    else {
        start = points + 1;
    }
    for (var i = start; (dir === 1 ? i < end : i > end); i += dir) {
        let theta = Math.PI * (i / (points / 2));
        let ey = point.lng() + (rlng * Math.cos(theta)); // center a + radius x * cos(theta) 
        let ex = point.lat() + (rlat * Math.sin(theta)); // center b + radius y * sin(theta) 
        extp.push(new google.maps.LatLng(ex, ey));
        //bounds.extend(extp[extp.length - 1]);
    }

    return extp;
}

/*  Summary (NOT USED):
    Given an angle in degrees, the center point, and a radius, return the position on our circle.
*/
export function getCirclePositionFromAnglePointAndRadius(centerPoint, radius, angle) {
    let d2r = Math.PI / 180;   // degrees to radians 
    let r2d = 180 / Math.PI;   // radians to degrees 
    let earthsradius = 3963; // 3963 is the radius of the earth in miles
    var rlat = ((radius - 4) / earthsradius) * r2d;
    var rlng = rlat / Math.cos(centerPoint.lat() * d2r);
    var ey = centerPoint.lng() + (rlng * Math.sin(angle * r2d));
    var ex = centerPoint.lat() + (rlat * Math.cos(angle * r2d));
    let _markerPos = new google.maps.LatLng({ lat: ex, lng: ey });
    return _markerPos;
}

/*  Summary:
    Given our current marker label scheme where the icon is prefixed with "ts_" (for Trip Stop),
    or "ss_" (for Stop Solver), this will get the current Marker's label from the icon given this
    scheme.
 */
export function getCurrentTripStopMarkerLabel(marker) {
    let markerUrl = marker.getIcon().url;
    let parts1 = markerUrl.split("_");
    let parts2 = parts1[1].split("@");
    let markerLabel = parts2[0];
    return markerLabel;
}

/*  Summary: 
    Get the Trip Stop closest to a given point/position given a 'point' (already formatted
    into a Google LatLng object), and a collection of 'tripStops'.
*/
export function getTripStopClosesToGivenPoint(point, tripStops) {

    var retVal = tripStops[0];
    var curDistanceFromPoint = 0;

    tripStops.forEach((tripStop) => {
        let _tripStopLocation = new google.maps.LatLng({ lat: tripStop.object.position.lat, lng: tripStop.object.position.lng });
        let _distanceFromPoint = google.maps.geometry.spherical.computeDistanceBetween(point, _tripStopLocation);
        if (curDistanceFromPoint === 0) {
            retVal = tripStop;
            curDistanceFromPoint = _distanceFromPoint;
        }
        else if (_distanceFromPoint < curDistanceFromPoint) {
            retVal = tripStop;
            curDistanceFromPoint = _distanceFromPoint;
        }
    });

    return retVal;
}

/*  Summary:
    Given a list of Trip Stops, and a Trip Stop Marker, we loop through the Trip Stops, find
    the marker, and return the Trip Stop Number this marker should have.
*/
export function getCorrectStopNumberGivenTripStopsAndATripStopMapMarker(tripStops, marker) {
    var _retVal = "na";
    // debugger;
    for (var i = 0; i < tripStops.length; i++) {
        let _stop = tripStops[i];
        let _stopLat = round(_stop.object.position.lat, 5);
        let _stopLng = round(_stop.object.position.lng, 5);
        let _markerLat = round(marker.position.lat(), 5);
        let _markerLng = round(marker.position.lng(), 5);
        if (_stopLat === _markerLat && _stopLng === _markerLng) {
            _retVal = _stop.object.stopNumber;
            break;
        }
    }
    return _retVal;
}

/*  Summary:
    Given a set of locations, a base location, and a max search radius, return
    only those locations who fall inside of that max search radius.
*/
export function getFilteredListOfResults(results, basePoint, maxSearchRadius) {
    let _retSet = [];
    results.forEach(function (result) {
        let objPoint = new google.maps.LatLng({ lat: parseFloat(result.$.latitude), lng: parseFloat(result.$.longitude) });
        let distance = google.maps.geometry.spherical.computeDistanceBetween(basePoint, objPoint);
        if (getMilesFromMeters(distance) <= maxSearchRadius) {
            _retSet.push(result);
        }
    });
    return _retSet;

}

/*  Summary:
    Filter out any existing search results, trip stops, or pois from the
    results passed in from the Active API.

    [TGR_5/7/2019]: The comparison is by lat/lng. Is this really effective?
*/
export function getFilteredForExistingLocationActiveResults(results, tripStops, pois, searchResults) {

    let filteredResults1 = [];

    // 1) First, lets loop through all of the 'tripStops', and remove any 'results' that
    // are found in them.
    results.forEach((result) => {
        let lat = round(result.$.latitude, 5);
        let lng = round(result.$.longitude, 5);
        var isFound = false;
        for (var i = 0; i < tripStops.length; i++) {
            let tripStop = tripStops[i];
            let tsLat = round(tripStop.object.position.lat, 5);
            let tsLng = round(tripStop.object.position.lng, 5);
            if (tsLat === lat && tsLng === lng) {
                isFound = true;
                break;
            }
        }
        if (!isFound) {
            filteredResults1.push(result);
        }
    });

    // 2) Then, loop through existing results to see if any are in our 'pois'.
    let filteredResults2 = [];
    filteredResults1.forEach((result) => {
        let lat = round(result.$.latitude, 5);
        let lng = round(result.$.longitude, 5);
        var isFound = false;
        for (var i = 0; i < pois.length; i++) {
            let poi = pois[i];
            let tsLat = round(poi.object.position.lat, 5);
            let tsLng = round(poi.object.position.lng, 5);
            if (tsLat === lat && tsLng === lng) {
                isFound = true;
                break;
            }
        }
        if (!isFound) {
            filteredResults2.push(result);
        }
    });

    // 3) Finally, loop through existing results to see if any are in our 'searchResults'.
    let filteredResults3 = [];
    filteredResults1.forEach((result) => {
        let lat = round(result.$.latitude, 5);
        let lng = round(result.$.longitude, 5);
        var isFound = false;
        for (var i = 0; i < searchResults.length; i++) {
            let searchResult = searchResults[i];
            let tsLat = round(searchResult.geometry.location.lat(), 5);
            let tsLng = round(searchResult.geometry.location.lng(), 5);
            if (tsLat === lat && tsLng === lng) {
                isFound = true;
                break;
            }
        }
        if (!isFound) {
            filteredResults3.push(result);
        }
    });

    return filteredResults3;

}

/*  Summary:
    Filter out any existing trip stops, or pois from the Google Search results 
    passed in.
*/
export function getFilteredForExistingLocationGoogleResults(results, tripStops, pois) {

    let filteredResults1 = [];

    // 1) First, lets loop through all of the 'tripStops', and remove any 'results' that
    // are found in them.
    results.forEach((result) => {
        let lat = round(result.geometry.location.lat(), 5);
        let lng = round(result.geometry.location.lng(), 5);
        var isFound = false;
        for (var i = 0; i < tripStops.length; i++) {
            let tripStop = tripStops[i];
            let tsLat = round(tripStop.object.position.lat, 5);
            let tsLng = round(tripStop.object.position.lng, 5);
            if (tsLat === lat && tsLng === lng) {
                isFound = true;
                break;
            }
        }
        if (!isFound) {
            filteredResults1.push(result);
        }
    });

    // 2) Then, loop through existing results to see if any are in our 'pois'.
    let filteredResults2 = [];
    filteredResults1.forEach((result) => {
        let lat = round(result.geometry.location.lat(), 5);
        let lng = round(result.geometry.location.lng(), 5);
        var isFound = false;
        for (var i = 0; i < pois.length; i++) {
            let poi = pois[i];
            let tsLat = round(poi.object.position.lat, 5);
            let tsLng = round(poi.object.position.lng, 5);
            if (tsLat === lat && tsLng === lng) {
                isFound = true;
                break;
            }
        }
        if (!isFound) {
            filteredResults2.push(result);
        }
    });

    return filteredResults2;

}

/*  Summary:
    Get the number of miles in every stop based on the number of stops
    and the distance in miles.
*/
export function getMilesPerStop(distanceInMiles, noOfStops) {
    // Because 3 stops means the trip is divided into 4 segments.
    let milesPerStop = Math.ceil(distanceInMiles / (noOfStops + 1));
    return milesPerStop;
}

/*  Summary:
    Given a collection of Trip Stops, and a new position, figure out what Trip Stop Number
    the new position should get when its Trip Stop is created and return it.
*/
export function getNewTripStopNumberFromPositionAndTripStops(tripStops, position) {
    let _withNewPoint = [
        ...tripStops,
        position
    ];
    let _startingPoint = new google.maps.LatLng({ lat: tripStops[0].object.position.lat, lng: tripStops[0].object.position.lng });
    var _sortedPoints = getAscOrderedListOfPositionsByDistanceFromBase(_startingPoint, _withNewPoint);

    // Loop through each. Start at 0.
    let _newNumber = 0;
    for (var i = 0; i < _sortedPoints.length; i++) {
        let _point = _sortedPoints[i];
        if (!_point.object && !_point.location) {
            // This is our Marker
            // Add '1' because the number we record for a Stop Number is actually
            // '1' less than it really is. This is because the 'start' gets a Stop Number
            // of '1' for example, so we offset all others by this number.
            _newNumber = i + 1;
            break;
        }
    }

    return _newNumber;
}

/*  Summary:
    Get the number of stops given a distance in miles, and the max number
    of miles per stop.
*/
export function getNoOfStops(distanceInMiles, milesPerStop) {
    let noOfStops = Math.ceil(distanceInMiles / milesPerStop);
    return noOfStops;
}

/*  Summary:
    Given a collection of both Trip Stops, and Google Waypoints (collected from dragging 
    the route), put them all in the proper order and return a properly formatted
    list we can send to Google to display the route.
*/
export function getOrderedWaypointsFromTripStopsAndRoute(tripStops, routeWaypoints) {

    // [JC_12/1/17]: right now, any dragged points that aren't being used, will still reside on the
    // Trip object until the user re-drags the route. They will simply be ignored below around
    // Line 867.

    // [JC_12/2/17]: Note - the 'round' function below was initially rounding our
    // Lat/Lng values to '5' decimal places. But that was still giving mismatches 
    // between what Google was returning for an 'Active' result, and what 'Active'
    // was returning for their Lat/Lng. Then I tried '2' decimals places, and it was
    // still off. So '1', seems to be what is needed.
    // This seems bad though, because that means we are basically saying that a
    // location at [85.1,-90.2] is the same as [85.10399399,-90.2300939] - we
    // are loosing a lot of precision.

    // 1) Get an Asc Ordered list of Trip Stops.
    var combinedTripStopsWaypoints = [];
    var _ascOrderedTripStops = getAscOrderedListOfTripStopsByStopNumber(tripStops);
    for (var j = 0; j < _ascOrderedTripStops.length; j++) {

        let tripStop = _ascOrderedTripStops[j];
        combinedTripStopsWaypoints.push(tripStop);

        let nextTripStop = _ascOrderedTripStops[j + 1];
        if (nextTripStop && routeWaypoints) {

            // This means it is possible for us to have waypoints between this Trip Stop,
            // and the next one.
            let tripStopLat = round(tripStop.object.position.lat, 1);
            let tripStopLng = round(tripStop.object.position.lng, 1);
            let nextTripStopLat = round(nextTripStop.object.position.lat, 1);
            let nextTripStopLng = round(nextTripStop.object.position.lng, 1);

            // See if we have any waypoints between this Trip stop (tripStop) and
            // the next one (nextTripStop).
            for (var k = 0; k < routeWaypoints.length; k++) {

                let waypoint = routeWaypoints[k];
                let waypointStartLat = round(waypoint.start.lat, 1);
                let waypointStartLng = round(waypoint.start.lng, 1);
                let waypointEndLat = round(waypoint.end.lat, 1);
                let waypointEndLng = round(waypoint.end.lng, 1);

                if (tripStopLat === waypointStartLat && tripStopLng === waypointStartLng) {
                    if (nextTripStopLat === waypointEndLat && nextTripStopLng === waypointEndLng) {
                        // We have proven that there are waypoints between the current stop (tripStop) and
                        // the next one (nextTripStop). So we need to add them to our 'combined' array.
                        combinedTripStopsWaypoints = combinedTripStopsWaypoints.concat(waypoint.waypoints);
                        break;
                    }
                }

            }

        }

    }

    // 2) Grab all of the items in the array except the start and stop (i.e. first, last).
    let cleansedWayPointsOfStartEndTripStop = [];
    for (var i = 0; i < combinedTripStopsWaypoints.length; i++) {
        let _stop = combinedTripStopsWaypoints[i];
        if (i > 0 && i < combinedTripStopsWaypoints.length - 1) {
            cleansedWayPointsOfStartEndTripStop.push(_stop);
        }
    }

    // 3) Now, format this collection into a collection of waypoints that Google
    // can read.
    let formattedWaypoints = formatWaypointsAsGoogleWaypoints(cleansedWayPointsOfStartEndTripStop);
    return formattedWaypoints;

}

/*  Summary:
    Given a collection of waypoints, and two stop positions, return only the waypoints
    that fall betwee those two stops. Similary to the 'getOrderedWaypointsFromTripStopsAndRoute' above. 
*/
export function getWaypointsBetweenTwoStops(stopAPos, stopBPos, storedWaypoints) {

    // [JC_12/2/17]: Note - the 'round' function below was initially rounding our
    // Lat/Lng values to '5' decimal places. But that was still giving mismatches 
    // between what Google was returning for an 'Active' result, and what 'Active'
    // was returning for their Lat/Lng. Then I tried '2' decimals places, and it was
    // still off. So '1', seems to be what is needed.
    // This seems bad though, because that means we are basically saying that a
    // location at [85.1,-90.2] is the same as [85.10399399,-90.2300939] - we
    // are loosing a lot of precision.

    // Between positions.
    let stopALat = round(stopAPos.lat, 1);
    let stopALng = round(stopAPos.lng, 1);
    let stopBLat = round(stopBPos.lat, 1);
    let stopBLng = round(stopBPos.lng, 1);

    // See if we have any waypoints between these positions.
    let retCollectionOfWaypoints = [];
    for (var k = 0; k < storedWaypoints.length; k++) {

        let waypoint = storedWaypoints[k];
        let waypointStartLat = round(waypoint.start.lat, 1);
        let waypointStartLng = round(waypoint.start.lng, 1);
        let waypointEndLat = round(waypoint.end.lat, 1);
        let waypointEndLng = round(waypoint.end.lng, 1);

        if (stopALat === waypointStartLat && stopALng === waypointStartLng) {
            if (stopBLat === waypointEndLat && stopBLng === waypointEndLng) {
                // We have proven that there are waypoints between the current stop (tripStop) and
                // the next one (nextTripStop). So we need to add them to our 'combined' array.
                retCollectionOfWaypoints = retCollectionOfWaypoints.concat(waypoint.waypoints);
                break;
            }
        }

    }

    return retCollectionOfWaypoints;

}

/*  Summary:
    Given a distance in meters, we convert the distance to miles and return an
    appropriate search radius (in miles) accordingly.
*/
export function getInitialSearchRadiusForStopSolver(distanceInMeters) {
    let _searchRadius = getMilesFromMeters(distanceInMeters) > 800 ? 100 : 25;
    return _searchRadius;
}

/*  Summary: 
    Given a Directions Result from Google, loop through the Legs of the first
    route and calculate the total distance in meters, and duration in seconds.
*/
export function getTotalDistanceAndDurationFromDirectionResult(result) {
    var _runningDistance = 0;
    var _runningDuration = 0;
    result.routes[0].legs.forEach(function (leg) {
        _runningDistance += leg.distance.value;
        _runningDuration += leg.duration.value;
    });
    return [_runningDistance, _runningDuration];
}

/*  Summary:
    Given a 'stopNumber' and a 'position', find the corresponding TripStop
    in the given collection and return it's key.
*/
export function getTripStopIdFromTripStops(stopNumber, position, tripStops) {
    var retVal = "";
    for (var i = 0; i < tripStops.length; i++) {
        let tripStop = tripStops[i];
        if (tripStop.object.stopNumber === stopNumber) {
            let _tripStopPosLatRnd = round(tripStop.object.position.lat, 5);
            let _posLatRnd = round(position.lat, 5);
            if (_tripStopPosLatRnd === _posLatRnd) {
                let _tripStopPosLngRnd = round(tripStop.object.position.lng, 5);
                let _posLngRnd = round(position.lng, 5);
                if (_tripStopPosLngRnd === _posLngRnd) {
                    retVal = tripStop.key;
                    break;
                }
            }
        }
    }
    return retVal;
}

/*  Summary:
    When removing, or adding, a Trip Stop that will cause the current Start/Stop info
    to change, we need to also update the Trip object itself. To do this, we need a
    chunk of information from the Trip Stop. So we need to get this Trip Stop object
    to pass along for further processing. So given a 'tripStopNumber', this method
    will loop through the current list of Trip Stops, and given a flag that says
    this will be updating the Stop point, return either the second Trip Stop or
    the second to last Trip Stop.
*/
export function getTripStopObjectToCopyForStartStopUpdate(tripStopNumber, tripStops, isUpdatingDestinationInfo) {
    var tripStopInfo = null;
    for (var i = 0; i < tripStops.length; i++) {
        let tripStop = tripStops[i];
        if (!isUpdatingDestinationInfo) {
            // 1a) Altering the Starting point. Get next Trip Stop. We always be '2'.
            if (tripStop.object.stopNumber === 2) {
                tripStopInfo = tripStop;
                break;
            }
        }
        else {
            // 1b) Altering the Ending point. Get previous Trip Stop.
            if (tripStop.object.stopNumber === (tripStopNumber - 1)) {
                tripStopInfo = tripStop;
                break;
            }
        }
    }
    return tripStopInfo;
}

// --------------
// =S

/*  Summary:
    Given a search radius, and the map, set the zoom accordingly.
*/
export function setMapZoomBasedOnSearchRadius(radius, map) {
    if (radius === 25) {
        map.setZoom(10);
    }
    else {
        map.setZoom(8);
    }
}

/* Summary:
    Hack - seems there is a bug with Google Maps where sometimes
    you have to move the map to get markers to show.
*/
export function shakeMapToShowMissingElements(map) {
    // NOTE - the example showed this being down on 'zoom_changed', fyi.
    setTimeout(function () {
        var cnt = map.getCenter();
        cnt.e += 0.000001;
        map.panTo(cnt);
        cnt.e -= 0.000001;
        map.panTo(cnt);
    }, 400);
}

/*  Summary:
    Given two sets of 'stopSolverConfig.objects' (next and old), compare them to see if we should update
    their map elements.
*/
export function shouldAnExistingStopSolverConfigsStopsBeUpated(nextStopSolverConfig, oldStopSolverConfig) {

    let _nextStops = nextStopSolverConfig.object.stops;
    let _oldStops = oldStopSolverConfig.object.stops;
    var _retVal = false;

    // 1) Loop through all of the 'nextProps' stopSolverConfig.stops and make sure
    // all of them have a position object. If not, then we don't need to update.
    let _updatable = doAllStopSolverConfigStopsHaveAPosition(
        _nextStops
    );

    // 2) If all of the incoming 'stops' do have a position, then we 'might' need
    // to update. Now check specifics.                
    if (_updatable) {
        if (_nextStops.length !== _oldStops.length) {
            // 2a) Let's see if the number of stops has changed.
            _retVal = true;
        }
        else if (nextStopSolverConfig.object.isVisible !== oldStopSolverConfig.object.isVisible) {
            // 2b) Let's see if the 'visibility' has changed.
            _retVal = true;
        }
        else {
            // 2c) Let's see if the positions themselves have changed.
            let _tempBool = shouldStopSolverConfigStopsPositionsBeUpdated(
                _nextStops,
                _oldStops
            );
            if (_tempBool) {
                _retVal = _tempBool;
            }
        }
    }

    return _retVal;
}

/*  Summary:
    Given a list of old (this.props) 'stopSolverConfig.object.stops' and a new list, compare
    the two and see if the positions have changed. Return a boolean indicating as much.
*/
export function shouldStopSolverConfigStopsPositionsBeUpdated(nextStops, oldStops) {
    var _retVal = false;
    for (var i = 0; i < nextStops.length; i++) {
        let _newStop = nextStops[i];
        for (var j = 0; j < oldStops.length; j++) {
            let _oldStop = oldStops[j];
            if (_oldStop.stopNumber === _newStop.stopNumber) {
                // Need to check and see if we even have positions for the stops yet. On newly
                // created Trips, we won't until the 'calculateStopSolvers' (i.e. Google's routing)
                // has happened. So if we don't have any postions, we don't need to update the
                // map elements.
                if (_oldStop.position) {
                    let _oldStopLat = round(_oldStop.position.lat, 5);
                    let _oldStopLng = round(_oldStop.position.lng, 5);
                    let _newStopLat = round(_newStop.position.lat, 5);
                    let _newStopLng = round(_newStop.position.lng, 5);
                    if (_oldStopLat !== _newStopLat || _oldStopLng !== _newStopLng) {
                        _retVal = true;
                    }
                }
                else {
                    if (_newStop.position) {
                        _retVal = true;
                    }
                }
                break;
            }
        }
    }
    return _retVal;
}

/*  Summary (NOT USED):
    Just hide, or show, ALL of the circles. So for EVERY Stop Solver Marker, find
    its circles and either hide/show them.
*/
export function showHideAllCircles(stopSolverMarkers, isShow) {
    stopSolverMarkers.forEach(function (stopSolverMarker) {
        if (stopSolverMarker.searchElements) {
            showHideCircleForAGivenStopSolverMarker(stopSolverMarker, isShow);
        }
    });
}

/*  Summary (NOT USED):
    Given a Stop Solver Id, find it, and then pass the flag to either hide, or show it.
*/
export function showHideCirclesForAGivenStopSolverById(stopSolverMarkers, id, isShow) {
    for (var i = 0; i < stopSolverMarkers.length; i++) {
        let _marker = stopSolverMarkers[i];
        if (_marker.searchElements) {
            showHideCirclesForAGivenStopSolverMarker(_marker, isShow);
        }
    }
}

/*  Summary:
    For a given Stop Solver Marker, either hide, or show, all of the
    circles and labels associated it with it.
*/
export function showHideCirclesForAGivenStopSolverMarker(marker, isShow) {
    if (marker.searchElements.searchCircle) {
        marker.searchElements.searchCircle.setVisible(isShow);
    }
}

/*  Summary:
    For every Stop Solver Location Marker object, set each of its actual Google Map Markers
    visibility to true/false.
*/
export function showHideAllStopSolverLocationMarkersForGivenMarker(stopSolverLocationMarkers, marker, isShow) {
    for (var i = 0; i < stopSolverLocationMarkers.length; i++) {
        let _stopSolverLocationMarker = stopSolverLocationMarkers[i];
        if (_stopSolverLocationMarker.stopNumber === marker.stopNumber) {
            _stopSolverLocationMarker.markers.forEach(function (_marker) {
                if (_marker.visible !== isShow) {
                    _marker.setVisible(isShow);
                }
            });
            break;
        }
    }
}


// --------------
// =U

/*  Summary:
    Given a stopSolverMarker and a new position, get its 'searchCircle' and update
    the position accordingly.
*/
export function updateMarkerCircleElementsPosition(marker, position) {
    marker.searchElements.searchCircle.setCenter(position);
}

/*  Summary:
    Given a set of Stop Solver markers, and location markers, along with stops - loop
    through all and see what needs to be updated. If stops need to be plotted with markers,
    the 'plotMethod' is passed in for us to execute. An 'isVisible' property should be coming
    from the StopSolverConfig itself. In case we need to plot a marker, but render it invisible
    from the start.
*/
// [TGR_5/14/2019]: Another key function for the current Google search problem
export function updateStopSolverMapElements(
    stopSolverMarkers,
    stopSolverLocationMarkers,
    stops,
    plotMethod,
    clearStopSolverLocationsMethod,
    isVisible,
    newLocationSearchMethod,
    stopSolverType,
    focusedStopSolverMarker) {

    var _stopsToAdd = [];
    if (stopSolverMarkers.length > 0) {
        debugger;

        // Some markers are already plotted, so we need to see if their position,
        // or visibility needs to be updated. We also need to see if there are new
        // stops that need to be added.                    
        stops.forEach(function (stop) {
            // Let's see if it is already in the 'stopSolverMarkers'.
            var _foundAMarker = null;
            for (var i = 0; i < stopSolverMarkers.length; i++) {
                let _stopSolverMarker = stopSolverMarkers[i];
                if (_stopSolverMarker.stopNumber === stop.stopNumber) {
                    _foundAMarker = _stopSolverMarker;
                    break;
                }
            }
            if (_foundAMarker) {

                // We found a Marker, so now let's see if its 'visibility' 
                // needs to be updated.
                if (_foundAMarker.marker.getVisible() !== isVisible) {
                    _foundAMarker.marker.setVisible(isVisible);
                    if (focusedStopSolverMarker) {
                        // [11/27/17]: with the way the app is currently set up, this may never
                        // be called. Because we clear the 'focusedStopSolverMarker' when we 
                        // toggle off 'stop solving'. So when it is toggled on, which this logic
                        // is triggered by, the 'focusedStopSolverMarker' will always be null.
                        if (focusedStopSolverMarker.stopNumber === _foundAMarker.stopNumber) {
                            showHideCirclesForAGivenStopSolverMarker(_foundAMarker, isVisible);
                            showHideAllStopSolverLocationMarkersForGivenMarker(stopSolverLocationMarkers, _foundAMarker, isVisible);
                        }
                    }
                }

                // We found a Marker, so now let's see if its 'position' needs. to be updated.
                let _stopPos = new google.maps.LatLng(stop.position.lat, stop.position.lng);

                var _shouldUpdatePos = false;
                if (_foundAMarker.marker.getPosition()) {
                    if (_foundAMarker.marker.getPosition().toString() !== _stopPos.toString()) {
                        _shouldUpdatePos = true;
                    }
                }
                else {
                    _shouldUpdatePos = true;
                }
                if (_shouldUpdatePos) {
                    _foundAMarker.marker.setPosition(_stopPos);

                    // Re-center our search circles if the Stop Solver marker has moved.
                    if (_foundAMarker.searchElements.searchCircle) {

                        // Need to clear any possible Stop Solver location markers.
                        clearStopSolverLocationsMethod(_foundAMarker.stopNumber);

                        if (_foundAMarker.searchElements.searchCircle.getVisible()) {
                            // 1) It is currently showing, so we want to keep showing it
                            // after we update the location of the 'stopSolverMarker'.
                            // Meaning, we need to re-search for the location markers.
                            console.log("Re-pos Circle for Stop " + _foundAMarker.stopNumber + " and searching.");
                            updateMarkerCircleElementsPosition(_foundAMarker, _stopPos);
                            newLocationSearchMethod(
                                { lat: stop.position.lat, lng: stop.position.lng },
                                stopSolverType,
                                _foundAMarker.stopNumber,
                                _foundAMarker.searchElements.searchRadius
                            );
                        }
                        else {
                            // 2) Otherwise, we just clear the 'searchCircle' so that
                            // when the 'stopSolverMarker' is clicked next, it will
                            // re-search, and re-add the right circle then.
                            console.log("Clearing Circle for Stop " + _foundAMarker.stopNumber);
                            _foundAMarker.searchElements.searchCircle.setMap(null);
                            _foundAMarker.searchElements.searchCircle = null;
                        }

                    }
                }

            }
            else {
                // We did NOT find a Marker, so we need to add one.
                _stopsToAdd.push(stop);
            }
        });

    }
    else {
        // We don't have any markers plotted yet, so just plot them all.
        if (stops) {
            _stopsToAdd = [
                ...stops
            ];
        }
    }

    // Add any Markers that need to be added.
    if (_stopsToAdd.length > 0) {
        plotMethod(_stopsToAdd, isVisible);
    }

}

/*  Summary:
    This assume only one (1) route is ever being used. If we ever go to allowing the
    User to choose between multiple routes, this will have to be revised.

    Otherwise, the function correlates the 'start/endAt' for a Stop Solver,
    with the right route, or leg of the trip. It returns a Distance, Duration, and
    Path over which the 'calculateStopSolver' on 'Map.js' can calculate accordingly.
 */
export function getDistanceDurationAndPathForCalcStopSolvers(startAt, endAt, routeResults, noOfTripStops) {

    var retVal = [];
    if (startAt === 1 && (endAt === noOfTripStops)) {
        // Plot over the 'whole' route.
        let _distanceAndDuration = getTotalDistanceAndDurationFromDirectionResult(routeResults);
        let _path = routeResults.routes[0].overview_path;
        retVal = [_distanceAndDuration[0], _distanceAndDuration[1], _path];
    }
    else {

        /*  Methodology for how we are calculating the right Leg(s) to
            return:  

            - Special case for 'startAt' == 'endAt', just return first route.

            - The 'startAt' tells us which 'route' to start with. Remember that
              our 'Legs' are a 'zero' (0) based array. So ...
              stop 1, 1 - 1 = 'leg 0'
              stop 2, 2 - 1 = 'leg 1'
              stope 3, 3 - 1 = 'leg 2'

            - The 'endAt' tells us which 'route' to stop on. So ...
              stop 2, 2 - 2 = 'leg 0'    
        */

        var startingLeg = startAt - 1;
        var endingLeg = endAt - 2;

        if (startingLeg === endingLeg) {
            // Return just 'this' Leg.
            let leg = routeResults.routes[0].legs[startingLeg];
            let allPaths = [];
            leg.steps.forEach((step) => {
                step.path.forEach((location) => {
                    allPaths.push(location);
                });
            })
            retVal = [leg.distance.value, leg.duration.value, allPaths];
        }
        else {
            // Returning multiple Legs.
            var runningDistance = 0;
            var runningDuration = 0;
            let allPaths = [];
            for (var i = startingLeg; i < (endingLeg + 1); i++) {
                let leg = routeResults.routes[0].legs[i];
                runningDistance += leg.distance.value;
                runningDuration += leg.duration.value;
                leg.steps.forEach((step) => {
                    step.path.forEach((location) => {
                        allPaths.push(location);
                    });
                })
            }
            retVal = [runningDistance, runningDuration, allPaths];
        }

    }

    return retVal;

}

/*  Summary:
    This actually extracts logic that I was duplicating in the 'Map.js' file. It takes
    the 'stopSolverConfig', current 'routeResults', and the 'noOfTripStops', and 
    calculates the Path, MilesPerStop, and NoOfStops, which returned in an array,
    and then used in the 'calculateStopSolver' in the 'Map.js'.

 */
export function getPathMilesPerStopAndNoOfStopsForCalcStopSolvers(stopSolverConfig, routeResults, noOfTripStops) {

    let _startAt = stopSolverConfig.object.startingAt;
    let _endAt = stopSolverConfig.object.endingAt;
    let allVals = getDistanceDurationAndPathForCalcStopSolvers(_startAt, _endAt, routeResults, noOfTripStops);

    let distInMiles = getMilesFromMeters(allVals[0], 0);
    let path = allVals[2];

    var milesPerStop = stopSolverConfig.object.noOfMilesPerStop;
    var noOfStops = 0;
    if (stopSolverConfig.object.stops) {
        noOfStops = stopSolverConfig.object.stops.length;
    }

    if (stopSolverConfig.object.isUsingNoOfStops) {
        milesPerStop = getMilesPerStop(distInMiles, noOfStops);
    }
    else {
        noOfStops = getNoOfStops(distInMiles, milesPerStop);
    }

    return [path, milesPerStop, noOfStops];

}

// [TGR_4/23/2019]: None of this is being used. Delete when ready!
// /*  [TGR_4/16/2019]: Summary:
//     This function takes a tripStop and 'tripStopDetails' array, and 
//     returns a revised object that includes place details for the stop.

// */
// export function addDetailsToTripStops(tripStop, tripStopDetails) {
//     let merged = null;
//     let detailedTripStop = null;
//     debugger;
//     tripStopDetails.some( candidate => {
//         // debugger;
//         if (candidate.key === tripStop.object.placeId) {
//             merged = {...tripStop.object, ...candidate.object};
//         }
//         return merged;
//     });
//     if (merged !== null) {
//         detailedTripStop = {
//             key: tripStop.key,
//             object: merged
//         };
//     }
//     console.log('After the some: %o',  detailedTripStop);
//     // debugger;
//     return detailedTripStop;
// }