'use server'

import { createServiceRoleClient } from '../supabase/server'
import { isAdmin } from '../auth/middleware'
import { logAuditAction } from './audit'

export interface CreateHostelInput {
  school_id: string
  name: string
  description?: string
  price_min: number
  price_max?: number
  address: string
  landlord_name: string
  landlord_phone: string
  latitude?: number
  longitude?: number
  distance?: number
  amenities?: string[]
  gender_restriction?: 'male' | 'female' | 'mixed'
  is_available?: boolean
  featured?: boolean
  categories?: string[]
  images?: string[]
  room_types?: Array<{
    type: string
    price: number
    available: number
  }>
}

/**
 * Create a new hostel
 */
export async function createHostel(input: CreateHostelInput): Promise<{
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
    
    // Ensure room_types is properly formatted
    const roomTypesData = Array.isArray(input.room_types) && input.room_types.length > 0
      ? input.room_types
          .filter(rt => rt && typeof rt === 'object')
          .map(rt => ({
            type: String(rt.type || '').trim(),
            price: typeof rt.price === 'number' ? rt.price : Number(rt.price) || 0,
            available: typeof rt.available === 'number' ? rt.available : Number(rt.available) || 0
          }))
          .filter(rt => rt.type.length > 0 && rt.price > 0)
      : []
    
    console.log('Input room_types:', input.room_types)
    console.log('Formatted room_types for database:', JSON.stringify(roomTypesData))
    
    const { data, error } = await supabase
      .from('hostels')
      .insert({
        school_id: input.school_id,
        name: input.name,
        description: input.description || null,
        price_min: input.price_min,
        price_max: input.price_max || null,
        address: input.address,
        landlord_name: input.landlord_name,
        landlord_phone: input.landlord_phone,
        latitude: input.latitude || null,
        longitude: input.longitude || null,
        distance: input.distance || null,
        amenities: input.amenities || [],
        gender_restriction: input.gender_restriction || null,
        is_available: input.is_available !== undefined ? input.is_available : true,
        featured: input.featured || false,
        categories: input.categories || [],
        images: input.images || [],
        room_types: roomTypesData,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error creating hostel:', error)
      return { data: null, error: error.message }
    }

    // Log audit action
    const { getUser } = await import('../auth')
    const user = await getUser()
    if (user) {
      await logAuditAction(
        'create',
        'hostel',
        data.id,
        { name: input.name, school_id: input.school_id }
      )
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create hostel',
    }
  }
}

/**
 * Update an existing hostel
 */
export async function updateHostel(
  id: string,
  input: Partial<CreateHostelInput>
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
    if (input.description !== undefined) updateData.description = input.description
    if (input.price_min !== undefined) updateData.price_min = input.price_min
    if (input.price_max !== undefined) updateData.price_max = input.price_max
    if (input.address !== undefined) updateData.address = input.address
    if (input.landlord_name !== undefined) updateData.landlord_name = input.landlord_name
    if (input.landlord_phone !== undefined) updateData.landlord_phone = input.landlord_phone
    if (input.latitude !== undefined) updateData.latitude = input.latitude
    if (input.longitude !== undefined) updateData.longitude = input.longitude
    if (input.distance !== undefined) updateData.distance = input.distance
    if (input.amenities !== undefined) updateData.amenities = input.amenities
    if (input.gender_restriction !== undefined) updateData.gender_restriction = input.gender_restriction
    if (input.is_available !== undefined) updateData.is_available = input.is_available
    if (input.featured !== undefined) updateData.featured = input.featured
    if (input.categories !== undefined) updateData.categories = input.categories
    if (input.room_types !== undefined) {
      // Ensure room_types is properly formatted
      updateData.room_types = Array.isArray(input.room_types) && input.room_types.length > 0
        ? input.room_types
            .filter(rt => rt && typeof rt === 'object')
            .map(rt => ({
              type: String(rt.type || '').trim(),
              price: typeof rt.price === 'number' ? rt.price : Number(rt.price) || 0,
              available: typeof rt.available === 'number' ? rt.available : Number(rt.available) || 0
            }))
            .filter(rt => rt.type.length > 0 && rt.price > 0)
        : []
      console.log('Input room_types for update:', input.room_types)
      console.log('Formatted room_types for database:', JSON.stringify(updateData.room_types))
    }
    if (input.school_id !== undefined) updateData.school_id = input.school_id
    if (input.images !== undefined) updateData.images = input.images

    const { data, error } = await supabase
      .from('hostels')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: error.message }
    }

    // Log audit action
    const user = await import('../auth').then(m => m.getUser())
    if (user) {
      await logAuditAction(
        'update',
        'hostel',
        id,
        updateData
      )
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update hostel',
    }
  }
}

/**
 * Delete a hostel
 */
export async function deleteHostel(id: string): Promise<{
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
      .from('hostels')
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
        'hostel',
        id,
        {}
      )
    }

    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete hostel',
    }
  }
}
