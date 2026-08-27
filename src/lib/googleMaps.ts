export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

export const isGoogleMapsConfigured = Boolean(GOOGLE_MAPS_API_KEY)

export const DEFAULT_MAP_CENTER = {
  lat: 52.520008,
  lng: 13.404954
}

export const DEFAULT_ZOOM = 13

export const SPOT_TYPES = [
  'cafe',
  'library',
  'coworking_space',
  'restaurant',
  'university',
  'hotel',
  'bakery',
  'coffee_shop'
] as const

export const SEARCH_RADIUS_OPTIONS = [
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
  { value: 5000, label: '5km' },
  { value: 10000, label: '10km' }
] as const
