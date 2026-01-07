'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'
import { getActiveSubscription } from './subscriptions'

/**
 * Flag a hostel as no longer available (requires admin approval)
 */
export async function flagHostelAvailability(
  hostelId: string,
  roomType: string,
  availableCount: number
): Promise<{
  data: any | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    const { data: subscription } = await getActiveSubscription()
    
    if (!user && !subscription) {
      return { data: null, error: 'Authentication or subscription required' }
    }
    
    const flagData: any = {
      hostel_id: hostelId,
      room_type: roomType,
      available_count: availableCount,
      status: 'pending',
    }
    
    if (user) {
      flagData.flagged_by_user_id = user.id
      flagData.flagged_by_subscription_id = null
    } else if (subscription) {
      flagData.flagged_by_subscription_id = subscription.id
      flagData.flagged_by_user_id = null
    } else {
      return { data: null, error: 'Authentication or active subscription required' }
    }
    
    const { data, error } = await supabase
      .from('room_availability_logs')
      .insert(flagData)
      .select()
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to flag availability',
    }
  }
}
