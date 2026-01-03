'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'
import { getActiveSubscription } from '../actions/subscriptions'

/**
 * Get notifications for current user
 */
export async function getNotifications(limit: number = 50): Promise<{
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
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
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
    
    return { data: data || [], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch notifications'
    }
  }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(): Promise<{
  data: number | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    const { data: subscription } = await getActiveSubscription()
    
    if (!user && !subscription) {
      return { data: 0, error: null }
    }
    
    let query = supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('read', false)
    
    if (user) {
      query = query.eq('user_id', user.id)
    } else if (subscription) {
      query = query.eq('subscription_id', subscription.id)
    }
    
    const { count, error } = await query
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: count || 0, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch unread count'
    }
  }
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    const { data: subscription } = await getActiveSubscription()
    
    if (!user && !subscription) {
      return { error: 'Authentication required' }
    }
    
    let query = supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
    
    if (user) {
      query = query.eq('user_id', user.id)
    } else if (subscription) {
      query = query.eq('subscription_id', subscription.id)
    }
    
    const { error } = await query
    
    if (error) {
      return { error: error.message }
    }
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to mark as read'
    }
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    const { data: subscription } = await getActiveSubscription()
    
    if (!user && !subscription) {
      return { error: 'Authentication required' }
    }
    
    let query = supabase
      .from('notifications')
      .update({ read: true })
      .eq('read', false)
    
    if (user) {
      query = query.eq('user_id', user.id)
    } else if (subscription) {
      query = query.eq('subscription_id', subscription.id)
    }
    
    const { error } = await query
    
    if (error) {
      return { error: error.message }
    }
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to mark all as read'
    }
  }
}
