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
  image_url?: string
  tags?: Record<string, string>
}

function mapOSMType(tags: Record<string, string>): string {
  const amenity = tags.amenity || ''
  const tourism = tags.tourism || ''
  const office = tags.office || ''

  if (amenity === 'cafe' || amenity === 'coffee') return 'cafe'
  if (amenity === 'library') return 'library'
  if (amenity === 'university' || amenity === 'college' || amenity === 'school') return 'university'
  if (tourism === 'hotel' || tourism === 'motel' || tourism === 'hostel') return 'hotel'
  if (office === 'coworking' || tags['office'] === 'coworking_space') return 'coworking_space'
  if (amenity === 'coworking_space' || tags['amenity'] === 'coworking_space') return 'coworking_space'
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

function calculateDistance(a: Coordinates, b: Coordinates): number {
  const R = 6371000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function getImageUrl(tags: Record<string, string>, lat: number, lng: number): string {
  if (tags.image) return tags.image
  if (tags['wikimedia_commons']) {
    const file = tags['wikimedia_commons'].replace('File:', '')
    return `https://upload.wikimedia.org/wikipedia/commons/thumb/${file}/400px-${file}`
  }
  return `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=400&height=300&center=lonlat:${lng},${lat}&zoom=16&apiKey=demo`
}

const OVERPASS_QUERIES = [
  (c: Coordinates, r: number) => `
[out:json][timeout:25];
(
  node["amenity"~"cafe|coffee|library"](around:${r},${c.lat},${c.lng});
  way["amenity"~"cafe|coffee|library"](around:${r},${c.lat},${c.lng});
  node["amenity"~"university|college"](around:${r},${c.lat},${c.lng});
  way["amenity"~"university|college"](around:${r},${c.lat},${c.lng});
  node["tourism"~"hotel|hostel|motel"](around:${r},${c.lat},${c.lng});
  way["tourism"~"hotel|hostel|motel"](around:${r},${c.lat},${c.lng});
  node["amenity"="coworking_space"](around:${r},${c.lat},${c.lng});
  way["amenity"="coworking_space"](around:${r},${c.lat},${c.lng});
);
out body;
`,
  (c: Coordinates, r: number) => `
[out:json][timeout:25];
node["amenity"~"cafe|coffee|library|university|college"](around:${r},${c.lat},${c.lng});
out body;
`,
  (c: Coordinates, r: number) => `
[out:json][timeout:25];
node["amenity"="cafe"](around:${r},${c.lat},${c.lng});
out body;
`
]

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
]

async function tryOverpassQuery(query: string, endpoint: string, signal?: AbortSignal): Promise<any[]> {
  const formData = new URLSearchParams()
  formData.append('data', query)

  const response = await fetch(endpoint, {
    method: 'POST',
    body: formData,
    signal
  })

  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const data = await response.json()
  return data.elements || []
}

export async function searchNearbyPlaces(
  center: Coordinates,
  radiusMeters: number = 3000
): Promise<OSMPlace[]> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000)

  try {
    for (const queryFn of OVERPASS_QUERIES) {
      const query = queryFn(center, radiusMeters)

      for (const endpoint of OVERPASS_ENDPOINTS) {
        try {
          const elements = await tryOverpassQuery(query, endpoint, controller.signal)

          if (elements.length === 0) continue

          const places: OSMPlace[] = elements
            .filter((el: any) => el.tags?.name)
            .map((el: any) => ({
              id: el.id,
              name: el.tags.name,
              lat: el.lat,
              lng: el.lon,
              type: mapOSMType(el.tags),
              address: formatAddress(el.tags),
              opening_hours: el.tags.opening_hours,
              website: el.tags.website,
              phone: el.tags.phone,
              image_url: getImageUrl(el.tags, el.lat, el.lon),
              tags: el.tags
            }))
            .filter((p: OSMPlace) => p.lat && p.lng)
            .filter((p: OSMPlace) => calculateDistance(center, p) <= radiusMeters)
            .sort((a, b) => calculateDistance(center, a) - calculateDistance(center, b))

          if (places.length > 0) {
            clearTimeout(timeout)
            return places
          }
        } catch {
          continue
        }
      }
    }

    clearTimeout(timeout)
    return []
  } catch {
    clearTimeout(timeout)
    return []
  }
}
