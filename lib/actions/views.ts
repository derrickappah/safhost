'use server'

import { cache } from 'react'
import { createClient } from '../supabase/server'
import { getUser } from '../auth'
import { getActiveSubscription } from './subscriptions'

/**
 * Track a hostel view
 * Only increments view_count if this is a unique view (user hasn't viewed this hostel before)
 */
export async function trackHostelView(hostelId: string): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    const { data: subscription } = await getActiveSubscription()
    
    // Track view - only if user or subscription is present (constraint requires at least one)
    // For anonymous users, we still increment view_count for analytics but don't log the view
    if (!user && !subscription) {
      // Anonymous view - just increment count for analytics
      await supabase.rpc('increment_hostel_view_count', { hostel_id: hostelId })
      return { error: null }
    }
    
    const viewData: any = {
      hostel_id: hostelId,
    }
    
    // Set user_id or subscription_id (constraint requires exactly one)
    if (user) {
      viewData.user_id = user.id
      viewData.subscription_id = null
    } else if (subscription) {
      viewData.subscription_id = subscription.id
      viewData.user_id = null
    }
    
    // Check if this is a unique view (user hasn't viewed this hostel before)
    let isUniqueView = true
    const { data: hasViewed } = await supabase.rpc('has_user_viewed_hostel', {
      p_user_id: user?.id || null,
      p_subscription_id: subscription?.id || null,
      p_hostel_id: hostelId
    })
    isUniqueView = !hasViewed
    
    // Only increment view_count if this is a unique view
    if (isUniqueView) {
      await supabase.rpc('increment_hostel_view_count', { hostel_id: hostelId })
    }
    
    // Insert view log (for history tracking)
    // If user already viewed, this will create a duplicate log entry but that's fine for history
    const { error } = await supabase
      .from('hostel_views')
      .insert(viewData)
    
    if (error) {
      console.error('Failed to track view:', error)
      // Don't fail if tracking fails
    }
    
    return { error: null }
  } catch (error) {
    console.error('View tracking error:', error)
    return { error: null } // Don't fail on tracking errors
  }
}

/**
 * Get recently viewed hostels for a user
 * Uses React cache() for request deduplication
 */
export const getRecentlyViewed = cache(async (limit: number = 10): Promise<{
  data: any[] | null
  error: string | null
}> => {
  try {
    const supabase = await createClient()
    const user = await getUser()
    const { data: subscription } = await getActiveSubscription()
    
    if (!user && !subscription) {
      return { data: [], error: null }
    }
    
    let query = supabase
      .from('hostel_views')
      .select(`
        hostel_id,
        viewed_at,
        hostel:hostels(
          id,
          name,
          description,
          price_min,
          price_max,
          rating,
          review_count,
          distance,
          address,
          images,
          amenities,
          school:schools(id, name, location)
        )
      `)
      .order('viewed_at', { ascending: false })
      .limit(limit)
    
    if (user) {
      query = query.eq('user_id', user.id)
    } else if (subscription) {
      query = query.eq('subscription_id', subscription.id)
    }
    
    const { data, error } = await query
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    // Remove duplicates (same hostel viewed multiple times)
    const uniqueHostels = new Map()
    data?.forEach((item: any) => {
      if (item.hostel && !uniqueHostels.has(item.hostel.id)) {
        uniqueHostels.set(item.hostel.id, item.hostel)
      }
    })
    
    return { data: Array.from(uniqueHostels.values()), error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch recently viewed'
    }
  }
})

/**
 * Get count of unique hostels viewed by user
 * Uses React cache() for request deduplication
 */
