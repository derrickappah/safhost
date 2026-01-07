'use server'

import { createServiceRoleClient } from '../supabase/server'
import { isAdmin } from '../auth/middleware'
import { logAuditAction } from './audit'

export interface CreateSchoolInput {
  name: string
  location: string
  latitude?: number
  longitude?: number
  logo_url?: string
}

/**
 * Create a new school
 */
export async function createSchool(input: CreateSchoolInput): Promise<{
  data: any | null
  error: string | null
}> {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { data: null, error: 'Admin access required' }
    }

    // Use service role client to bypass RLS (admin status already verified)
    const supabase = createServiceRoleClient()
    
    const { data, error } = await supabase
      .from('schools')
      .insert({
        name: input.name,
        location: input.location,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        logo_url: input.logo_url || null,
      })
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    // Log audit action
    const { getUser } = await import('../auth')
    const user = await getUser()
    if (user) {
      await logAuditAction(
        'create',
        'school',
        data.id,
        { name: input.name, location: input.location }
      )
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create school',
    }
  }
}

/**
 * Update an existing school
 */
export async function updateSchool(
  id: string,
  input: Partial<CreateSchoolInput>
): Promise<{
  data: any | null
  error: string | null
}> {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { data: null, error: 'Admin access required' }
    }

    // Use service role client to bypass RLS (admin status already verified)
    const supabase = createServiceRoleClient()
    
    const updateData: any = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.location !== undefined) updateData.location = input.location
    if (input.latitude !== undefined) updateData.latitude = input.latitude
    if (input.longitude !== undefined) updateData.longitude = input.longitude
    if (input.logo_url !== undefined) updateData.logo_url = input.logo_url

    const { data, error } = await supabase
      .from('schools')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    // Log audit action
    const { getUser } = await import('../auth')
    const user = await getUser()
    if (user) {
      await logAuditAction(
        'update',
        'school',
        id,
        updateData
      )
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update school',
    }
  }
}

/**
 * Delete a school
 */
export async function deleteSchool(id: string): Promise<{
  error: string | null
}> {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { error: 'Admin access required' }
    }

    // Use service role client to bypass RLS (admin status already verified)
    const supabase = createServiceRoleClient()
    
    const { error } = await supabase
      .from('schools')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: error.message }
    }

    // Log audit action
    const { getUser } = await import('../auth')
    const user = await getUser()
    if (user) {
      await logAuditAction(
        'delete',
        'school',
        id,
        {}
      )
    }

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete school',
    }
  }
}
