'use server'

import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { createClient } from '../supabase/server'
import { revalidatePath } from 'next/cache'
import { checkSubscriptionAccess } from '../auth/subscription'

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
  room_types: any
  is_active: boolean
  created_at: string
  updated_at: string
  view_count: number | null
  gender_restriction: string | null
  is_available: boolean
  featured: boolean
  categories: string[]
  school?: {
    id: string
    name: string
    location: string
    latitude: number | null
    longitude: number | null
    logo_url: string | null
  }
}

/**
 * Get all hostels with optional filters
 * Uses React cache() for request deduplication and unstable_cache for time-based caching
 */
const getHostelsImpl = async (filters: HostelFilters = {}): Promise<{
  data: Hostel[] | null
  error: string | null
}> => {
  try {
    // Check subscription access
    const { hasAccess } = await checkSubscriptionAccess()
    if (!hasAccess) {
      return { data: null, error: 'Subscription required to view hostels' }
    }

    const supabase = await createClient()
    
    // Optimized query - only fetch essential fields for list view
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
        school:schools(id, name, location, latitude, longitude, logo_url)
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
    
    // Type assertion and numeric conversion for coordinates
    const formattedData = (data || []).map(hostel => ({
      ...hostel,
      latitude: hostel.latitude ? Number(hostel.latitude) : null,
      longitude: hostel.longitude ? Number(hostel.longitude) : null,
      price_min: Number(hostel.price_min),
      price_max: hostel.price_max ? Number(hostel.price_max) : null,
      rating: Number(hostel.rating),
      // Handle school being returned as array or object
      school: Array.isArray(hostel.school) ? hostel.school[0] : hostel.school
    }))

    return { data: formattedData as unknown as Hostel[], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch hostels'
    }
  }
}

export const getHostels = cache(getHostelsImpl)

/**
 * Get cached hostels with time-based revalidation (60 seconds)
 * Use this for public pages that don't need real-time data
 */
export const getCachedHostels = unstable_cache(
  async (filters: HostelFilters = {}) => {
    return getHostels(filters)
  },
  ['hostels-list'],
  { revalidate: 60 }
)

/**
 * Get featured hostels
 * Uses React cache() for request deduplication
 */
