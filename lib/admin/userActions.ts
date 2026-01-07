'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'
import { logAuditAction } from './audit'

/**
 * Ban a user
 */
export async function banUser(
  userId: string,
  reason?: string
): Promise<{
  error: string | null
}> {
  try {
    const user = await getUser()
    if (!user) {
      return { error: 'Authentication required' }
    }

    const supabase = await createClient()
    
    // Check if already banned
    const { data: existing } = await supabase
      .from('banned_users')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()
    
    if (existing) {
      return { error: 'User is already banned' }
    }
    
    const { error } = await supabase
      .from('banned_users')
      .insert({
        user_id: userId,
        reason: reason || null,
        banned_by: user.id,
      })
    
    if (error) {
      return { error: error.message }
    }
    
    await logAuditAction('ban_user', 'user', userId, { reason: reason || null })
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to ban user'
    }
  }
}

/**
 * Unban a user
 */
export async function unbanUser(userId: string): Promise<{
  error: string | null
}> {
  try {
    const user = await getUser()
    if (!user) {
      return { error: 'Authentication required' }
    }

    const supabase = await createClient()
    
    const { error } = await supabase
      .from('banned_users')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (error) {
      return { error: error.message }
    }
    
    await logAuditAction('unban_user', 'user', userId, {})
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to unban user'
    }
  }
}
