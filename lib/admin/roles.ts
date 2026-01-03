'use server'

import { createServiceRoleClient } from '../supabase/server'
import { isAdmin } from '../auth/middleware'
import { logAuditAction } from './audit'

/**
 * Update user role in profiles table
 */
export async function updateUserRole(
  userId: string,
  role: 'user' | 'admin'
): Promise<{
  error: string | null
}> {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { error: 'Admin access required' }
    }

    // Use service role client to bypass RLS (admin status already verified)
    const supabase = createServiceRoleClient()
    
    // Update profile role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
    
    if (profileError) {
      // If profile doesn't exist, create it
      if (profileError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            role,
          })
        
        if (insertError) {
          return { error: insertError.message }
        }
      } else {
        return { error: profileError.message }
      }
    }
    
    // Also update user metadata for backward compatibility
    const { error: metadataError } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: { role }
    })
    
    if (metadataError) {
      // Log but don't fail - profile update succeeded
      console.warn('Failed to update user metadata:', metadataError.message)
    }
    
    // Log audit action
    const { getUser } = await import('../auth')
    const user = await getUser()
    if (user) {
      await logAuditAction(
        'update',
        'user_role',
        userId,
        { role, updated_by: user.id }
      )
    }
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update user role',
    }
  }
}

/**
 * Get user role from profiles table
 */
export async function getUserRole(userId: string): Promise<{
  data: 'user' | 'admin' | null
  error: string | null
}> {
  try {
    const supabase = await createServiceRoleClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist, check user metadata
        const { data: userData } = await supabase.auth.admin.getUserById(userId)
        if (userData?.user?.user_metadata?.role === 'admin') {
          return { data: 'admin', error: null }
        }
        return { data: 'user', error: null }
      }
      return { data: null, error: error.message }
    }
    
    return { data: (data?.role as 'user' | 'admin') || 'user', error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to get user role',
    }
  }
}
