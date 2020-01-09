import { functions, isEqual, omit } from 'lodash'
import React, { useEffect, useRef } from 'react'

function Map({ options, onMount, className }) {
  // debugger
  const ref = useRef()

  useEffect(() => {
    console.log("Here!");
    const onLoad = () => {
      const map = new window.google.maps.Map(ref.current, options)
      if (typeof onMount === 'function') {
        onMount(map)
      }
    }
    if (!window.google) {
      const script = document.createElement('script')

      script.type="text/javascript"
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=" +
        process.env.REACT_APP_GOOGLE_KEY
      const headScript = document.getElementsByTagName('script')[0]
      headScript.parentNode.insertBefore(script, headScript)
      script.addEventListener('load', onLoad)

      return () => script.removeEventListener('load', onLoad)
    } else onLoad()
  }, [onMount, options])

  return (
    <div
      style={{ width: '100%', height: '400px', margin: '1em 0', borderRadius: '0.5em' }}
      {...{ref, className}}
    />

  )
}

const shouldUpdate = (prevProps, nextProps) => {
  if (prevProps !== nextProps) alert("They're not equal!")
  delete prevProps.options.mapTypeId
  const [prevFuncs, nextFuncs] = [functions(prevProps), functions(nextProps)]
  debugger
  return (
    isEqual(omit(prevProps, prevFuncs), omit(nextProps, nextFuncs)) &&
    prevFuncs.every(fn => prevProps[fn].toString() === nextProps[fn].toString())
  )
}

export default React.memo(Map, shouldUpdate)


