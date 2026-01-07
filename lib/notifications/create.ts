'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'
import { getActiveSubscription } from '../actions/subscriptions'

export interface CreateNotificationInput {
  userId?: string
  subscriptionId?: string
  type: 'subscription_expiry' | 'new_hostel' | 'promotion' | 'hostel_updated' | 'other'
  title: string
  message: string
  data?: Record<string, any>
}

/**
 * Create a notification
 */
export async function createNotification(input: CreateNotificationInput): Promise<{
  data: any | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    if (!input.userId && !input.subscriptionId) {
      return { data: null, error: 'Either userId or subscriptionId is required' }
    }
    
    const notificationData: any = {
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data || {},
    }
    
    if (input.userId) {
      notificationData.user_id = input.userId
      notificationData.subscription_id = null
    } else if (input.subscriptionId) {
      notificationData.subscription_id = input.subscriptionId
      notificationData.user_id = null
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create notification'
    }
  }
}

/**
 * Create notification for subscription expiry reminder (3 days before)
 */
export async function createExpiryReminder(userId: string, subscriptionId: string, daysLeft: number): Promise<{
  error: string | null
}> {
  if (daysLeft !== 3) {
    return { error: null } // Only create reminder 3 days before
  }
  
  const { error } = await createNotification({
    userId,
    subscriptionId,
    type: 'subscription_expiry',
    title: 'Subscription Expiring Soon',
    message: `Your subscription expires in ${daysLeft} days. Renew now to continue accessing all hostels.`,
    data: { daysLeft, subscriptionId },
  })
  
  return { error }
}

/**
 * Create notification for new hostels near school
 */
export async function createNewHostelNotification(
  userId: string,
  subscriptionId: string,
  hostelName: string,
  schoolName: string
): Promise<{
  error: string | null
}> {
  const { error } = await createNotification({
    userId,
    subscriptionId,
    type: 'new_hostel',
    title: 'New Hostel Available',
    message: `${hostelName} is now available near ${schoolName}. Check it out!`,
    data: { hostelName, schoolName },
  })
  
  return { error }
}

/**
 * Create notification when favorited hostel is updated
 */
export async function createHostelUpdatedNotification(
  userId: string,
  subscriptionId: string,
  hostelName: string
): Promise<{
  error: string | null
}> {
  const { error } = await createNotification({
    userId,
    subscriptionId,
    type: 'hostel_updated',
    title: 'Hostel Updated',
    message: `${hostelName} has been updated. View the latest details.`,
    data: { hostelName },
  })
  
  return { error }
}