export const getViewedCount = cache(async (): Promise<{
  data: number | null
  error: string | null
}> => {
  try {
    const supabase = await createClient()
    const user = await getUser()
    const { data: subscription } = await getActiveSubscription()
    
    if (!user && !subscription) {
      return { data: 0, error: null }
    }
    
    // Use the database function if available, otherwise count manually
    try {
      const { data: count, error: rpcError } = await supabase.rpc('get_user_unique_view_count', {
        p_user_id: user?.id || null,
        p_subscription_id: subscription?.id || null
      })
      
      if (!rpcError && count !== null) {
        return { data: count, error: null }
      }
    } catch (rpcErr) {
      // Fall back to manual counting if RPC fails
      console.log('RPC function not available, using manual count')
    }
    
    // Manual count fallback
    let query = supabase
      .from('hostel_views')
      .select('hostel_id')
    
    if (user) {
      query = query.eq('user_id', user.id)
    } else if (subscription) {
      query = query.eq('subscription_id', subscription.id)
    }
    
    const { data: viewsData, error: distinctError } = await query
    
    if (distinctError) {
      return { data: null, error: distinctError.message }
    }
    
    // Count unique hostel_ids
    const uniqueHostels = new Set(viewsData?.map((v: any) => v.hostel_id).filter((id: any) => id) || [])
    
    return { data: uniqueHostels.size, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch viewed count'
    }
  }
})

export interface ViewedHistoryFilters {
  search?: string
  startDate?: string
  endDate?: string
  location?: string
  sortBy?: 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'
  limit?: number
  offset?: number
}

/**
 * Get viewed history with filtering and pagination
 */
export async function getViewedHistory(filters: ViewedHistoryFilters = {}): Promise<{
  data: any[] | null
  total: number | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { data: null, total: null, error: 'Authentication required' }
    }
    
    const { data: subscription } = await getActiveSubscription()
    if (!subscription) {
      return { data: null, total: null, error: 'Active subscription required' }
    }
    
    let query = supabase
      .from('hostel_views')
      .select(`
        hostel_id,
        viewed_at,
        hostel:hostels(
          id,
          name,
          address,
          price_min,
          price_max,
          rating,
          images,
          school:schools(name, location)
        )
      `, { count: 'exact' })
    
    if (user) {
      query = query.eq('user_id', user.id)
    } else if (subscription) {
      query = query.eq('subscription_id', subscription.id)
    }
    
    // Apply filters
    if (filters.startDate) {
      query = query.gte('viewed_at', filters.startDate)
    }
    
    if (filters.endDate) {
      query = query.lte('viewed_at', filters.endDate + 'T23:59:59')
    }
    
    if (filters.search) {
      query = query.or(`hostel.name.ilike.%${filters.search}%,hostel.address.ilike.%${filters.search}%`)
    }
    
    if (filters.location) {
      query = query.or(`hostel.address.ilike.%${filters.location}%,hostel.school.location.ilike.%${filters.location}%`)
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'date_asc':
        query = query.order('viewed_at', { ascending: true })
        break
      case 'date_desc':
        query = query.order('viewed_at', { ascending: false })
        break
      case 'name_asc':
        query = query.order('hostel.name', { ascending: true })
        break
      case 'name_desc':
        query = query.order('hostel.name', { ascending: false })
        break
      case 'price_asc':
        query = query.order('hostel.price_min', { ascending: true })
        break
      case 'price_desc':
        query = query.order('hostel.price_min', { ascending: false })
        break
      default:
        query = query.order('viewed_at', { ascending: false })
    }
    
    // Apply pagination
    const limit = filters.limit || 20
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      return { data: null, total: null, error: error.message }
    }
    
    // Remove duplicates and get unique hostels with most recent view date
    const uniqueHostels = new Map<string, any>()
    data?.forEach((item: any) => {
      if (item.hostel) {
        const hostelId = item.hostel.id
        const existing = uniqueHostels.get(hostelId)
        if (!existing || new Date(item.viewed_at) > new Date(existing.viewed_at)) {
          uniqueHostels.set(hostelId, {
            ...item.hostel,
            viewed_at: item.viewed_at,
            view_count: (existing?.view_count || 0) + 1
          })
        } else {
          existing.view_count = (existing.view_count || 0) + 1
        }
      }
    })
    
    return { 
      data: Array.from(uniqueHostels.values()), 
      total: count || uniqueHostels.size,
      error: null 
    }
  } catch (error) {
    return {
      data: null,
      total: null,
      error: error instanceof Error ? error.message : 'Failed to fetch viewed history'
    }
  }
}
