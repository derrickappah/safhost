/**
 * Request-scoped cache for user data
 * Caches user by session token to avoid multiple getUser() calls in the same request cycle
 */

interface UserCacheEntry {
  user: any | null
  timestamp: number
}

const CACHE_TTL = 30 * 1000 // 30 seconds - short enough to avoid stale data
const cache = new Map<string, UserCacheEntry>()

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key)
    }
  }
}, 60000) // Clean up every minute

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
    
    const entry = cache.get(key)
    if (!entry) {
      return null
    }
    
    // Check if cache is still valid
    const now = Date.now()
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(key)
      return null
    }
    
    return entry.user
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
    
    cache.set(key, {
      user,
      timestamp: Date.now()
    })
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
    
    cache.delete(key)
  } catch {
    // If cookies() fails, silently ignore
  }
}
