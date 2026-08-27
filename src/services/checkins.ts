import { supabase } from '../lib/supabase'
import type { CheckIn } from '../types'

export async function performCheckIn(
  userId: string,
  spotId: string
): Promise<{ success: boolean; pointsEarned: number; error?: string }> {
  const { data, error } = await supabase.rpc('perform_checkin', {
    p_user_id: userId,
    p_spot_id: spotId
  })

  if (error) {
    console.error('Check-in error:', error)
    return {
      success: false,
      pointsEarned: 0,
      error: error.message || 'Check-in failed'
    }
  }

  return data || { success: false, pointsEarned: 0, error: 'Unknown error' }
}

export async function getUserCheckIns(
  userId: string,
  limit: number = 50
): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*, spots(name, city, country)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching check-ins:', error)
    return []
  }

  return data || []
}

export async function getSpotCheckIns(spotId: string): Promise<CheckIn[]> {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*, profiles(username)')
    .eq('spot_id', spotId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching spot check-ins:', error)
    return []
  }

  return data || []
}

export async function getUserStats(userId: string) {
  const { data, error } = await supabase
    .rpc('get_user_stats', { p_user_id: userId })

  if (error) {
    console.error('Error fetching user stats:', error)
    return null
  }

  return data
}
