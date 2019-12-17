import React, { useEffect, useRef } from 'react'

export default function Map({ options, onMount, className }) {
  const ref = useRef()

  useEffect(() => {

    const onLoad = () => {
      const map = new window.google.maps.Map(ref.current, options)

      if (typeof onMount === 'function') {
        // debugger
        onMount(map)
        // addMarkers(links)(map);
      }
    }
    if (!window.google) {
      const script = document.createElement('script')
      // debugger
      script.type="text/javascript"
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=" +
        process.env.REACT_APP_GOOGLE_KEY
      const headScript = document.getElementsByTagName('script')[0]
      headScript.parentNode.insertBefore(script, headScript)
      script.addEventListener('load', onLoad)
      // debugger
      return () => script.removeEventListener('load', onLoad)
    } else onLoad()
  }, [onMount, options])

  return (
    <div
      style={{ width: '100%', height: '400px', margin: '1em 0', borderRadius: '0.5em' }}
      {...{ref}}
    />

  )
}
