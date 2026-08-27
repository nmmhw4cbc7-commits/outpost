import { useState, useEffect } from 'react'
import type { Coordinates } from '../lib/geo'
import { getCurrentPosition } from '../lib/geo'

export type LocationStatus = 'loading' | 'granted' | 'denied' | 'error' | 'unavailable'

export function useLocation() {
  const [location, setLocation] = useState<Coordinates | null>(null)
  const [status, setStatus] = useState<LocationStatus>('loading')
  const [error, setError] = useState<string | null>(null)

  const requestLocation = async () => {
    setStatus('loading')
    setError(null)

    try {
      if (!navigator.geolocation) {
        setStatus('unavailable')
        setError('Geolocation is not supported by this browser')
        return
      }

      const pos = await getCurrentPosition()
      setLocation(pos)
      setStatus('granted')
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setStatus('denied')
            setError('Location access denied. Please enable location in your browser settings.')
            break
          case err.POSITION_UNAVAILABLE:
            setStatus('unavailable')
            setError('Location information unavailable.')
            break
          case err.TIMEOUT:
            setStatus('error')
            setError('Location request timed out.')
            break
          default:
            setStatus('error')
            setError('An unknown error occurred.')
        }
      } else {
        setStatus('error')
        setError('Failed to get location.')
      }
    }
  }

  useEffect(() => {
    requestLocation()
  }, [])

  return { location, status, error, requestLocation }
}
