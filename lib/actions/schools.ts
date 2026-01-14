'use server'

import { cache } from 'react'
import { createClient } from '../supabase/server'
import { getCached, setCached } from '../cache/kv'

export interface School {
  id: string
  name: string
  location: string
  latitude: number | null
  longitude: number | null
  logo_url: string | null
  created_at: string
  updated_at: string
}

/**
 * Get all schools
 * Uses KV cache with 1 hour TTL (schools change rarely)
 */
export const getSchools = cache(async (): Promise<{
  data: School[] | null
  error: string | null
}> => {
  try {
    // Check cache first
    const cacheKey = 'schools:all'
    const cached = await getCached<School[]>(cacheKey)
    if (cached !== null) {
      return { data: cached, error: null }
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    // Cache for 1 hour (3600 seconds)
    await setCached(cacheKey, data, 3600)
    
    return { data: data as School[], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch schools'
    }
  }
})

/**
 * Get a single school by ID
 * Uses KV cache with 1 hour TTL
 */
export const getSchoolById = cache(async (id: string): Promise<{
  data: School | null
  error: string | null
}> => {
  try {
    // Check cache first
    const cacheKey = `school:${id}`
    const cached = await getCached<School>(cacheKey)
    if (cached !== null) {
      return { data: cached, error: null }
    }

    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    // Cache for 1 hour
    await setCached(cacheKey, data, 3600)
    
    return { data: data as School, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch school'
    }
  }
})

/**
 * Search schools by name or location
 */
export async function searchSchools(query: string): Promise<{
  data: School[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
      .order('name', { ascending: true })
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as School[], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to search schools'
    }
  }
}
