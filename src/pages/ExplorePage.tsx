import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, ChevronDown, Loader2 } from 'lucide-react'
import { SEARCH_RADIUS_OPTIONS } from '../lib/config'
import type { Coordinates } from '../lib/geo'
import type { OSMPlace } from '../services/places'
import { searchNearbyPlaces } from '../services/places'
import { ensureSpotFromOSM } from '../services/spots'
import { MapView } from '../features/map/MapView'
import { PlaceCard } from '../features/spots/PlaceCard'

interface ExplorePageProps {
  location: Coordinates | null
  locationLoading: boolean
}

export function ExplorePage({ location, locationLoading }: ExplorePageProps) {
  const navigate = useNavigate()
  const [places, setPlaces] = useState<OSMPlace[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null)
  const [radius, setRadius] = useState(2000)

  const loadPlaces = useCallback(async () => {
    if (!location) return

    setLoading(true)
    try {
      const nearbyPlaces = await searchNearbyPlaces(location, radius)
      setPlaces(nearbyPlaces)
    } catch (error) {
      console.error('Failed to load places:', error)
    } finally {
      setLoading(false)
    }
  }, [location, radius])

  useEffect(() => {
    loadPlaces()
  }, [loadPlaces])

  const filteredPlaces = places.filter((place) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      place.name.toLowerCase().includes(query) ||
      place.type.toLowerCase().includes(query) ||
      place.address?.toLowerCase().includes(query)
    )
  })

  const selectedPlace = selectedPlaceId
    ? places.find((p) => p.id === selectedPlaceId)
    : null

  const handlePlaceNavigate = async (place: OSMPlace) => {
    const spot = await ensureSpotFromOSM(place)
    if (spot) {
      navigate(`/spot/${spot.id}`)
    }
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="p-4 bg-white/95 backdrop-blur-sm border-b border-beige-200 z-40 relative">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-beige-400" size={18} />
            <input
              type="text"
              placeholder="Search Larp Spots..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-beige-100 rounded-lg text-sm placeholder:text-beige-400 focus:outline-none focus:ring-2 focus:ring-matcha-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-beige-500">
            <MapPin size={14} />
            <span>{location ? `${places.length} spots nearby` : 'No location'}</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => {
              const values = SEARCH_RADIUS_OPTIONS.map(o => o.value) as number[]
              const idx = values.indexOf(radius)
              setRadius(values[(idx + 1) % values.length] as typeof radius)
            }}
            className="flex items-center gap-1 text-xs font-medium text-matcha-600 hover:text-matcha-700"
          >
            <span>{radius < 1000 ? `${radius}m` : `${radius / 1000}km`}</span>
            <ChevronDown size={14} />
          </button>
          {loading && (
            <Loader2 size={14} className="text-matcha-500 animate-spin" />
          )}
        </div>
      </div>

      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <MapView
            center={location || { lat: 52.52, lng: 13.405 }}
            places={filteredPlaces}
            selectedPlaceId={selectedPlaceId}
            onPlaceSelect={setSelectedPlaceId}
            onPlaceNavigate={handlePlaceNavigate}
            loading={locationLoading}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          {selectedPlace && (
            <div className="pointer-events-auto">
              <PlaceCard
                place={selectedPlace}
                isSelected={true}
                onClick={() => {}}
                onNavigate={handlePlaceNavigate}
              />
            </div>
          )}

          {!selectedPlace && filteredPlaces.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide pointer-events-auto">
              {filteredPlaces.slice(0, 6).map((place) => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  isSelected={false}
                  onClick={() => setSelectedPlaceId(place.id)}
                  onNavigate={handlePlaceNavigate}
                />
              ))}
            </div>
          )}

          {!loading && location && filteredPlaces.length === 0 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 text-center pointer-events-auto">
              <p className="text-matcha-700 font-medium">No Larp Spots nearby</p>
              <p className="text-sm text-beige-500 mt-1">
                Try expanding your search radius.
              </p>
            </div>
          )}

          {loading && !selectedPlace && (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 flex items-center justify-center gap-3 pointer-events-auto">
              <div className="w-5 h-5 border-2 border-matcha-200 border-t-matcha-600 rounded-full animate-spin" />
              <span className="text-sm text-matcha-600">Finding Larp Spots...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
