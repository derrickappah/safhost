'use server'

import { checkSubscriptionAccess } from './subscription'
import { getUser } from '../auth'

export interface AccessCheckResult {
  hasAccess: boolean
  isAuthenticated: boolean
  subscriptionId: string | null
  redirectTo?: string
}

/**
 * Check if user has access to protected content
 */
export async function checkAccess(): Promise<AccessCheckResult> {
  const access = await checkSubscriptionAccess()
  
  if (access.hasAccess) {
    return {
      hasAccess: true,
      isAuthenticated: access.isAuthenticated,
      subscriptionId: access.subscriptionId
    }
  }
  
  return {
    hasAccess: false,
    isAuthenticated: false,
    subscriptionId: null,
    redirectTo: '/subscribe'
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getUser()
  
  if (!user) {
    return false
  }
  
  try {
    // Check profiles table first (source of truth)
    const { createClient } = await import('../supabase/server')
    const supabase = await createClient()
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (!error && profile?.role === 'admin') {
      return true
    }
    
    // Fallback to user_metadata if profile check fails or doesn't have role
    if (user.user_metadata?.role === 'admin') {
      return true
    }
    
    return false
  } catch (error) {
    // On error, fallback to user_metadata
    console.error('Error checking admin status:', error)
    return user.user_metadata?.role === 'admin'
  }
}

/**
 * Require admin access (throws error if not admin)
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin()
  
  if (!admin) {
    throw new Error('Admin access required')
  }
}
