import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
// import { mapboxgl } from 'mapbox-gl'
import { appIsThinking } from '../ducks/appStatus'
// import { assembleStopSolverSearchResults } from '../ducks/stopSolver'

// import { functions, isEqual, omit } from 'lodash'

/* eslint-disable react-hooks/exhaustive-deps */

let i = 1

/**
 * Google Map Component
 *
 * @param {Object} mapOpts - "{ options, onMount, className }" are extracted
 * @component
 */
const Map = ({ options, className }) => {

  const ref = useRef(null)
  const dispatch = useDispatch()
  let mappingService = useSelector((state) => state.appStatus.appMappingService)
  const isGoogleReady = useSelector((state) => state.appStatus.mappingServicesAvailable.google)
  const isMapboxReady = useSelector((state) => state.appStatus.mappingServicesAvailable.mapbox)
  const selectedTripIsShown = useSelector((state) => state.selectedTrip.selectedTripIsShown)
  const currentTrip = useSelector((state) => state.trips.trips["w.00001"])
  const places = useSelector((state) => state.placesGoogle.places)

  // const myEventHandler = posit => {

  //   dispatch(assembleStopSolverSearchResults(posit))
  // }

  useEffect(() => {
    console.log("Number of map renders: ",i)
    i+=1

    if (isGoogleReady && mappingService === "google") {
      // debugger
      const map = new window.google.maps.Map(ref.current, options)
      if (selectedTripIsShown) {
        let directionsRenderer = new window.google.maps.DirectionsRenderer({
          map: map,
          draggable: false,
          suppressMarkers: true
        })

        let myMarker = new window.google.maps.Marker({
          position: {
            lat: 32,
            lng: -110
          },
          map: map,
          optimized: false,
          draggable: false
        })

        myMarker.addListener('click', event => {
          let searchPosit = {
              lat: event.latLng.lat(),
              lng: event.latLng.lng()
            }
            dispatch(appIsThinking())
            // dispatch(assembleStopSolverSearchResults(searchPosit))
        })


        // let markers = currentTrip.stopSolverMarkersByRoute
        // markers[0].map( marker => {
        //   marker.setMap(map)
        //   marker.addListener('click', event => {
        //     let posit = {
        //       lat: event.latLng.lat(),
        //       lng: event.latLng.lng()
        //     }
        //     myEventHandler(posit)
        //   })
        // })
        directionsRenderer.setDirections(currentTrip.googleRoutes)
      }
    } 
      // else if (isMapboxReady && mappingService === "mapbox") {
      //   mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_KEY
      //   const map = new mapboxgl.Map({
      //     container: ref.current,
      //     style: "mapbox://styles/mapbox/streets-v11", // stylesheet location
      //     center: options.center,
      //     zoom: options.zoom
      //   })
    
      //     map.on("load", () => {
      //       map.resize()
      //     })
      //   }

  }, [options, isGoogleReady, isMapboxReady, mappingService, selectedTripIsShown, places])

  return (
    <div
      style={{ width: '100%', height: '400px', margin: '1em 0', borderRadius: '0.5em' }}
      {...{ref, className}}
    />

  )
}

// const shouldUpdate = (prevProps, nextProps) => {
//   delete prevProps.options.mapTypeId
//   const [prevFuncs, nextFuncs] = [functions(prevProps), functions(nextProps)]
//   let x = isEqual(omit(prevProps, prevFuncs), omit(nextProps, nextFuncs))
//   let y = prevFuncs.every(fn => prevProps[fn].toString() === nextProps[fn].toString())
//   return (
//     x && y
    
//   )
// }

// export default React.memo(Map, shouldUpdate)
export default Map;

// Map.defaultProps = {
//   options: {
//     center: { lat: 48, lng: 8 },
//     zoom: 5,
//   },
// }