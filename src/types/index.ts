export interface Coordinates {
  lat: number
  lng: number
}

export interface Spot {
  id: string
  google_place_id: string
  name: string
  latitude: number
  longitude: number
  address: string
  city: string
  country: string
  place_type: SpotType
  created_at: string
  updated_at: string
}

export type SpotType =
  | 'cafe'
  | 'library'
  | 'coworking_space'
  | 'restaurant'
  | 'university'
  | 'hotel'
  | 'bakery'
  | 'coffee_shop'
  | 'other'

export interface SpotMetadata {
  spot_id: string
  wifi_rating: number
  noise_rating: number
  outlet_rating: number
  seat_rating: number
  laptop_friendliness: number
  recommended_stay_minutes: number
  larp_score: number
  review_count: number
  updated_at: string
}

export interface Review {
  id: string
  spot_id: string
  user_id: string
  text: string
  rating: number
  wifi_rating: number
  noise_rating: number
  outlet_rating: number
  seat_rating: number
  laptop_friendliness: number
  stay_minutes: number
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  created_at: string
  points: number
}

export interface CheckIn {
  id: string
  user_id: string
  spot_id: string
  created_at: string
  points_earned: number
  spots?: Spot
}

export interface Favorite {
  user_id: string
  spot_id: string
  created_at: string
  spots?: Spot
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  requirement: string
  points: number
}

export interface UserBadge {
  user_id: string
  badge_id: string
  earned_at: string
  badges?: Badge
}

export interface PointTransaction {
  id: string
  user_id: string
  type: PointTransactionType
  points: number
  reference_id: string | null
  reference_type: string | null
  created_at: string
}

export type PointTransactionType =
  | 'checkin'
  | 'first_visit'
  | 'new_location'
  | 'review'
  | 'photo'
  | 'helpful_review'
  | 'streak_bonus'

export interface SpotPhoto {
  id: string
  spot_id: string
  user_id: string
  url: string
  caption: string | null
  created_at: string
}

export interface Report {
  id: string
  reporter_id: string
  content_type: 'review' | 'photo' | 'spot'
  content_id: string
  reason: string
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
}

export interface FilterState {
  minLarpScore: number
  wifiRating: number
  noiseRating: number
  outletRating: number
  seatRating: number
  laptopFriendliness: number
  maxDistance: number
  spotTypes: SpotType[]
}

export const DEFAULT_FILTERS: FilterState = {
  minLarpScore: 0,
  wifiRating: 0,
  noiseRating: 0,
  outletRating: 0,
  seatRating: 0,
  laptopFriendliness: 0,
  maxDistance: 5000,
  spotTypes: []
}
