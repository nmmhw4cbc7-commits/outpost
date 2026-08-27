import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Send } from 'lucide-react'
import type { Spot } from '../types'
import { getSpotById } from '../services/spots'
import { createReview } from '../services/reviews'
import { useAuth } from '../hooks/useAuth'

export function WriteReviewPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [spot, setSpot] = useState<Spot | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [rating, setRating] = useState(0)
  const [text, setText] = useState('')
  const [wifiRating, setWifiRating] = useState(3)
  const [noiseRating, setNoiseRating] = useState(3)
  const [outletRating, setOutletRating] = useState(3)
  const [seatRating, setSeatRating] = useState(3)
  const [laptopFriendliness, setLaptopFriendliness] = useState(3)
  const [stayMinutes, setStayMinutes] = useState(60)

  useEffect(() => {
    if (!id) return
    getSpotById(id).then((spot) => {
      setSpot(spot)
      setLoading(false)
    })
  }, [id])

  const handleSubmit = async () => {
    if (!user || !id || rating === 0) return

    setSubmitting(true)
    const review = await createReview({
      spot_id: id,
      user_id: user.id,
      text,
      rating,
      wifi_rating: wifiRating,
      noise_rating: noiseRating,
      outlet_rating: outletRating,
      seat_rating: seatRating,
      laptop_friendliness: laptopFriendliness,
      stay_minutes: stayMinutes
    })

    if (review) {
      navigate(`/spot/${id}`)
    }
    setSubmitting(false)
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
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-beige-200">
        <div className="flex items-center gap-4 p-4">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={24} className="text-matcha-600" />
          </button>
          <h1 className="font-serif text-lg font-semibold text-matcha-800">
            Write Larp Report
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {spot && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-sm text-beige-500">Reviewing</p>
            <p className="font-medium text-matcha-800">{spot.name}</p>
          </div>
        )}

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm font-medium text-matcha-800 block mb-3">
            Overall Rating
          </label>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                onClick={() => setRating(i)}
                className="p-1"
              >
                <Star
                  size={36}
                  className={
                    i <= rating
                      ? 'text-gold-500 fill-gold-500'
                      : 'text-beige-200 hover:text-gold-300'
                  }
                />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm font-medium text-matcha-800 block mb-3">
            Your Experience
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="How was your Larp session here? WiFi stability, noise levels, seating comfort..."
            className="w-full h-32 p-3 bg-beige-50 rounded-lg text-sm placeholder:text-beige-400 focus:outline-none focus:ring-2 focus:ring-matcha-500 resize-none"
          />
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-medium text-matcha-800">Larp Ratings</h3>
          <RatingSlider
            label="WiFi Quality"
            value={wifiRating}
            onChange={setWifiRating}
          />
          <RatingSlider
            label="Noise Level"
            value={noiseRating}
            onChange={setNoiseRating}
            inverted
          />
          <RatingSlider
            label="Available Outlets"
            value={outletRating}
            onChange={setOutletRating}
          />
          <RatingSlider
            label="Seating Comfort"
            value={seatRating}
            onChange={setSeatRating}
          />
          <RatingSlider
            label="Laptop Friendliness"
            value={laptopFriendliness}
            onChange={setLaptopFriendliness}
          />
          <div>
            <label className="text-sm text-beige-600 block mb-2">
              Stay Duration: {stayMinutes} min
            </label>
            <input
              type="range"
              min="15"
              max="480"
              step="15"
              value={stayMinutes}
              onChange={(e) => setStayMinutes(Number(e.target.value))}
              className="w-full accent-matcha-600"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={rating === 0 || submitting}
          className="w-full bg-matcha-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-matcha-700 transition-colors disabled:opacity-50"
        >
          <Send size={18} />
          {submitting ? 'Submitting...' : 'Submit Report'}
        </button>
      </div>
    </div>
  )
}

function RatingSlider({
  label,
  value,
  onChange,
  inverted = false
}: {
  label: string
  value: number
  onChange: (value: number) => void
  inverted?: boolean
}) {
  const displayValue = inverted ? 6 - value : value
  const color =
    displayValue >= 4
      ? 'text-matcha-600'
      : displayValue >= 3
      ? 'text-gold-600'
      : 'text-beige-500'

  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm text-beige-600">{label}</label>
        <span className={`text-sm font-medium ${color}`}>{value}/5</span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-matcha-600"
      />
    </div>
  )
}
