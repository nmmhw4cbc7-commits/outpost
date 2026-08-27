import type { Coordinates } from '../lib/geo'

export interface OSMPlace {
  id: number
  name: string
  lat: number
  lng: number
  type: string
  address?: string
  opening_hours?: string
  website?: string
  phone?: string
  tags?: Record<string, string>
}

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

function buildOverpassQuery(center: Coordinates, radiusMeters: number): string {
  return `
[out:json][timeout:20];
(
  node["amenity"~"cafe|coffee|library|restaurant|bar|pub|university|college|school|bakery|community_centre|internet_cafe|food_court"](around:${radiusMeters},${center.lat},${center.lng});
  way["amenity"~"cafe|coffee|library|restaurant|bar|pub|university|college|school|bakery|community_centre|internet_cafe|food_court"](around:${radiusMeters},${center.lat},${center.lng});
  node["tourism"~"hotel|hostel|motel"](around:${radiusMeters},${center.lat},${center.lng});
  way["tourism"~"hotel|hostel|motel"](around:${radiusMeters},${center.lat},${center.lng});
);
out center tags;
`
}

function mapOSMType(tags: Record<string, string>): string {
  const amenity = tags.amenity || ''
  const tourism = tags.tourism || ''

  if (amenity === 'cafe' || amenity === 'coffee') return 'cafe'
  if (amenity === 'library') return 'library'
  if (amenity === 'restaurant' || amenity === 'bar' || amenity === 'pub') return 'restaurant'
  if (amenity === 'university' || amenity === 'college' || amenity === 'school') return 'university'
  if (amenity === 'bakery') return 'bakery'
  if (amenity === 'community_centre' || amenity === 'internet_cafe' || amenity === 'food_court') return 'coworking_space'
  if (tourism === 'hotel' || tourism === 'motel' || tourism === 'hostel') return 'hotel'
  return 'other'
}

function formatAddress(tags: Record<string, string>): string {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'],
    tags['addr:postcode']
  ].filter(Boolean)
  return parts.join(', ') || ''
}

export async function searchNearbyPlaces(
  center: Coordinates,
  radiusMeters: number = 2000
): Promise<OSMPlace[]> {
  const query = buildOverpassQuery(center, radiusMeters)

  try {
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data = await response.json()

    const places: OSMPlace[] = data.elements
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: el.id,
        name: el.tags.name,
        lat: el.lat || el.center?.lat,
        lng: el.lon || el.center?.lon,
        type: mapOSMType(el.tags),
        address: formatAddress(el.tags),
        opening_hours: el.tags.opening_hours,
        website: el.tags.website,
        phone: el.tags.phone,
        tags: el.tags
      }))
      .filter((p: OSMPlace) => p.lat && p.lng)

    return places
  } catch (error) {
    console.error('Failed to fetch places from Overpass:', error)
    return []
  }
}
