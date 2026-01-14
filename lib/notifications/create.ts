'use server'

import { createClient } from '../supabase/server'
import { createServiceRoleClient } from '../supabase/server'
import { getUser } from '../auth'
import { getActiveSubscription } from '../actions/subscriptions'
import { getSchoolById } from '../actions/schools'

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

/**
 * Notify all students with active subscriptions for a school when a new hostel is added
 * Uses batch inserts for efficiency when dealing with many students
 */
export async function notifyStudentsForNewHostel(
  schoolId: string,
  hostelId: string,
  hostelName: string
): Promise<{
  count: number
  error: string | null
}> {
  try {
    const supabase = createServiceRoleClient()
    
    // Get school name for the notification message
    const { data: school, error: schoolError } = await getSchoolById(schoolId)
    if (schoolError || !school) {
      console.error('Error fetching school for notification:', schoolError)
      // Continue anyway, we'll use a generic message
    }
    
    const schoolName = school?.name || 'your school'
    
    // Step 1: Get all profiles with the given school_id
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id')
      .eq('school_id', schoolId)
    
    if (profilesError) {
      console.error('Error querying profiles for notifications:', profilesError)
      return { count: 0, error: profilesError.message }
    }
    
    if (!profiles || profiles.length === 0) {
      console.log(`No students found for school ${schoolId}`)
      return { count: 0, error: null }
    }
    
    const userIds = profiles.map(p => p.id)
    
    // Step 2: Get all active, non-expired subscriptions for these users
    const now = new Date().toISOString()
    const { data: subscriptions, error: subsError } = await supabase
      .from('subscriptions')
      .select('id, user_id, status, expires_at')
      .in('user_id', userIds)
      .eq('status', 'active')
    
    if (subsError) {
      console.error('Error querying subscriptions for notifications:', subsError)
      return { count: 0, error: subsError.message }
    }
    
    if (!subscriptions || subscriptions.length === 0) {
      console.log(`No active subscriptions found for students in school ${schoolId}`)
      return { count: 0, error: null }
    }
    
    // Filter subscriptions to only include non-expired ones
    const validSubscriptions = subscriptions.filter((sub: any) => {
      if (!sub.expires_at) return true // No expiration date means active
      return new Date(sub.expires_at) > new Date(now)
    })
    
    if (validSubscriptions.length === 0) {
      console.log(`No non-expired active subscriptions found for students in school ${schoolId}`)
      return { count: 0, error: null }
    }
    
    // Prepare notification data for batch insert
    const notificationsToInsert: Array<{
      user_id: string
      subscription_id: string | null
      type: string
      title: string
      message: string
      data: Record<string, any>
    }> = []
    
    for (const subscription of validSubscriptions) {
      if (subscription.user_id) {
        notificationsToInsert.push({
          user_id: subscription.user_id,
          subscription_id: subscription.id,
          type: 'new_hostel',
          title: 'New Hostel Available',
          message: `${hostelName} is now available near ${schoolName}. Check it out!`,
          data: {
            hostelId,
            hostelName,
            schoolId,
            schoolName,
          },
        })
      }
    }
    
    if (notificationsToInsert.length === 0) {
      console.log(`No valid active subscriptions found for students in school ${schoolId}`)
      return { count: 0, error: null }
    }
    
    // Batch insert notifications in chunks of 100 for efficiency
    const BATCH_SIZE = 100
    let totalInserted = 0
    let lastError: string | null = null
    
    for (let i = 0; i < notificationsToInsert.length; i += BATCH_SIZE) {
      const batch = notificationsToInsert.slice(i, i + BATCH_SIZE)
      
      const { data, error: insertError } = await supabase
        .from('notifications')
        .insert(batch)
        .select('id')
      
      if (insertError) {
        console.error(`Error inserting notification batch ${i / BATCH_SIZE + 1}:`, insertError)
        lastError = insertError.message
        // Continue with next batch even if this one fails
      } else {
        totalInserted += data?.length || 0
      }
    }
    
    console.log(`Successfully sent ${totalInserted} notifications for new hostel ${hostelName} to school ${schoolName}`)
    
    return {
      count: totalInserted,
      error: lastError, // Return error only if all batches failed
    }
  } catch (error) {
    console.error('Error in notifyStudentsForNewHostel:', error)
    return {
      count: 0,
      error: error instanceof Error ? error.message : 'Failed to notify students',
    }
  }
}
