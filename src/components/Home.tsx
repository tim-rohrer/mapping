import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Map from '../components/Map'
import InfoWindow from '../components/InfoWindow'
import Button from '../components/Button'
import { assembleSelectedTripData, selectedTripIsShown } from '../ducks/selectedTrip'
import { fetchGoogleDetailsForPlaceId } from '../ducks/placesGoogle'
import { mappingServiceRequested, mappingServiceSetupRequested } from '../ducks/appStatus'

// import { getMyLocation } from '../assets/geolocation'

/* eslint-disable react-hooks/exhaustive-deps */

/**
 * The home or main container for the app
 *
 */

const Home = () => {

    // Set up
    // const myStore = useStore()
    let dispatch = useDispatch()
    debugger
    const mappingService = useSelector((state) => state.appStatus.appMappingService)
    const isAppLoaded = useSelector((state) => state.appStatus.appLoaded)
    const places = useSelector((state) => state.placesGoogle.places)
    const selectedTripIsLoaded = useSelector((state) => state.selectedTrip.selectedTripIsLoaded)
    
    const isGoogleReady = useSelector((state) => state.appStatus.mappingServicesAvailable.google)

    if (!isAppLoaded) dispatch(mappingServiceSetupRequested(mappingService))

    // Placeholder data
    let trip = {
        orderedStops: ["ChIJK-0sC0Fl1oYRFccWTTgtw3M", "ChIJgdL4flSKrYcRnTpP0XQSojM" ],
        end2: "ChIJGzE9DS1l44kRoOhiASS_fHg"
    }

    /** @param {TripParameters) tripParameters */
    const [tripParameters, setTripParameters ] = useState({
        orderedStops: trip.orderedStops,
        noStopsDesired: 3
    })


    // Accepts an array of locations and links, and the map, and places
    // them on the map with a link to open additional information.
    // const addMarkers = links => map => {
    //     links.forEach((link, index) => {
    //       const marker = new window.google.maps.Marker({
    //         map,
    //         position: link.coords,
    //         label: `${index + 1}`,
    //         title: link.title,
    //       })
    //       marker.addListener(`click`, () => {
    //         window.location.href = link.url
    //       })
    //     })
    //   }

    const [mapProps, setMapProps] = useState({
        options: {
            center: {
                lat: 39.833333, 
                lng: -98.583333
            },
            zoom: 4,
            disableDefaultUI: false
        }
    })

    // getMyLocation().then( myPosit => {
    //     const {options} = mapProps
    //     let newLink = {
    //         coords: myPosit,
    //         title: "My Location",
    //     };
    //     links.push(newLink);
    //     setMapProps({
    //         options,
    //         onMount: addMarkers(links)
    //     })

    //   })

    const getMyState = () => {
        // console.log(store.getState())
    }

    const setMappingService = (service) => {
        dispatch(mappingServiceRequested(service))
    }

    useEffect(() => {
        debugger
        console.log("Current mapping props: ",mapProps)
        if (isGoogleReady && mappingService === "google") {
            let gMaps = window.google.maps
            if (!selectedTripIsLoaded) {
                dispatch(assembleSelectedTripData(tripParameters, gMaps))
            } 
                else { 
                    dispatch(selectedTripIsShown())
                }

            // Make sure our trip stops have details loaded
            // const {orderedStops} = tripParameters
            // orderedStops.forEach((stopId) => {
            //     if (places[stopId] === undefined) {
            //         dispatch(fetchGoogleDetailsForPlaceId(stopId, gMaps))
            //     }
            // })
        } 
    },[selectedTripIsLoaded, mappingService, isGoogleReady, isAppLoaded])

    let list = [
        {service: "google"},
        {service: "mapbox"}
    ] 

    const [showDropdown, setShowDropdown] = useState(false)

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown)
    }
//     // const MemoMap = useCallback(<Map {...mapProps} {...onMount}/>, [])
//     // debugger

    return (
        <>
        <div>
            <h1 className="App">Mapping Demo</h1>
            <div className="menu-bar">
                <span>

                    <InfoWindow {...tripParameters} />
                    <Button onClick={() => toggleDropdown()}
                        >Mapping Service</Button>
                        { showDropdown && 
                            list.map(item => 
                                <div key={item.service}>
                                    <Button onClick={() => setMappingService(item.service)}>{item.service}</Button>
                                </div>
                            )
                        } 
                    <Button onClick={() => getMyState()}
                       >Log Current State</Button>
                </span>
              { isAppLoaded 
                ? 
                <Map {...mapProps}/>
                : <div> NOOOOOOOOPE </div>
            }
            </div>

        </div>
        </>
    )
}

export default Home;

/**

 */

 /**
  *
  */