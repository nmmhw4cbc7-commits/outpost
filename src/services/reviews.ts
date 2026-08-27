import { supabase } from '../lib/supabase'
import type { Review } from '../types'

export async function getReviewsBySpot(
  spotId: string,
  page: number = 1,
  limit: number = 10
): Promise<{ reviews: Review[]; total: number }> {
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from('reviews')
    .select('*, profiles(username, avatar_url)', { count: 'exact' })
    .eq('spot_id', spotId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching reviews:', error)
    return { reviews: [], total: 0 }
  }

  return {
    reviews: data || [],
    total: count || 0
  }
}

export async function getUserReviews(userId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, spots(name, address), profiles(username)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user reviews:', error)
    return []
  }

  return data || []
}

export async function createReview(
  review: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'profiles'>
): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .insert(review)
    .select()
    .single()

  if (error) {
    console.error('Error creating review:', error)
    return null
  }

  return data
}

export async function updateReview(
  id: string,
  updates: Partial<Review>
): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating review:', error)
    return null
  }

  return data
}

export async function deleteReview(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting review:', error)
    return false
  }

  return true
}

export async function hasUserReviewedSpot(
  userId: string,
  spotId: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('spot_id', spotId)

  if (error) {
    console.error('Error checking review:', error)
    return false
  }

  return (count || 0) > 0
}

export async function markReviewHelpful(reviewId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('review_helpful_votes')
    .insert({ review_id: reviewId, user_id: userId })

  if (error) {
    console.error('Error marking review helpful:', error)
    return false
  }

  return true
}
