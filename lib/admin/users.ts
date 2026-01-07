'use server'

import { cache } from 'react'
import { createServiceRoleClient } from '../supabase/server'
import { isAdmin } from '../auth/middleware'
import { createClient } from '../supabase/server'

/**
 * Get all users (admin only)
 * Uses React cache() for request deduplication
 */
export const getUsers = cache(async (): Promise<{
  data: any[] | null
  error: string | null
}> => {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { data: null, error: 'Admin access required' }
    }

    // Use service role client to access auth admin API
    const supabase = createServiceRoleClient()
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data.users || [], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch users'
    }
  }
})

/**
 * Get banned users
 * Uses React cache() for request deduplication
 */
export const getBannedUsers = cache(async (): Promise<{
  data: Set<string> | null
  error: string | null
}> => {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { data: null, error: 'Admin access required' }
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('banned_users')
      .select('user_id')
      .eq('is_active', true)
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: new Set(data.map(b => b.user_id)), error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch banned users'
    }
  }
})
