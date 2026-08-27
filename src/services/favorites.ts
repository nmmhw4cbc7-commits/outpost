import { supabase } from '../lib/supabase'
import type { Favorite } from '../types'

export async function getFavorites(userId: string): Promise<Favorite[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*, spots(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching favorites:', error)
    return []
  }

  return data || []
}

export async function addFavorite(userId: string, spotId: string): Promise<boolean> {
  const { error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, spot_id: spotId })

  if (error) {
    console.error('Error adding favorite:', error)
    return false
  }

  return true
}

export async function removeFavorite(userId: string, spotId: string): Promise<boolean> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('spot_id', spotId)

  if (error) {
    console.error('Error removing favorite:', error)
    return false
  }

  return true
}

export async function isFavorited(userId: string, spotId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('favorites')
    .select('user_id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('spot_id', spotId)

  if (error) {
    console.error('Error checking favorite:', error)
    return false
  }

  return (count || 0) > 0
}

export async function toggleFavorite(
  userId: string,
  spotId: string
): Promise<boolean> {
  const favorited = await isFavorited(userId, spotId)

  if (favorited) {
    return removeFavorite(userId, spotId)
  } else {
    return addFavorite(userId, spotId)
  }
}
