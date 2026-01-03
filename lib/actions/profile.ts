'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'

/**
 * Get user profile
 */
export async function getProfile(): Promise<{
  data: any | null
  error: string | null
}> {
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
}

/**
 * Update user profile (name, email, phone, school)
 */
export async function updateProfile(
  name?: string,
  email?: string,
  phone?: string,
  schoolId?: string | null
): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { error: 'Authentication required' }
    }
    
    // Ensure profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
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
          role: user.user_metadata?.role || 'user',
        })
      
      if (insertError) {
        return { error: insertError.message }
      }
    } else {
      // Update profile
      const updateData: any = {}
      
      if (name !== undefined) {
        updateData.full_name = name
      }
      
      if (phone !== undefined) {
        updateData.phone = phone
      }
      
      if (schoolId !== undefined) {
        updateData.school_id = schoolId
      }
      
      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id)
        
        if (updateError) {
          return { error: updateError.message }
        }
      }
    }
    
    // Update email in auth if provided
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
 */
export async function getPaymentHistory(): Promise<{
  data: any[] | null
  error: string | null
}> {
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
}
