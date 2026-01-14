import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      db: {
        schema: 'public',
      },
      global: {
        headers: {
          'x-client-info': 'safhost-nextjs',
        },
      },
    }
  )
}

/**
 * Singleton instance of service role client
 * Reused across all requests in the same serverless function instance
 * This prevents connection pool exhaustion when multiple users connect simultaneously
 */
let serviceRoleClientInstance: SupabaseClient | null = null

/**
 * Create a Supabase client with service role key (bypasses RLS)
 * Use only in server-side API routes that need to bypass RLS
 * 
 * This function implements a singleton pattern to reuse the same client instance
 * across multiple calls, preventing connection pool exhaustion.
 */
export function createServiceRoleClient(): SupabaseClient {
  // Return cached instance if it exists
  if (serviceRoleClientInstance) {
    return serviceRoleClientInstance
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  // Use regular URL (pooler can cause DNS issues in some environments)
  // The pooler URL format varies and may not be available in all environments
  const connectionUrl = supabaseUrl
  
  // Create and cache the client instance
  serviceRoleClientInstance = createSupabaseClient(connectionUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-client-info': 'safhost-service-role',
      },
    },
  })

  return serviceRoleClientInstance
}
