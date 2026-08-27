import type { SpotMetadata } from '../types'

export const LARP_SCORE_WEIGHTS = {
  wifi: 0.25,
  noise: 0.20,
  outlets: 0.15,
  laptop: 0.20,
  seat: 0.10,
  community: 0.10
}

export interface LarpScoreResult {
  score: number | null
  hasEnoughData: boolean
  breakdown: {
    wifi: number
    noise: number
    outlets: number
    laptop: number
    seat: number
    community: number
  }
}

export function calculateLarpScore(metadata: SpotMetadata | null): LarpScoreResult {
  if (!metadata || metadata.review_count < 3) {
    return {
      score: null,
      hasEnoughData: false,
      breakdown: {
        wifi: 0,
        noise: 0,
        outlets: 0,
        laptop: 0,
        seat: 0,
        community: 0
      }
    }
  }

  const breakdown = {
    wifi: (metadata.wifi_rating / 5) * 100,
    noise: ((6 - metadata.noise_rating) / 5) * 100,
    outlets: (metadata.outlet_rating / 5) * 100,
    laptop: (metadata.laptop_friendliness / 5) * 100,
    seat: (metadata.seat_rating / 5) * 100,
    community: Math.min(metadata.review_count / 20, 1) * 100
  }

  const score = Math.round(
    breakdown.wifi * LARP_SCORE_WEIGHTS.wifi +
    breakdown.noise * LARP_SCORE_WEIGHTS.noise +
    breakdown.outlets * LARP_SCORE_WEIGHTS.outlets +
    breakdown.laptop * LARP_SCORE_WEIGHTS.laptop +
    breakdown.seat * LARP_SCORE_WEIGHTS.seat +
    breakdown.community * LARP_SCORE_WEIGHTS.community
  )

  return {
    score: Math.min(100, Math.max(0, score)),
    hasEnoughData: true,
    breakdown
  }
}

export function getLarpScoreLabel(score: number | null): string {
  if (score === null) return 'No data'
  if (score >= 90) return 'Excellent'
  if (score >= 80) return 'Great'
  if (score >= 70) return 'Good'
  if (score >= 60) return 'Okay'
  return 'Poor'
}

export function getLarpScoreColor(score: number | null): string {
  if (score === null) return 'text-beige-500'
  if (score >= 90) return 'text-matcha-600'
  if (score >= 80) return 'text-matcha-500'
  if (score >= 70) return 'text-gold-600'
  if (score >= 60) return 'text-gold-500'
  return 'text-beige-600'
}

export const POINT_VALUES = {
  checkin: 25,
  first_visit: 50,
  new_location: 100,
  review: 20,
  photo: 10,
  helpful_review: 5,
  streak_bonus: 15
} as const

export const CHECKIN_COOLDOWN_SECONDS = 300
export const CHECKIN_RADIUS_METERS = 150
export const SAME_SPOT_COOLDOWN_SECONDS = 3600
