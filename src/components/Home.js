import React, {useState} from 'react';
import Map from './Map';
import Button from './Button';

// import { getMyLocation } from '../assets/geolocation'

const Home = () => {

    const myText = "This is some text"

    // Accepts an array of locations and links, and the map, and places
    // them on the map with a link to open additional information.
    const addMarkers = links => map => {
        console.log("Running addMarkers ", links)
        links.forEach((link, index) => {
          console.log(link, index)
          const marker = new window.google.maps.Marker({
            map,
            position: link.coords,
            label: `${index + 1}`,
            title: link.title,
          })
          marker.addListener(`click`, () => {
            window.location.href = link.url
          })
        })
      }

    let links = [{
        coords: { lat: 37.233333, lng: -115.808333}, // required: latitude & longitude
        // at which to display the marker
        title: `Life, the Universe and Area 51`, // optional
        url: `https://wikipedia.org/wiki/Area_51`, // optional
      },
      {
        coords: { lat: 39.829840, lng: -98.579471},
        title: "Center of US",
        url: "https://en.wikipedia.org/wiki/Geographic_center_of_the_contiguous_United_States"
      }
    ]

    const [onMount, setOnMount] = useState({onMount: addMarkers(links)})

    const mapProps = {
        options: {
            center: {
                lat: 39.833333, 
                lng: -98.583333
            },
            zoom: 4,
            disableDefaultUI: true
        }
    }

    const addDeming = () => {
        const newLink = {
            coords: { lat: 32.2686111, lng: -107.7580556},
            title: "Deming, NM"
        }
        links.push(newLink)
        setOnMount({onMount: addMarkers(links)})
        console.log("Links now: ", links)
    }

    // getMyLocation().then( myPosit => {
    //     let newLink = {
    //         coords: myPosit,
    //         title: "My Location",
    //     };
    //     links.push(newLink);
    //     setOnMount({onMount: addMarkers(links)})
    //     console.log("Links now: ",links);
    //   })

    // const MemoMap = useCallback(<Map {...mapProps} {...onMount}/>, [])
    
    return (
        <div>
            <span>
                <h1>Google Maps</h1>
                <Button onClick={() => addDeming()}
                    >Add Deming, NM</Button>
            </span>

            <Map {...mapProps} {...onMount}/>
            <p>{myText}</p>

        </div>
    )
}

export default Home;
