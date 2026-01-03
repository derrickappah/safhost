'use client'

import { createClient } from '../supabase/client'

/**
 * Get current user (client-side)
 */
export function getCurrentUser() {
  const supabase = createClient()
  return supabase.auth.getUser()
}

/**
 * Get current session (client-side)
 */
export function getCurrentSession() {
  const supabase = createClient()
  return supabase.auth.getSession()
}
