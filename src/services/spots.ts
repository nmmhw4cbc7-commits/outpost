import { supabase } from '../lib/supabase'
import type { Spot, SpotMetadata, FilterState } from '../types'
import type { OSMPlace } from './places'

export async function getSpotsNearby(
  lat: number,
  lng: number,
  radiusMeters: number,
  filters?: FilterState
): Promise<Spot[]> {
  const { data, error } = await supabase.rpc('get_spots_nearby', {
    p_lat: lat,
    p_lng: lng,
    p_radius_meters: radiusMeters,
    p_min_larp_score: filters?.minLarpScore || 0,
    p_min_wifi: filters?.wifiRating || 0,
    p_min_outlets: filters?.outletRating || 0,
    p_min_laptop: filters?.laptopFriendliness || 0,
    p_spot_types: filters?.spotTypes?.length ? filters.spotTypes : null
  })

  if (error) {
    console.error('Error fetching nearby spots:', error)
    return []
  }

  return data || []
}

export async function getSpotById(id: string): Promise<Spot | null> {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching spot:', error)
    return null
  }

  return data
}

export async function getSpotByGooglePlaceId(placeId: string): Promise<Spot | null> {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('google_place_id', placeId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching spot:', error)
    return null
  }

  return data
}

export async function getSpotByOsmId(osmId: number): Promise<Spot | null> {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('osm_id', osmId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching spot:', error)
    return null
  }

  return data
}

export async function createSpot(spotData: {
  google_place_id?: string | null
  osm_id?: number | null
  name: string
  latitude: number
  longitude: number
  address?: string
  city?: string
  country?: string
  place_type?: string
}): Promise<Spot | null> {
  const insertData = {
    ...spotData,
    google_place_id: spotData.google_place_id || null,
    osm_id: spotData.osm_id || null
  }

  const conflictColumn = spotData.osm_id ? 'osm_id' : 'google_place_id'

  const { data, error } = await supabase
    .from('spots')
    .upsert(insertData, { onConflict: conflictColumn })
    .select()
    .single()

  if (error) {
    console.error('Error creating spot:', error)
    return null
  }

  return data
}

export async function ensureSpotFromOSM(place: OSMPlace): Promise<Spot | null> {
  const existing = await getSpotByOsmId(place.id)
  if (existing) return existing

  return createSpot({
    osm_id: place.id,
    name: place.name,
    latitude: place.lat,
    longitude: place.lng,
    address: place.address || '',
    city: '',
    country: '',
    place_type: place.type
  })
}

export async function getSpotMetadata(spotId: string): Promise<SpotMetadata | null> {
  const { data, error } = await supabase
    .from('spot_metadata')
    .select('*')
    .eq('spot_id', spotId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching metadata:', error)
    return null
  }

  return data
}

export async function updateSpotMetadata(
  spotId: string,
  metadata: Partial<SpotMetadata>
): Promise<SpotMetadata | null> {
  const { data, error } = await supabase
    .from('spot_metadata')
    .upsert({ ...metadata, spot_id: spotId }, { onConflict: 'spot_id' })
    .select()
    .single()

  if (error) {
    console.error('Error updating metadata:', error)
    return null
  }

  return data
}
