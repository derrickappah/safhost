'use server'

import { createClient } from '../supabase/server'
import { isAdmin } from '../auth/middleware'

/**
 * Get app setting by key
 */
export async function getAppSetting(key: string): Promise<{
  data: any | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', key)
      .single()
    
    if (error) {
      // If setting doesn't exist, return null (not an error)
      if (error.code === 'PGRST116') {
        return { data: null, error: null }
      }
      return { data: null, error: error.message }
    }
    
    return { data: data?.value, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to get setting'
    }
  }
}

/**
 * Update app setting
 * Only admins can update settings
 */
export async function updateAppSetting(
  key: string,
  value: any
): Promise<{
  data: boolean | null
  error: string | null
}> {
  try {
    // Check admin access
    const admin = await isAdmin()
    if (!admin) {
      return { data: null, error: 'Unauthorized: Admin access required' }
    }

    const supabase = await createClient()
    
    // Try to update first
    const { data: updateData, error: updateError } = await supabase
      .from('app_settings')
      .update({ 
        value: typeof value === 'string' ? JSON.parse(value) : value,
        updated_at: new Date().toISOString()
      })
      .eq('key', key)
      .select()
    
    // If update failed because row doesn't exist, insert it
    if (updateError && updateError.code === 'PGRST116') {
      const { error: insertError } = await supabase
        .from('app_settings')
        .insert({
          key,
          value: typeof value === 'string' ? JSON.parse(value) : value
        })
      
      if (insertError) {
        return { data: null, error: insertError.message }
      }
      
      return { data: true, error: null }
    }
    
    if (updateError) {
      return { data: null, error: updateError.message }
    }
    
    return { data: true, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update setting'
    }
  }
}

/**
 * Check if advertisement is enabled
 */
export async function isAdvertisementEnabled(): Promise<boolean> {
  const { data } = await getAppSetting('advertisement_enabled')
  // Default to true if setting doesn't exist
  if (data === null) return true
  // Handle both boolean and string values
  if (typeof data === 'boolean') return data
  if (typeof data === 'string') return data === 'true'
  return true
}
