'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'

/**
 * Track a direction request for analytics
 */
export async function trackDirectionRequest(hostelId: string, schoolId: string, travelMode: string) {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    // For now, we'll just log this to the console
    // In a production app, you would insert this into an 'analytics_events' table
    console.log('Directions Request tracked:', {
      userId: user?.id || 'anonymous',
      hostelId,
      schoolId,
      travelMode,
      timestamp: new Date().toISOString()
    })

    // Example of how you might insert into a generic events table if it existed:
    /*
    await supabase.from('analytics_events').insert({
      event_type: 'directions_request',
      user_id: user?.id,
      metadata: { hostelId, schoolId, travelMode }
    })
    */

    return { success: true }
  } catch (error) {
    console.error('Error tracking direction request:', error)
    return { success: false, error: 'Failed to track request' }
  }
}
