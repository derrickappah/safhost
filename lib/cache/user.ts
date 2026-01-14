/**
 * Distributed cache for user data using Vercel KV
 * Caches user by session token to avoid multiple getUser() calls
 * Falls back to in-memory cache if Vercel KV is not configured
 */

import { getCached, setCached, deleteCached } from './kv'

const CACHE_TTL_SECONDS = 30 // 30 seconds - short enough to avoid stale data

/**
 * Generate a cache key from cookies
 * This allows multiple server actions in the same request to share cached user
 */
function getCacheKey(cookies: any[]): string {
  // Use auth token cookie as key (if available)
  const authCookie = cookies.find(c => c.name.includes('auth-token') || c.name.includes('sb-'))
  if (authCookie) {
    return `user:${authCookie.value.substring(0, 20)}` // Use first 20 chars as key
  }
  // Fallback: use all cookie names as key
  return `user:${cookies.map(c => c.name).sort().join(',')}`
}

/**
 * Get cached user for current request
 */
export async function getCachedUser(): Promise<any | null> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const cookieArray = cookieStore.getAll()
    const key = getCacheKey(cookieArray)
    
    const cached = await getCached<any>(key)
    return cached
  } catch {
    // If cookies() fails (e.g., in middleware), return null
    return null
  }
}

/**
 * Set cached user for current request
 */
export async function setCachedUser(user: any | null): Promise<void> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const cookieArray = cookieStore.getAll()
    const key = getCacheKey(cookieArray)
    
    await setCached(key, user, CACHE_TTL_SECONDS)
  } catch {
    // If cookies() fails, silently ignore
  }
}

/**
 * Clear cached user for current request
 */
export async function clearCachedUser(): Promise<void> {
  try {
    const { cookies } = await import('next/headers')
    const cookieStore = await cookies()
    const cookieArray = cookieStore.getAll()
    const key = getCacheKey(cookieArray)
    
    await deleteCached(key)
  } catch {
    // If cookies() fails, silently ignore
  }
}
