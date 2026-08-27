import { useState, useEffect } from 'react'
import { Heart, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getFavorites, removeFavorite } from '../services/favorites'
import type { Favorite } from '../types'

export function SavedPage() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    getFavorites(user.id).then((data) => {
      setFavorites(data)
      setLoading(false)
    })
  }, [user])

  const handleRemove = async (spotId: string) => {
    if (!user) return
    await removeFavorite(user.id, spotId)
    setFavorites(favorites.filter((f) => f.spot_id !== spotId))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-matcha-200 border-t-matcha-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="p-4">
        <h1 className="font-serif text-2xl font-bold text-matcha-800 mb-1">
          My Larp Spots
        </h1>
        <p className="text-sm text-beige-500">
          {favorites.length} saved {favorites.length === 1 ? 'spot' : 'spots'}
        </p>
      </div>

      <div className="px-4">
        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Heart className="w-16 h-16 text-beige-200 mx-auto mb-4" />
            <h3 className="font-serif text-lg font-semibold text-matcha-800 mb-2">
              No saved spots yet
            </h3>
            <p className="text-sm text-beige-500">
              Tap the heart icon on any spot to save it here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {favorites.map((favorite) => (
              <div
                key={favorite.spot_id}
                className="bg-white rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <Link to={`/spot/${favorite.spot_id}`}>
                    <div className="w-14 h-14 bg-matcha-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-matcha-600" size={24} />
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/spot/${favorite.spot_id}`}>
                      <h3 className="font-medium text-matcha-800 truncate">
                        {favorite.spots?.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-beige-500 truncate">
                      {favorite.spots?.address || favorite.spots?.city}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-beige-400 capitalize">
                        {favorite.spots?.place_type?.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(favorite.spot_id)}
                    className="p-2 text-beige-400 hover:text-red-500 transition-colors"
                  >
                    <Heart size={18} className="fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
