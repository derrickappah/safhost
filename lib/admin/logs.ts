'use server'

import { cache } from 'react'
import { createClient } from '../supabase/server'

export interface LogFilters {
  type?: 'view' | 'contact' | 'all'
  userId?: string
  hostelId?: string
  startDate?: string
  endDate?: string
  search?: string
  limit?: number
  offset?: number
}

/**
 * Get detailed view logs for admin
 * Uses React cache() for request deduplication
 */
export const getViewLogs = cache(async (filters: LogFilters = {}): Promise<{
  data: any[] | null
  total: number | null
  error: string | null
}> => {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('hostel_views')
      .select(`
        id,
        hostel_id,
        user_id,
        subscription_id,
        viewed_at,
        hostel:hostels(id, name)
      `, { count: 'exact' })
    
    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }
    
    if (filters.hostelId) {
      query = query.eq('hostel_id', filters.hostelId)
    }
    
    if (filters.startDate) {
      query = query.gte('viewed_at', filters.startDate)
    }
    
    if (filters.endDate) {
      query = query.lte('viewed_at', filters.endDate + 'T23:59:59')
    }
    
    if (filters.search) {
      query = query.or(`hostel.name.ilike.%${filters.search}%`)
    }
    
    query = query.order('viewed_at', { ascending: false })
    
    const limit = filters.limit || 50
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      return { data: null, total: null, error: error.message }
    }
    
    // Fetch user emails for logs with user_id
    if (data && data.length > 0) {
      const userIds = data
        .filter((log: any) => log.user_id)
        .map((log: any) => log.user_id)
        .filter((id: string, index: number, self: string[]) => self.indexOf(id) === index)
      
      if (userIds.length > 0) {
        try {
          const { data: userEmails } = await supabase.rpc('get_user_emails', {
            user_ids: userIds
          })
          
          if (userEmails && userEmails.length > 0) {
            const emailMap = new Map(userEmails.map((u: any) => [u.id, u.email]))
            data.forEach((log: any) => {
              if (log.user_id && emailMap.has(log.user_id)) {
                log.user = { email: emailMap.get(log.user_id) }
              }
            })
          }
        } catch (rpcError) {
          console.error('Error fetching user emails:', rpcError)
        }
      }
    }
    
    return { data: data || [], total: count || 0, error: null }
  } catch (error) {
    return {
      data: null,
      total: null,
      error: error instanceof Error ? error.message : 'Failed to fetch view logs'
    }
  }
})

/**
 * Get detailed contact logs for admin
 * Uses React cache() for request deduplication
 */
export const getContactLogs = cache(async (filters: LogFilters = {}): Promise<{
  data: any[] | null
  total: number | null
  error: string | null
}> => {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('contact_logs')
      .select(`
        id,
        hostel_id,
        user_id,
        subscription_id,
        created_at,
        hostel:hostels(id, name)
      `, { count: 'exact' })
    
    if (filters.userId) {
      query = query.eq('user_id', filters.userId)
    }
    
    if (filters.hostelId) {
      query = query.eq('hostel_id', filters.hostelId)
    }
    
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate)
    }
    
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate + 'T23:59:59')
    }
    
    if (filters.search) {
      query = query.or(`hostel.name.ilike.%${filters.search}%`)
    }
    
    query = query.order('created_at', { ascending: false })
    
    const limit = filters.limit || 50
    const offset = filters.offset || 0
    query = query.range(offset, offset + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      return { data: null, total: null, error: error.message }
    }
    
    // Fetch user emails for logs with user_id
    if (data && data.length > 0) {
      const userIds = data
        .filter((log: any) => log.user_id)
        .map((log: any) => log.user_id)
        .filter((id: string, index: number, self: string[]) => self.indexOf(id) === index)
      
      if (userIds.length > 0) {
        try {
          const { data: userEmails } = await supabase.rpc('get_user_emails', {
            user_ids: userIds
          })
          
          if (userEmails && userEmails.length > 0) {
            const emailMap = new Map(userEmails.map((u: any) => [u.id, u.email]))
            data.forEach((log: any) => {
              if (log.user_id && emailMap.has(log.user_id)) {
                log.user = { email: emailMap.get(log.user_id) }
              }
            })
          }
        } catch (rpcError) {
          console.error('Error fetching user emails:', rpcError)
        }
      }
    }
    
    return { data: data || [], total: count || 0, error: null }
  } catch (error) {
    return {
      data: null,
      total: null,
      error: error instanceof Error ? error.message : 'Failed to fetch contact logs'
    }
  }
})
