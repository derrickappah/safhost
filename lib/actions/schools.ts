'use server'

import { createClient } from '../supabase/server'

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
 */
export async function getSchools(): Promise<{
  data: School[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as School[], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch schools'
    }
  }
}

/**
 * Get a single school by ID
 */
export async function getSchoolById(id: string): Promise<{
  data: School | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as School, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch school'
    }
  }
}

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
