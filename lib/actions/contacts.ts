'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'
import { getActiveSubscription } from './subscriptions'

/**
 * Log a contact click (when user clicks "Contact Landlord")
 */
export async function logContactClick(hostelId: string): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    const { data: subscription } = await getActiveSubscription()
    
    if (!user && !subscription) {
      return { error: 'Authentication or subscription required' }
    }
    
    const contactData: any = {
      hostel_id: hostelId,
    }
    
    if (user) {
      contactData.user_id = user.id
    }
    
    if (subscription) {
      contactData.subscription_id = subscription.id
    }
    
    const { error } = await supabase
      .from('contact_logs')
      .insert(contactData)
    
    if (error) {
      return { error: error.message }
    }
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to log contact'
    }
  }
}
