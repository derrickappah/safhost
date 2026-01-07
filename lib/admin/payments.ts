'use server'

import { cache } from 'react'
import { createClient } from '../supabase/server'
import { isAdmin } from '../auth/middleware'

export type PaymentFilter = 'all' | 'success' | 'failed' | 'pending'

/**
 * Get all payments (admin only)
 * Uses React cache() for request deduplication
 */
export const getPayments = cache(async (filter: PaymentFilter = 'all'): Promise<{
  data: any[] | null
  error: string | null
}> => {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { data: null, error: 'Admin access required' }
    }

    const supabase = await createClient()
    let query = supabase
      .from('payments')
      .select('*, subscription:subscriptions(user_id, email, phone)')
      .order('created_at', { ascending: false })
      .limit(200)
    
    if (filter !== 'all') {
      query = query.eq('status', filter)
    }
    
    const { data, error } = await query
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data || [], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch payments'
    }
  }
})
