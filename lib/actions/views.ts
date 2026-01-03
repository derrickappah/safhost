'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'
import { getActiveSubscription } from './subscriptions'

/**
 * Track a hostel view
 */
export async function trackHostelView(hostelId: string): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    const { data: subscription } = await getActiveSubscription()
    
    // Track view even if not authenticated (for analytics)
    const viewData: any = {
      hostel_id: hostelId,
    }
    
    if (user) {
      viewData.user_id = user.id
    }
    
    if (subscription) {
      viewData.subscription_id = subscription.id
    }
    
    // Update hostel view_count
    await supabase.rpc('increment_hostel_view_count', { hostel_id: hostelId })
    
    // Insert view log
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
 */
export async function getRecentlyViewed(limit: number = 10): Promise<{
  data: any[] | null
  error: string | null
}> {
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
        hostel:hostels(*)
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
}
