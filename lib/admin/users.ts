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

/**
 * Get user roles for multiple users (admin only)
 * Uses React cache() for request deduplication
 */
export const getUserRoles = cache(async (userIds: string[]): Promise<{
  data: Map<string, 'user' | 'admin'> | null
  error: string | null
}> => {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { data: null, error: 'Admin access required' }
    }

    if (userIds.length === 0) {
      return { data: new Map(), error: null }
    }

    const supabase = createServiceRoleClient()
    
    // Fetch roles from profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .in('id', userIds)
    
    const roleMap = new Map<string, 'user' | 'admin'>()
    
    // Add roles from profiles
    if (profiles) {
      profiles.forEach(profile => {
        roleMap.set(profile.id, (profile.role as 'user' | 'admin') || 'user')
      })
    }
    
    // For users without profiles, check user_metadata
    const missingIds = userIds.filter(id => !roleMap.has(id))
    if (missingIds.length > 0) {
      for (const userId of missingIds) {
        try {
          const { data: userData } = await supabase.auth.admin.getUserById(userId)
          if (userData?.user?.user_metadata?.role === 'admin') {
            roleMap.set(userId, 'admin')
          } else {
            roleMap.set(userId, 'user')
          }
        } catch (err) {
          // Default to 'user' if we can't fetch
          roleMap.set(userId, 'user')
        }
      }
    }
    
    return { data: roleMap, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch user roles'
    }
  }
})