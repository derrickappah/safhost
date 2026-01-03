'use server'

import { createClient } from '../supabase/server'
import { createClient as createBrowserClient } from '../supabase/client'

export interface SignUpInput {
  email: string
  password: string
  phone?: string
  name?: string
}

export interface SignInInput {
  email: string
  password: string
}

/**
 * Sign up a new user
 */
export async function signUp(input: SignUpInput): Promise<{
  data: { user: any } | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          phone: input.phone,
          name: input.name
        }
      }
    })
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: { user: data.user }, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to sign up'
    }
  }
}

/**
 * Sign in a user
 */
export async function signIn(input: SignInInput): Promise<{
  data: { user: any } | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password
    })
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: { user: data.user }, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to sign in'
    }
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return { error: error.message }
    }
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to sign out'
    }
  }
}

// Note: Client-side functions moved to separate file to avoid server action conflicts