export const getFeaturedHostels = cache(async (limit: number = 10): Promise<{
  data: Hostel[] | null
  error: string | null
}> => {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
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
        school:schools(id, name, location, latitude, longitude, logo_url)
      `)
      .eq('is_active', true)
      .eq('featured', true)
      .eq('is_available', true)
      .order('rating', { ascending: false })
      .order('view_count', { ascending: false, nullsFirst: false })
      .limit(limit)
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as unknown as Hostel[], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch featured hostels'
    }
  }
})

/**
 * Get a single hostel by ID
 * Uses React cache() for request deduplication
 */
export const getHostelById = cache(async (id: string): Promise<{
  data: Hostel | null
  error: string | null
}> => {
  try {
    // Check subscription access
    const { hasAccess } = await checkSubscriptionAccess()
    if (!hasAccess) {
      return { data: null, error: 'Subscription required to view hostel details' }
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('hostels')
      .select(`
        id,
        school_id,
        name,
        description,
        price_min,
        price_max,
        rating,
        review_count,
        distance,
        address,
        landlord_name,
        landlord_phone,
        latitude,
        longitude,
        images,
        amenities,
        room_types,
        is_active,
        created_at,
        updated_at,
        view_count,
        gender_restriction,
        is_available,
        featured,
        categories,
        school:schools(id, name, location, latitude, longitude, logo_url)
      `)
      .eq('id', id)
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    // Convert string coordinates/prices to numbers
    const formattedHostel = {
      ...data,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      price_min: Number(data.price_min),
      price_max: data.price_max ? Number(data.price_max) : null,
      rating: Number(data.rating),
    }

    return { data: formattedHostel as unknown as Hostel, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch hostel'
    }
  }
})

/**
 * Get hostels by school ID
 * Uses React cache() for request deduplication
 */
export const getHostelsBySchool = cache(async (schoolId: string): Promise<{
  data: Hostel[] | null
  error: string | null
}> => {
  return getHostels({ schoolId })
})

/**
 * Get similar hostels based on a reference hostel
 * Uses React cache() for request deduplication
 */
export const getSimilarHostels = cache(async (hostelId: string, limit: number = 6): Promise<{
  data: Hostel[] | null
  error: string | null
}> => {
  try {
    const supabase = await createClient()
    
    // First, get the reference hostel
    const { data: referenceHostel, error: refError } = await supabase
      .from('hostels')
      .select('school_id, price_min, price_max, address, amenities, rating')
      .eq('id', hostelId)
      .single()
    
    if (refError || !referenceHostel) {
      return { data: [], error: null }
    }
    
    // Build query for similar hostels (excluding the current one)
    let query = supabase
      .from('hostels')
      .select(`
        id,
        school_id,
        name,
        description,
        price_min,
        price_max,
        rating,
        review_count,
        distance,
        address,
        landlord_name,
        landlord_phone,
        latitude,
        longitude,
        images,
        amenities,
        room_types,
        is_active,
        created_at,
        updated_at,
        view_count,
        gender_restriction,
        is_available,
        featured,
        categories,
        school:schools(id, name, location, latitude, longitude, logo_url)
      `)
      .eq('is_active', true)
      .neq('id', hostelId)
    
    // Filter by same school (highest priority)
    if (referenceHostel.school_id) {
      query = query.eq('school_id', referenceHostel.school_id)
    }
    
    // Filter by similar price range (±30%)
    if (referenceHostel.price_min) {
      const priceRange = referenceHostel.price_min * 0.3
      query = query
        .gte('price_min', referenceHostel.price_min - priceRange)
        .lte('price_min', referenceHostel.price_min + priceRange)
    }
    
    // Order by: same school first, then by rating, then by view_count
    query = query
      .order('rating', { ascending: false, nullsFirst: false })
      .order('view_count', { ascending: false, nullsFirst: false })
      .limit(limit)
    
    const { data, error } = await query
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    // If we don't have enough results, get more from featured hostels
    if (data && data.length < limit) {
      const remaining = limit - data.length
      const existingIds = new Set([hostelId, ...data.map(h => h.id)])
      
      // Try to get featured hostels
      const { data: allFeatured } = await supabase
        .from('hostels')
        .select(`
          *,
          school:schools(id, name, location, latitude, longitude, logo_url)
        `)
        .eq('is_active', true)
        .eq('featured', true)
        .order('rating', { ascending: false })
        .limit(remaining * 2) // Get more to filter
      
      if (allFeatured) {
        const additionalData = allFeatured
          .filter(h => !existingIds.has(h.id))
          .slice(0, remaining)
        
        if (additionalData.length > 0) {
          data.push(...additionalData)
        }
      }
    }
    
    // Type assertion: Supabase returns school as array but it's actually a single object in practice
    return { data: (data || []) as unknown as Hostel[], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch similar hostels'
    }
  }
})

/**
 * Search hostels
 * Uses React cache() for request deduplication
 */
const searchHostelsImpl = async (searchQuery: string, filters: HostelFilters = {}): Promise<{
  data: Hostel[] | null
  error: string | null
}> => {
  return getHostels({ ...filters, search: searchQuery })
}

export const searchHostels = cache(searchHostelsImpl)

/**
 * Get public hostel previews for landing page
 * No subscription check required - shows featured hostels publicly
 */
export const getPublicHostelPreviews = cache(async (limit: number = 10): Promise<{
  data: Hostel[] | null
  error: string | null
}> => {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
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
        school:schools(id, name, location, latitude, longitude, logo_url)
      `)
      .eq('is_active', true)
      .eq('featured', true)
      .eq('is_available', true)
      .order('rating', { ascending: false })
      .order('view_count', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) {
      return { data: null, error: error.message }
    }

    return { data: data as unknown as Hostel[], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch hostel previews'
    }
  }
})

/**
 * Autocomplete search for hostels and schools
 * Returns combined results for quick search suggestions
 */
export interface AutocompleteResult {
  type: 'hostel' | 'school'
  id: string
  name: string
  location?: string
}

export const autocompleteSearch = cache(async (
  query: string,
  limit: number = 5
): Promise<{
  data: AutocompleteResult[] | null
  error: string | null
}> => {
  try {
    if (!query || query.length < 2) {
      return { data: [], error: null }
    }

    const supabase = await createClient()
    const results: AutocompleteResult[] = []

    // Search hostels
    const hostelLimit = Math.ceil(limit / 2)
    const { data: hostels, error: hostelError } = await supabase
      .from('hostels')
      .select(`
        id,
        name,
        address,
        school:schools(location)
      `)
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
      .limit(hostelLimit)

    if (!hostelError && hostels) {
      hostels.forEach((hostel: any) => {
        results.push({
          type: 'hostel',
          id: hostel.id,
          name: hostel.name,
          location: hostel.school?.location || hostel.address,
        })
      })
    }

    // Search schools
    const schoolLimit = limit - results.length
    if (schoolLimit > 0) {
      const { data: schools, error: schoolError } = await supabase
        .from('schools')
        .select('id, name, location')
        .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(schoolLimit)

      if (!schoolError && schools) {
        schools.forEach((school: any) => {
          results.push({
            type: 'school',
            id: school.id,
            name: school.name,
            location: school.location,
          })
        })
      }
    }

    // Limit total results
    return { data: results.slice(0, limit), error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to perform autocomplete search',
    }
  }
})
