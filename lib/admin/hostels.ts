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
  hostel_manager_name: string
  hostel_manager_phone: string
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
  additional_schools?: Array<{
    school_id: string
    distance: number
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
        school_id: input.school_id, // Primary school
        name: input.name,
        description: input.description || null,
        price_min: input.price_min,
        price_max: input.price_max || null,
        address: input.address,
        hostel_manager_name: input.hostel_manager_name,
        hostel_manager_phone: input.hostel_manager_phone,
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

    // Add primary school to hostel_schools
    const hostelSchools = [{
      hostel_id: data.id,
      school_id: input.school_id,
      distance: input.distance || null
    }]

    // Add additional schools
    if (input.additional_schools && input.additional_schools.length > 0) {
      input.additional_schools.forEach(school => {
        // Avoid duplicates if primary school is also in additional_schools
        if (school.school_id !== input.school_id) {
          hostelSchools.push({
            hostel_id: data.id,
            school_id: school.school_id,
            distance: school.distance
          })
        }
      })
    }

    if (hostelSchools.length > 0) {
      const { error: schoolsError } = await supabase
        .from('hostel_schools')
        .insert(hostelSchools)

      if (schoolsError) {
        console.error('Error adding schools to hostel_schools:', schoolsError)
      }
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

    // Notify all students with active subscriptions for this school
    const { notifyStudentsForNewHostel } = await import('../notifications/create')
    notifyStudentsForNewHostel(input.school_id, data.id, input.name)
      .then(({ count, error }) => {
        if (error) {
          console.error(`Failed to send some notifications for hostel ${data.id}:`, error)
        } else {
          console.log(`Successfully sent ${count} notifications for new hostel ${input.name}`)
        }
      })
      .catch((err) => {
        console.error(`Error sending notifications for hostel ${data.id}:`, err)
      })

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
    if (input.hostel_manager_name !== undefined) updateData.hostel_manager_name = input.hostel_manager_name
    if (input.hostel_manager_phone !== undefined) updateData.hostel_manager_phone = input.hostel_manager_phone
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

    // Handle hostel_schools update
    if (input.school_id !== undefined || input.additional_schools !== undefined) {
      const currentPrimarySchoolId = data.school_id
      const currentDistance = data.distance

      if (input.additional_schools !== undefined) {
        // Full sync
        await supabase.from('hostel_schools').delete().eq('hostel_id', id)

        const hostelSchools: any[] = []

        // Add primary
        hostelSchools.push({
          hostel_id: id,
          school_id: currentPrimarySchoolId,
          distance: currentDistance
        })

        // Add additional
        input.additional_schools.forEach(school => {
          if (school.school_id !== currentPrimarySchoolId) {
            hostelSchools.push({
              hostel_id: id,
              school_id: school.school_id,
              distance: school.distance
            })
          }
        })

        if (hostelSchools.length > 0) {
          await supabase.from('hostel_schools').insert(hostelSchools)
        }

      } else if (input.school_id !== undefined) {
        // Upsert new primary
        await supabase.from('hostel_schools').upsert({
          hostel_id: id,
          school_id: currentPrimarySchoolId,
          distance: currentDistance
        })
      }
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

/**
 * Get all hostels for admin (no subscription check, includes inactive)
 */
export async function getAllHostels(limit?: number): Promise<{
  data: any[] | null
  error: string | null
}> {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { data: null, error: 'Admin access required' }
    }

    // Use service role client to bypass RLS (admin status already verified)
    const supabase = createServiceRoleClient()

    let query = supabase
      .from('hostels')
      .select(`
        id,
        school_id,
        name,
        price_min,
        price_max,
        rating,
        review_count,
        distance,
        images,
        amenities,
        is_active,
        created_at,
        view_count,
        gender_restriction,
        is_available,
        featured,
        latitude,
        longitude,
        school:schools!hostels_school_id_fkey(id, name, location, latitude, longitude, logo_url)
      `)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      return { data: null, error: error.message }
    }

    // Format data
    const formattedData = (data || []).map(hostel => ({
      ...hostel,
      latitude: hostel.latitude ? Number(hostel.latitude) : null,
      longitude: hostel.longitude ? Number(hostel.longitude) : null,
      price_min: Number(hostel.price_min),
      price_max: hostel.price_max ? Number(hostel.price_max) : null,
      rating: Number(hostel.rating),
      school: Array.isArray(hostel.school) ? hostel.school[0] : hostel.school
    }))

    return { data: formattedData, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch hostels',
    }
  }
}
