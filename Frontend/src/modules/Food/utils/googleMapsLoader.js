/**
 * Single Google Maps JS loader for the whole app.
 *
 * Google's loader is a singleton: calling it again with *different* options throws
 * "Loader must not be called again with different options", and loading the script twice
 * breaks maps. Every map/autocomplete in the app must load Google Maps through this file
 * so they all share one script tag with identical options.
 */
import { useEffect, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"

// Keep this list a superset of what any screen needs, in a fixed order.
export const GOOGLE_MAPS_LIBRARIES = ["places", "geometry"]

const sanitize = (value) => (value ? String(value).trim().replace(/^['"]|['"]$/g, "") : "")

export function getGoogleMapsApiKeySync() {
  return sanitize(import.meta.env.VITE_GOOGLE_MAPS_API_KEY)
}

let loaderInstance = null
let loadPromise = null

/**
 * Shared Loader instance. The apiKey argument is accepted for call-site compatibility,
 * but the build-time key is always used so options never differ between screens.
 */
export function getGoogleMapsLoader(apiKey) {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: getGoogleMapsApiKeySync() || sanitize(apiKey),
      version: "weekly",
      libraries: GOOGLE_MAPS_LIBRARIES,
      id: "google-maps-script",
    })
    const originalLoad = loaderInstance.load.bind(loaderInstance)
    // Deduplicate concurrent loads and allow a retry after a network failure.
    loaderInstance.load = () => {
      if (!loadPromise) {
        loadPromise = originalLoad().catch((err) => {
          loadPromise = null
          throw err
        })
      }
      return loadPromise
    }
  }
  return loaderInstance
}

/** Load Google Maps (resolves with window.google). */
export function loadGoogleMaps() {
  return getGoogleMapsLoader().load()
}

/**
 * Drop-in replacement for @react-google-maps/api `useJsApiLoader`.
 * Returns { isLoaded, loadError } and uses the shared loader above.
 */
export function useGoogleMapsLoader() {
  const [isLoaded, setIsLoaded] = useState(() => Boolean(typeof window !== "undefined" && window.google?.maps?.Map))
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (isLoaded) return
    let cancelled = false
    if (!getGoogleMapsApiKeySync()) {
      setLoadError(new Error("VITE_GOOGLE_MAPS_API_KEY is not set"))
      return
    }
    loadGoogleMaps()
      .then(() => {
        if (!cancelled) setIsLoaded(true)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err)
      })
    return () => {
      cancelled = true
    }
  }, [isLoaded])

  return { isLoaded, loadError }
}
