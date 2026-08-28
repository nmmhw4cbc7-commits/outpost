import { useState } from 'react'
import {
  Loader2,
  Coffee,
  BookOpen,
  Laptop,
  GraduationCap,
  Building2,
  MapPin,
  Clock
} from 'lucide-react'
import type { OSMPlace } from '../../services/places'

interface PlaceCardProps {
  place: OSMPlace
  isSelected: boolean
  onClick: () => void
  onNavigate?: (place: OSMPlace) => void
}

const TYPE_LABELS: Record<string, string> = {
  cafe: 'Cafe',
  library: 'Library',
  coworking_space: 'Coworking',
  university: 'University',
  hotel: 'Hotel',
  other: 'Place'
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  cafe: <Coffee size={18} className="text-matcha-600" />,
  library: <BookOpen size={18} className="text-matcha-600" />,
  coworking_space: <Laptop size={18} className="text-matcha-600" />,
  university: <GraduationCap size={18} className="text-matcha-600" />,
  hotel: <Building2 size={18} className="text-matcha-600" />,
  other: <MapPin size={18} className="text-matcha-600" />
}

export function PlaceCard({ place, isSelected, onClick, onNavigate }: PlaceCardProps) {
  const [navigating, setNavigating] = useState(false)

  const handleClick = () => {
    if (onNavigate) {
      setNavigating(true)
      onNavigate(place)
    } else {
      onClick()
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`flex-shrink-0 w-64 bg-white rounded-xl shadow-md p-3 transition-all cursor-pointer ${
        isSelected
          ? 'ring-2 ring-matcha-500 shadow-lg'
          : 'hover:shadow-lg'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-matcha-100 rounded-lg flex items-center justify-center flex-shrink-0">
          {navigating ? <Loader2 className="animate-spin text-matcha-600" size={20} /> : TYPE_ICONS[place.type] || TYPE_ICONS.other}
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
            <p className="text-xs text-beige-400 truncate mt-0.5 flex items-center gap-1">
              <Clock size={10} /> {place.opening_hours}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
