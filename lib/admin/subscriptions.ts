'use server'

import { cache } from 'react'
import { createClient } from '../supabase/server'
import { isAdmin } from '../auth/middleware'

/**
 * Get all subscriptions (admin only)
 * Uses React cache() for request deduplication
 */
export const getSubscriptions = cache(async (): Promise<{
  data: any[] | null
  error: string | null
}> => {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { data: null, error: 'Admin access required' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, payments(id, amount, status)')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data || [], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch subscriptions'
    }
  }
})
