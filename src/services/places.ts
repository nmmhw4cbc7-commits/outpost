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

function buildOverpassQuery(center: Coordinates, radiusMeters: number): string {
  return `
[out:json][timeout:25];
(
  nwr["amenity"~"cafe|coffee"](around:${radiusMeters},${center.lat},${center.lng});
  nwr["amenity"="library"](around:${radiusMeters},${center.lat},${center.lng});
  nwr["amenity"~"restaurant|bar|pub"](around:${radiusMeters},${center.lat},${center.lng});
  nwr["amenity"~"university|college|school"](around:${radiusMeters},${center.lat},${center.lng});
  nwr["amenity"="bakery"](around:${radiusMeters},${center.lat},${center.lng});
  nwr["tourism"~"hotel|hostel|motel"](around:${radiusMeters},${center.lat},${center.lng});
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

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
]

export async function searchNearbyPlaces(
  center: Coordinates,
  radiusMeters: number = 3000
): Promise<OSMPlace[]> {
  const query = buildOverpassQuery(center, radiusMeters)

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      console.log(`[Outpost] Querying Overpass: ${endpoint}`)
      console.log(`[Outpost] Center: ${center.lat}, ${center.lng}, Radius: ${radiusMeters}m`)

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

      const response = await fetch(endpoint, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        signal: controller.signal
      })

      clearTimeout(timeout)

      if (!response.ok) {
        console.warn(`[Outpost] Overpass ${endpoint} returned ${response.status}`)
        continue
      }

      const data = await response.json()
      console.log(`[Outpost] Got ${data.elements?.length || 0} elements`)

      const places: OSMPlace[] = (data.elements || [])
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

      console.log(`[Outpost] Mapped ${places.length} places`)
      return places
    } catch (error: any) {
      console.warn(`[Outpost] Overpass ${endpoint} failed:`, error.message)
      continue
    }
  }

  console.error('[Outpost] All Overpass endpoints failed')
  return []
}
