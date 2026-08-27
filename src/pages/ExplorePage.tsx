import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, SlidersHorizontal, MapPin, ChevronDown } from 'lucide-react'
import type { Coordinates } from '../lib/geo'
import type { Spot, FilterState } from '../types'
import { DEFAULT_FILTERS } from '../types'
import { getSpotsNearby } from '../services/spots'
import { MapView } from '../features/map/MapView'
import { SpotCard } from '../features/spots/SpotCard'
import { FilterPanel } from '../features/map/FilterPanel'

interface ExplorePageProps {
  location: Coordinates | null
  locationLoading: boolean
}

export function ExplorePage({ location, locationLoading }: ExplorePageProps) {
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null)
  const [radius, setRadius] = useState(2000)
  const mapRef = useRef<HTMLDivElement>(null)

  const loadSpots = useCallback(async () => {
    if (!location) return

    setLoading(true)
    try {
      const nearbySpots = await getSpotsNearby(
        location.lat,
        location.lng,
        radius,
        filters
      )
      setSpots(nearbySpots)
    } catch (error) {
      console.error('Failed to load spots:', error)
    } finally {
      setLoading(false)
    }
  }, [location, radius, filters])

  useEffect(() => {
    loadSpots()
  }, [loadSpots])

  const filteredSpots = spots.filter((spot) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      spot.name.toLowerCase().includes(query) ||
      spot.city?.toLowerCase().includes(query) ||
      spot.address?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="h-screen flex flex-col">
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-lg transition-colors ${
              showFilters
                ? 'bg-matcha-600 text-white'
                : 'bg-beige-100 text-matcha-600 hover:bg-beige-200'
            }`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-beige-500">
            <MapPin size={14} />
            <span>{location ? 'Location active' : 'No location'}</span>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => {
              const options = [500, 1000, 2000, 5000]
              const idx = options.indexOf(radius)
              setRadius(options[(idx + 1) % options.length])
            }}
            className="flex items-center gap-1 text-xs font-medium text-matcha-600 hover:text-matcha-700"
          >
            <span>{radius < 1000 ? `${radius}m` : `${radius / 1000}km`}</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      <div className="flex-1 relative">
        <div ref={mapRef} className="absolute inset-0">
          <MapView
            center={location || { lat: 52.52, lng: 13.405 }}
            spots={filteredSpots}
            selectedSpotId={selectedSpotId}
            onSpotSelect={setSelectedSpotId}
            loading={locationLoading}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
          {filteredSpots.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide pointer-events-auto">
              {filteredSpots.map((spot) => (
                <SpotCard
                  key={spot.id}
                  spot={spot}
                  isSelected={spot.id === selectedSpotId}
                  onClick={() => setSelectedSpotId(spot.id)}
                />
              ))}
            </div>
          )}

          {!loading && location && filteredSpots.length === 0 && (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 text-center pointer-events-auto">
              <p className="text-matcha-700 font-medium">No Larp Spots nearby</p>
              <p className="text-sm text-beige-500 mt-1">
                Try expanding your search radius or adjusting filters.
              </p>
            </div>
          )}

          {loading && (
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
