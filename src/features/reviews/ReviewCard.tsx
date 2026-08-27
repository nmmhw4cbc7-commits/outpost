import { Star, ThumbsUp } from 'lucide-react'
import type { Review } from '../../types'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="border-b border-beige-100 last:border-0 pb-4 last:pb-0">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-matcha-100 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-matcha-600">
            {review.profiles?.username?.charAt(0).toUpperCase() || '?'}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-matcha-800">
              {review.profiles?.username || 'Anonymous'}
            </span>
            <span className="text-xs text-beige-400">
              {formatDate(review.created_at)}
            </span>
          </div>

          <div className="flex gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                size={14}
                className={
                  i <= review.rating
                    ? 'text-gold-500 fill-gold-500'
                    : 'text-beige-200'
                }
              />
            ))}
          </div>

          {review.text && (
            <p className="text-sm text-matcha-700 mt-2 leading-relaxed">
              {review.text}
            </p>
          )}

          <div className="flex items-center gap-3 mt-3">
            <RatingPill label="WiFi" value={review.wifi_rating} />
            <RatingPill label="Noise" value={review.noise_rating} inverted />
            <RatingPill label="Outlets" value={review.outlet_rating} />
          </div>

          <div className="flex items-center gap-4 mt-3">
            <button className="flex items-center gap-1 text-xs text-beige-500 hover:text-matcha-600 transition-colors">
              <ThumbsUp size={14} />
              <span>Helpful</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function RatingPill({
  label,
  value,
  inverted = false
}: {
  label: string
  value: number
  inverted?: boolean
}) {
  const displayValue = inverted ? 6 - value : value
  const color =
    displayValue >= 4
      ? 'bg-matcha-100 text-matcha-700'
      : displayValue >= 3
      ? 'bg-gold-100 text-gold-700'
      : 'bg-beige-100 text-beige-600'

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>
      {label}: {value}/5
    </span>
  )
}
