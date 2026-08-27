import { MapPin } from 'lucide-react'
import type { OSMPlace } from '../../services/places'

interface PlaceCardProps {
  place: OSMPlace
  isSelected: boolean
  onClick: () => void
}

const TYPE_LABELS: Record<string, string> = {
  cafe: 'Cafe',
  library: 'Library',
  coworking_space: 'Coworking',
  restaurant: 'Restaurant',
  university: 'University',
  hotel: 'Hotel',
  bakery: 'Bakery',
  other: 'Place'
}

const TYPE_EMOJIS: Record<string, string> = {
  cafe: '☕',
  library: '📚',
  coworking_space: '💻',
  restaurant: '🍽️',
  university: '🎓',
  hotel: '🏨',
  bakery: '🥐',
  other: '📍'
}

export function PlaceCard({ place, isSelected, onClick }: PlaceCardProps) {
  return (
    <div
      onClick={onClick}
      className={`flex-shrink-0 w-64 bg-white rounded-xl shadow-md p-3 transition-all cursor-pointer ${
        isSelected
          ? 'ring-2 ring-matcha-500 shadow-lg'
          : 'hover:shadow-lg'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-matcha-100 rounded-lg flex items-center justify-center flex-shrink-0 text-xl">
          {TYPE_EMOJIS[place.type] || '📍'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-matcha-800 text-sm truncate">
            {place.name}
          </h3>
          <p className="text-xs text-beige-500 truncate">
            {TYPE_LABELS[place.type] || place.type}
          </p>
          {place.address && (
            <p className="text-xs text-beige-400 truncate mt-0.5">
              {place.address}
            </p>
          )}
          {place.opening_hours && (
            <p className="text-xs text-beige-400 truncate mt-0.5">
              ⏰ {place.opening_hours}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
