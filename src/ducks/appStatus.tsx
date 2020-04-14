// appStatus.js
const GOOGLE = "google"
// const MAPBOX = "mapbox"

// App Status Actions
export const APP_IS_LOADED = 'mapping/app/appIsLoaded'
export const APP_IS_THINKING = 'mapping/app/appIsThinking'
export const APP_IS_NOT_THINKING = 'mapping/app/appIsNotThinking'
export const APP_MAPPING_SVC_AVAIL = 'mapping/app/mappingSvcAvailable'
export const APP_SELECTED_MAPPING_SERVICE_CHANGED = 'mapping/app/selectedMappingServiceChanged'


// Initial State
const initialState = {
    appThinking: false,
    appLoaded: false,
    mappingServicesAvailable: {
        google: false,
        mapbox: false
    },
    appMappingService: GOOGLE
}

// Action Creators
export function appIsThinking() {
    return { type: APP_IS_THINKING }
}
  
export function appIsNotThinking() {
    return { type: APP_IS_NOT_THINKING }
}

export const appIsLoaded = () => {
    return { type: APP_IS_LOADED }
}

export const mappingServiceIsAvailable = (mappingService) => {
    return { type: APP_MAPPING_SVC_AVAIL, mappingService }
}

export const mappingServiceSelected = (newMappingService) => {
    return {type: APP_SELECTED_MAPPING_SERVICE_CHANGED, newMappingService}
}

// Thunks

export const loadAppForUse = () => dispatch => {
    
}

export const mappingServiceRequested = (newMappingService) => (dispatch, getState) => {
    let currentMappingService = getState().appStatus.appMappingService
    debugger
    if (newMappingService !== currentMappingService) {
        dispatch(mappingServiceSelected(newMappingService))
    }
}

export const mappingServiceSetupRequested = (mappingService) => (dispatch, getState) => {
    let mappingServicesStatus = getState().appStatus.mappingServicesAvailable
    if (!mappingServicesStatus[mappingService]) {
        if (mappingService === GOOGLE) {
            dispatch(googleMappingRequested())
        } else debugger
    } 
}

export const googleMappingRequested = () => (dispatch) => {
    const onLoad = () => {
        dispatch(mappingServiceIsAvailable(GOOGLE))
    }

    if (!window.google)  {
        const script = document.createElement('script')
        script.type="text/javascript"
        script.src =
          "https://maps.googleapis.com/maps/api/js?key=" +
          process.env.REACT_APP_GOOGLE_KEY + "&libraries=places"
        const headScript = document.getElementsByTagName('script')[0]
        headScript.parentNode.insertBefore(script, headScript)
        script.addEventListener('load', onLoad)
        dispatch(appIsLoaded())
        debugger
        return () => script.removeEventListener('load', onLoad)
    } else {
        debugger // We shouldn't be here!
    }
}

export const mapboxMappingRequested = () => (dispatch) => {
    alert("Setting up Mapbox")
}

// Reducer
const reducer = (state = initialState, action) => {
    switch (action.type) {
        case APP_IS_THINKING:
            return {
                ...state,
                appThinking: true
            }
        case APP_IS_NOT_THINKING:
            return {
                ...state,
                appThinking: false
            }
        case APP_IS_LOADED:
            return {
                ...state,
                appLoaded: true
            }
        case APP_MAPPING_SVC_AVAIL:
            return {
                ...state,
                mappingServicesAvailable: {
                    ...state.mappingServicesAvailable,
                    [action.mappingService]: true
                }
            }
        case APP_SELECTED_MAPPING_SERVICE_CHANGED:
            return {
                ...state,
                appMappingService: action.newMappingService
            }
        default:
            return state
    }
}

export default reducer