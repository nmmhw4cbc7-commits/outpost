import { supabase } from '../lib/supabase'
import type { Spot, SpotMetadata, FilterState } from '../types'

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

export async function createSpot(spotData: Omit<Spot, 'id' | 'created_at' | 'updated_at'>): Promise<Spot | null> {
  const { data, error } = await supabase
    .from('spots')
    .upsert(spotData, { onConflict: 'google_place_id' })
    .select()
    .single()

  if (error) {
    console.error('Error creating spot:', error)
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
