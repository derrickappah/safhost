'use server'

import { cache } from 'react'
import { createClient } from '../supabase/server'
import { getUser } from '../auth'

/**
 * Get user profile
 * Uses React cache() for request deduplication
 */
export const getProfile = cache(async (): Promise<{
  data: any | null
  error: string | null
}> => {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { data: null, error: 'Authentication required' }
    }
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*, school:schools(*)')
      .eq('id', user.id)
      .single()
    
    if (error) {
      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: user.user_metadata?.name || user.user_metadata?.full_name || null,
            phone: user.user_metadata?.phone || null,
            role: user.user_metadata?.role || 'user',
          })
          .select('*, school:schools(*)')
          .single()
        
        if (insertError) {
          return { data: null, error: insertError.message }
        }
        
        return { data: newProfile, error: null }
      }
      
      return { data: null, error: error.message }
    }
    
    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch profile',
    }
  }
})

/**
 * Update user profile (name, email, phone, school, avatar_url)
 */
export async function updateProfile(
  name?: string,
  email?: string,
  phone?: string,
  schoolId?: string | null,
  avatarUrl?: string | null
): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { error: 'Authentication required' }
    }
    
    // Build update data only for provided values
    const updateData: any = {}
    let hasUpdates = false
    
    if (name !== undefined) {
      updateData.full_name = name
      hasUpdates = true
    }
    
    if (phone !== undefined) {
      updateData.phone = phone
      hasUpdates = true
    }
    
    if (schoolId !== undefined) {
      updateData.school_id = schoolId
      hasUpdates = true
    }
    
    if (avatarUrl !== undefined) {
      updateData.avatar_url = avatarUrl
      hasUpdates = true
    }
    
    // Only proceed if there are actual updates to make
    if (!hasUpdates && (email === undefined || email === user.email)) {
      return { error: null } // No updates needed
    }
    
    // Ensure profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, full_name, phone, school_id, avatar_url')
      .eq('id', user.id)
      .single()
    
    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          full_name: name || user.user_metadata?.name || user.user_metadata?.full_name || null,
          phone: phone || user.user_metadata?.phone || null,
          school_id: schoolId || null,
          avatar_url: avatarUrl || null,
          role: user.user_metadata?.role || 'user',
        })
        
      if (insertError) {
        return { error: insertError.message }
      }
    } else if (hasUpdates) {
      // Only update if there are actual changes
      // Check if values actually changed to avoid unnecessary updates
      const needsUpdate = 
        (name !== undefined && name !== existingProfile.full_name) ||
        (phone !== undefined && phone !== existingProfile.phone) ||
        (schoolId !== undefined && schoolId !== existingProfile.school_id) ||
        (avatarUrl !== undefined && avatarUrl !== existingProfile.avatar_url)
      
      if (needsUpdate) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id)
        
        if (updateError) {
          return { error: updateError.message }
        }
      }
    }
    
    // Update email in auth if provided and different
    if (email !== undefined && email !== user.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email,
      })
      
      if (emailError) {
        return { error: emailError.message }
      }
    }
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update profile',
    }
  }
}

/**
 * Get payment history for current user
 * Uses React cache() for request deduplication
 */
export const getPaymentHistory = cache(async (): Promise<{
  data: any[] | null
  error: string | null
}> => {
  try {
    const supabase = await createClient()
    const user = await getUser()
    const { getActiveSubscription } = await import('./subscriptions')
    const { data: subscription } = await getActiveSubscription()
    
    if (!user && !subscription) {
      return { data: [], error: null }
    }
    
    let query = supabase
      .from('payments')
      .select('*, subscription:subscriptions(*)')
      .order('created_at', { ascending: false })
    
    if (user) {
      query = query.eq('subscription:subscriptions.user_id', user.id)
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
      error: error instanceof Error ? error.message : 'Failed to fetch payment history',
    }
  }
})
