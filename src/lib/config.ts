export const SPOT_TYPES = [
  'cafe',
  'library',
  'coworking_space',
  'university',
  'hotel'
] as const

export const SEARCH_RADIUS_OPTIONS = [
  { value: 500, label: '500m' },
  { value: 1000, label: '1km' },
  { value: 2000, label: '2km' },
  { value: 5000, label: '5km' },
  { value: 10000, label: '10km' },
  { value: 15000, label: '15km' },
  { value: 25000, label: '25km' }
] as const
