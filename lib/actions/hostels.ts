'use server'

import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'

export interface HostelFilters {
  schoolId?: string
  minPrice?: number
  maxPrice?: number
  amenities?: string[]
  search?: string
  limit?: number
  offset?: number
  maxDistance?: number
  roomTypes?: string[]
  genderRestriction?: string
  isAvailable?: boolean
  sortBy?: 'price_asc' | 'price_desc' | 'distance' | 'rating' | 'newest' | 'popular'
}

export interface Hostel {
  id: string
  school_id: string
  name: string
  description: string | null
  price_min: number
  price_max: number | null
  rating: number
  review_count: number
  distance: number | null
  address: string
  landlord_name: string
  landlord_phone: string
  latitude: number | null
  longitude: number | null
  images: string[]
  amenities: string[]
  room_types: Array<{
    type: string
    price: number
    available: number
  }>
  is_active: boolean
  created_at: string
  updated_at: string
  gender_restriction?: 'male' | 'female' | 'mixed' | null
  is_available?: boolean
  view_count?: number
  featured?: boolean
  categories?: string[]
  school?: {
    id: string
    name: string
    location: string
  }
}

/**
 * Get all hostels with optional filters
 */
export async function getHostels(filters: HostelFilters = {}): Promise<{
  data: Hostel[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    let query = supabase
      .from('hostels')
      .select(`
        *,
        school:schools(id, name, location)
      `)
      .eq('is_active', true)
    
    // Apply filters
    if (filters.schoolId) {
      query = query.eq('school_id', filters.schoolId)
    }
    
    if (filters.minPrice !== undefined) {
      query = query.gte('price_min', filters.minPrice)
    }
    
    if (filters.maxPrice !== undefined) {
      query = query.lte('price_max', filters.maxPrice)
    }
    
    if (filters.maxDistance !== undefined) {
      query = query.lte('distance', filters.maxDistance)
    }
    
    if (filters.amenities && filters.amenities.length > 0) {
      // Filter by amenities (array contains)
      filters.amenities.forEach(amenity => {
        query = query.contains('amenities', [amenity])
      })
    }
    
    if (filters.roomTypes && filters.roomTypes.length > 0) {
      // Filter by room types - check if any room type in room_types JSONB array matches
      // Build filter conditions for each room type
      for (const roomType of filters.roomTypes) {
        // Use JSONB contains operator to check if room_types array contains an object with matching type
        query = query.filter('room_types', 'cs', JSON.stringify([{ type: roomType }]))
      }
    }
    
    if (filters.genderRestriction) {
      query = query.eq('gender_restriction', filters.genderRestriction)
    }
    
    if (filters.isAvailable !== undefined) {
      query = query.eq('is_available', filters.isAvailable)
    }
    
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%,address.ilike.%${filters.search}%`)
    }
    
    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price_min', { ascending: true })
          break
        case 'price_desc':
          query = query.order('price_min', { ascending: false })
          break
        case 'distance':
          query = query.order('distance', { ascending: true, nullsFirst: false })
          break
        case 'rating':
          query = query.order('rating', { ascending: false })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'popular':
          query = query.order('view_count', { ascending: false, nullsFirst: false })
          break
        default:
          query = query.order('created_at', { ascending: false })
      }
    } else {
      query = query.order('created_at', { ascending: false })
    }
    
    if (filters.limit) {
      query = query.limit(filters.limit)
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
    }
    
    const { data, error } = await query
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as Hostel[], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch hostels'
    }
  }
}

/**
 * Get a single hostel by ID
 */
export async function getHostelById(id: string): Promise<{
  data: Hostel | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('hostels')
      .select(`
        *,
        school:schools(id, name, location)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as Hostel, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch hostel'
    }
  }
}

/**
 * Get hostels by school ID
 */
export async function getHostelsBySchool(schoolId: string): Promise<{
  data: Hostel[] | null
  error: string | null
}> {
  return getHostels({ schoolId })
}

/**
 * Search hostels
 */
export async function searchHostels(searchQuery: string, filters: HostelFilters = {}): Promise<{
  data: Hostel[] | null
  error: string | null
}> {
  return getHostels({ ...filters, search: searchQuery })
}

/**
 * Autocomplete search for hostels and schools
 */
export async function autocompleteSearch(query: string, limit: number = 5): Promise<{
  data: { type: 'hostel' | 'school'; id: string; name: string; location?: string }[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    if (!query || query.length < 2) {
      return { data: [], error: null }
    }
    
    // Search hostels
    const { data: hostels, error: hostelsError } = await supabase
      .from('hostels')
      .select('id, name, address')
      .ilike('name', `%${query}%`)
      .eq('is_active', true)
      .limit(limit)
    
    // Search schools
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name, location')
      .ilike('name', `%${query}%`)
      .limit(limit)
    
    if (hostelsError || schoolsError) {
      return { data: null, error: hostelsError?.message || schoolsError?.message || 'Search failed' }
    }
    
    const results = [
      ...(hostels || []).map(h => ({ type: 'hostel' as const, id: h.id, name: h.name, location: h.address })),
      ...(schools || []).map(s => ({ type: 'school' as const, id: s.id, name: s.name, location: s.location }))
    ]
    
    return { data: results.slice(0, limit), error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to search'
    }
  }
}
