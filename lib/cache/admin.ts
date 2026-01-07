/**
 * Request-level cache for admin role checks
 * Caches admin status per user for 5 minutes to avoid redundant database queries
 */

interface CacheEntry {
  isAdmin: boolean
  timestamp: number
}

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, CacheEntry>()

/**
 * Get cached admin status for a user
 */
export function getCachedAdminStatus(userId: string): boolean | null {
  const entry = cache.get(userId)
  
  if (!entry) {
    return null
  }
  
  // Check if cache entry is still valid
  const now = Date.now()
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(userId)
    return null
  }
  
  return entry.isAdmin
}

/**
 * Set cached admin status for a user
 */
export function setCachedAdminStatus(userId: string, isAdmin: boolean): void {
  cache.set(userId, {
    isAdmin,
    timestamp: Date.now()
  })
}

/**
 * Clear cached admin status for a user
 */
export function clearCachedAdminStatus(userId: string): void {
  cache.delete(userId)
}

/**
 * Clear all cached admin statuses
 */
export function clearAllCachedAdminStatuses(): void {
  cache.clear()
}
