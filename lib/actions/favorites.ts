'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'
import { getActiveSubscription } from './subscriptions'

export interface Favorite {
  id: string
  user_id: string | null
  subscription_id: string | null
  hostel_id: string
  created_at: string
  hostel?: {
    id: string
    name: string
    price_min: number
    rating: number
    images: string[]
  }
}

/**
 * Get all favorites for authenticated user
 */
export async function getFavorites(): Promise<{
  data: Favorite[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { data: [], error: null } // Return empty array if not authenticated
    }
    
    // Get active subscription
    const { data: subscription } = await getActiveSubscription()
    
    let query = supabase
      .from('favorites')
      .select(`
        *,
        hostel:hostels(id, name, price_min, rating, images)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    
    const { data, error } = await query
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as Favorite[], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch favorites'
    }
  }
}

/**
 * Add a hostel to favorites (requires authenticated user)
 */
export async function addFavorite(
  hostelId: string
): Promise<{
  data: Favorite | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { data: null, error: 'Authentication required' }
    }
    
    // Check if user has active subscription
    const { data: subscription } = await getActiveSubscription()
    if (!subscription) {
      return { data: null, error: 'Active subscription required' }
    }
    
    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('hostel_id', hostelId)
      .eq('user_id', user.id)
      .single()
    
    if (existing) {
      return { data: null, error: 'Already in favorites' }
    }
    
    // Add to favorites
    // Constraint requires either user_id OR subscription_id, not both
    const favoriteData: any = {
      hostel_id: hostelId,
      user_id: user.id,
      subscription_id: null // Use user_id only, subscription_id must be null
    }
    
    const { data, error } = await supabase
      .from('favorites')
      .insert(favoriteData)
      .select(`
        *,
        hostel:hostels(id, name, price_min, rating, images)
      `)
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as Favorite, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to add favorite'
    }
  }
}

/**
 * Remove a hostel from favorites (requires authenticated user)
 */
export async function removeFavorite(
  hostelId: string
): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { error: 'Authentication required' }
    }
    
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('hostel_id', hostelId)
      .eq('user_id', user.id)
    
    if (error) {
      return { error: error.message }
    }
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to remove favorite'
    }
  }
}

/**
 * Check if a hostel is favorited (requires authenticated user)
 */
export async function isFavorited(
  hostelId: string
): Promise<boolean> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return false
    }
    
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('hostel_id', hostelId)
      .eq('user_id', user.id)
      .single()
    
    return data !== null
  } catch {
    return false
  }
}
