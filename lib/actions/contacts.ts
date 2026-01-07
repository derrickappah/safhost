'use server'

import { cache } from 'react'
import { createClient } from '../supabase/server'
import { getUser } from '../auth'
import { getActiveSubscription } from './subscriptions'

/**
 * Log a contact click (when user clicks "Contact Landlord")
 */
export async function logContactClick(hostelId: string): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    const { data: subscription } = await getActiveSubscription()
    
    if (!user && !subscription) {
      return { error: 'Authentication or subscription required' }
    }
    
    const contactData: any = {
      hostel_id: hostelId,
    }
    
    // Set user_id or subscription_id (constraint requires exactly one)
    if (user) {
      contactData.user_id = user.id
      contactData.subscription_id = null
    } else if (subscription) {
      contactData.subscription_id = subscription.id
      contactData.user_id = null
    }
    
    const { error } = await supabase
      .from('contact_logs')
      .insert(contactData)
    
    if (error) {
      console.error('Failed to log contact click:', error)
      return { error: error.message }
    }
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to log contact'
    }
  }
}

/**
 * Get count of unique hostels contacted by user
 * Uses React cache() for request deduplication
 */
export const getContactedCount = cache(async (): Promise<{
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
      const { data: count, error: rpcError } = await supabase.rpc('get_user_unique_contact_count', {
        p_user_id: user?.id || null,
        p_subscription_id: subscription?.id || null
      })
      
      if (!rpcError && count !== null) {
        return { data: count, error: null }
      }
      
      if (rpcError) {
        console.error('RPC error in get_user_unique_contact_count:', rpcError)
      }
    } catch (rpcErr) {
      // Fall back to manual counting if RPC fails
      console.error('RPC function error, using manual count:', rpcErr)
    }
    
    // Manual count fallback
    let query = supabase
      .from('contact_logs')
      .select('hostel_id')
    
    if (user) {
      query = query.eq('user_id', user.id)
    } else if (subscription) {
      query = query.eq('subscription_id', subscription.id)
    }
    
    const { data: contactsData, error } = await query
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    // Count unique hostel_ids
    const uniqueHostels = new Set(contactsData?.map((c: any) => c.hostel_id).filter((id: any) => id) || [])
    
    return { data: uniqueHostels.size, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch contacted count'
    }
  }
})

export interface ContactedHistoryFilters {
  search?: string
  startDate?: string
  endDate?: string
  location?: string
  sortBy?: 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'
  limit?: number
  offset?: number
}

/**
 * Get contacted history with filtering and pagination
 */
export async function getContactedHistory(filters: ContactedHistoryFilters = {}): Promise<{
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
      .from('contact_logs')
      .select(`
        hostel_id,
        created_at,
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
      query = query.gte('created_at', filters.startDate)
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate + 'T23:59:59')
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
        query = query.order('created_at', { ascending: true })
        break
      case 'date_desc':
        query = query.order('created_at', { ascending: false })
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
        query = query.order('created_at', { ascending: false })
    }
    
    // Apply pagination
    const limit = filters.limit || 20
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      return { data: null, total: null, error: error.message }
    }
    
    // Remove duplicates and get unique hostels with most recent contact date
    const uniqueHostels = new Map<string, any>()
    data?.forEach((item: any) => {
      if (item.hostel) {
        const hostelId = item.hostel.id
        const existing = uniqueHostels.get(hostelId)
        if (!existing || new Date(item.created_at) > new Date(existing.contacted_at)) {
          uniqueHostels.set(hostelId, {
            ...item.hostel,
            contacted_at: item.created_at,
            contact_count: (existing?.contact_count || 0) + 1
          })
        } else {
          existing.contact_count = (existing.contact_count || 0) + 1
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
      error: error instanceof Error ? error.message : 'Failed to fetch contacted history'
    }
  }
}

