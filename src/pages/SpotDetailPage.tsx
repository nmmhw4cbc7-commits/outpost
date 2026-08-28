import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Wifi,
  Volume2,
  Plug,
  Armchair,
  Laptop,
  Heart,
  Share2,
  Navigation,
  MessageSquare,
  Camera
} from 'lucide-react'
import type { Spot, SpotMetadata, Review } from '../types'
import { getSpotById, getSpotMetadata } from '../services/spots'
import { getReviewsBySpot } from '../services/reviews'
import { calculateLarpScore, getLarpScoreLabel, getLarpScoreColor } from '../lib/larpScore'
import { formatDistance, calculateDistance } from '../lib/geo'
import { useAuth } from '../hooks/useAuth'
import { toggleFavorite, isFavorited } from '../services/favorites'
import { performCheckIn } from '../services/checkins'
import { useLocation } from '../hooks/useLocation'
import { ReviewCard } from '../features/reviews/ReviewCard'

export function SpotDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { location } = useLocation()

  const [spot, setSpot] = useState<Spot | null>(null)
  const [metadata, setMetadata] = useState<SpotMetadata | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [favorited, setFavorited] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [checkinResult, setCheckinResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  useEffect(() => {
    if (!id) return

    const loadSpot = async () => {
      setLoading(true)
      const [spotData, metadataData, reviewsData] = await Promise.all([
        getSpotById(id),
        getSpotMetadata(id),
        getReviewsBySpot(id, 1, 5)
      ])

      setSpot(spotData)
      setMetadata(metadataData)
      setReviews(reviewsData.reviews)
      setLoading(false)
    }

    loadSpot()
  }, [id])

  useEffect(() => {
    if (!user || !id) return
    isFavorited(user.id, id).then(setFavorited)
  }, [user, id])

  const larpScore = calculateLarpScore(metadata)
  const distance =
    location && spot
      ? calculateDistance(location, { lat: spot.latitude, lng: spot.longitude })
      : null

  const handleFavorite = async () => {
    if (!user || !id) {
      setCheckinResult({ success: false, message: 'Sign in to save spots' })
      return
    }
    await toggleFavorite(user.id, id)
    setFavorited(!favorited)
  }

  const handleCheckIn = async () => {
    if (!user || !id) {
      setCheckinResult({ success: false, message: 'Sign in to check in' })
      return
    }

    setCheckinLoading(true)
    setCheckinResult(null)

    const result = await performCheckIn(user.id, id)
    setCheckinResult({
      success: result.success,
      message: result.success
        ? `Checked in! +${result.pointsEarned} Larp Points`
        : result.error || 'Check-in failed'
    })

    setCheckinLoading(false)
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/spot/${id}`
    const text = `Found a ${larpScore.score || 'great'} Larp Score spot: ${spot?.name}`

    if (navigator.share) {
      await navigator.share({ title: spot?.name, text, url })
    } else {
      await navigator.clipboard.writeText(url)
      setCheckinResult({ success: true, message: 'Link copied to clipboard!' })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-matcha-200 border-t-matcha-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-beige-50 p-6">
        <button onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft size={24} className="text-matcha-600" />
        </button>
        <div className="text-center py-12">
          <p className="text-matcha-700 font-medium">Spot not found</p>
          <p className="text-sm text-beige-500 mt-1">
            This outpost may have been removed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-beige-200">
        <div className="flex items-center gap-4 p-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-matcha-600" />
          </button>
          <h1 className="font-serif text-lg font-semibold text-matcha-800 truncate flex-1">
            {spot.name}
          </h1>
          <button onClick={handleFavorite}>
            <Heart
              size={22}
              className={favorited ? 'text-red-500 fill-red-500' : 'text-beige-400'}
            />
          </button>
          <button onClick={handleShare}>
            <Share2 size={22} className="text-beige-400" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-matcha-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="text-matcha-600" size={28} />
            </div>
            <div className="flex-1">
              <h2 className="font-serif text-xl font-bold text-matcha-800">
                {spot.name}
              </h2>
              <p className="text-sm text-beige-600 mt-1">{spot.address}</p>
              <div className="flex items-center gap-3 mt-2">
                {distance !== null && (
                  <span className="text-xs text-beige-500 flex items-center gap-1">
                    <Navigation size={12} />
                    {formatDistance(distance)}
                  </span>
                )}
                <span className="text-xs text-beige-500 capitalize">
                  {spot.place_type?.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-center">
            {larpScore.hasEnoughData ? (
              <>
                <p className="text-xs text-beige-500 uppercase tracking-wider mb-1">
                  Larp Score
                </p>
                <p className={`text-5xl font-serif font-bold ${getLarpScoreColor(larpScore.score)}`}>
                  {larpScore.score}
                </p>
                <p className="text-sm text-beige-500 mt-1">
                  {getLarpScoreLabel(larpScore.score)}
                </p>
              </>
            ) : (
              <>
                <p className="text-5xl font-serif font-bold text-beige-300">
                  --
                </p>
                <p className="text-sm text-beige-500 mt-2">
                  Not enough Larp data yet
                </p>
                <p className="text-xs text-beige-400 mt-1">
                  Be the first to document this outpost
                </p>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-serif text-lg font-semibold text-matcha-800 mb-4">
            Larp Ratings
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <RatingItem
              icon={<Wifi size={18} />}
              label="WiFi"
              value={metadata?.wifi_rating}
            />
            <RatingItem
              icon={<Volume2 size={18} />}
              label="Noise"
              value={metadata?.noise_rating}
              inverted
            />
            <RatingItem
              icon={<Plug size={18} />}
              label="Outlets"
              value={metadata?.outlet_rating}
            />
            <RatingItem
              icon={<Armchair size={18} />}
              label="Seating"
              value={metadata?.seat_rating}
            />
            <RatingItem
              icon={<Laptop size={18} />}
              label="Laptop"
              value={metadata?.laptop_friendliness}
            />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-beige-100 flex items-center justify-center text-beige-500">
                <Clock size={18} />
              </div>
              <div>
                <p className="text-xs text-beige-500">Avg Stay</p>
                <p className="font-medium text-matcha-800">
                  {metadata?.recommended_stay_minutes
                    ? `${metadata.recommended_stay_minutes}m`
                    : '--'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {checkinResult && (
          <div
            className={`p-4 rounded-xl ${
              checkinResult.success
                ? 'bg-matcha-100 text-matcha-800'
                : 'bg-gold-100 text-gold-800'
            }`}
          >
            <p className="text-sm font-medium">{checkinResult.message}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleCheckIn}
            disabled={checkinLoading}
            className="flex-1 bg-matcha-600 text-white py-3 rounded-xl font-medium hover:bg-matcha-700 transition-colors disabled:opacity-50"
          >
            {checkinLoading ? 'Checking in...' : 'Check In'}
          </button>
          <Link
            to={`/spot/${id}/review`}
            className="flex items-center justify-center gap-2 bg-beige-100 text-matcha-700 px-6 py-3 rounded-xl font-medium hover:bg-beige-200 transition-colors"
          >
            <MessageSquare size={18} />
            Review
          </Link>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold text-matcha-800">
              Larp Reports
            </h3>
            <span className="text-sm text-beige-500">
              {metadata?.review_count || 0} reviews
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-beige-300 mx-auto mb-3" />
              <p className="text-matcha-700 font-medium">No Larp reports yet</p>
              <p className="text-sm text-beige-500 mt-1">
                Be the first to document this outpost.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
              <Link
                to={`/spot/${id}/reviews`}
                className="block text-center text-sm text-matcha-600 font-medium hover:text-matcha-700"
              >
                View all reviews
              </Link>
            </div>
          )}
        </div>

        <a
          href={`https://www.openstreetmap.org/?mlat=${spot.latitude}&mlon=${spot.longitude}#map=16/${spot.latitude}/${spot.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-3 text-sm text-beige-500 hover:text-matcha-600 transition-colors"
        >
          Open in Maps
        </a>
      </div>
    </div>
  )
}

function RatingItem({
  icon,
  label,
  value,
  inverted = false
}: {
  icon: React.ReactNode
  label: string
  value?: number
  inverted?: boolean
}) {
  const displayValue = value || 0
  const filled = inverted ? 6 - displayValue : displayValue

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-beige-100 flex items-center justify-center text-beige-500">
        {icon}
      </div>
      <div>
        <p className="text-xs text-beige-500">{label}</p>
        <div className="flex gap-0.5 mt-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i <= filled ? 'bg-matcha-500' : 'bg-beige-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
