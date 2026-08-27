import { MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Spot } from '../../types'

interface SpotCardProps {
  spot: Spot
  isSelected: boolean
  onClick: () => void
}

export function SpotCard({ spot, isSelected, onClick }: SpotCardProps) {
  return (
    <Link
      to={`/spot/${spot.id}`}
      onClick={onClick}
      className={`flex-shrink-0 w-64 bg-white rounded-xl shadow-md p-3 transition-all ${
        isSelected
          ? 'ring-2 ring-matcha-500 shadow-lg'
          : 'hover:shadow-lg'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-matcha-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <MapPin className="text-matcha-600" size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-matcha-800 text-sm truncate">
            {spot.name}
          </h3>
          <p className="text-xs text-beige-500 truncate">
            {spot.city || spot.address}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Star size={12} className="text-gold-500 fill-gold-500" />
            <span className="text-xs font-medium text-beige-600">
              {spot.place_type?.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
