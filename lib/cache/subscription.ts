/**
 * Request-level cache for subscription data
 * Caches subscription data per user for 30 seconds to avoid redundant queries
 */

interface CacheEntry {
  data: any
  timestamp: number
}

const CACHE_TTL = 30 * 1000 // 30 seconds
const cache = new Map<string, CacheEntry>()

/**
 * Get cached subscription data for a user
 */
export function getCachedSubscription(userId: string): any | null {
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
  
  return entry.data
}

/**
 * Set cached subscription data for a user
 */
export function setCachedSubscription(userId: string, data: any): void {
  cache.set(userId, {
    data,
    timestamp: Date.now()
  })
}

/**
 * Clear cached subscription data for a user
 */
export function clearCachedSubscription(userId: string): void {
  cache.delete(userId)
}

/**
 * Clear all cached subscription data
 */
export function clearAllCachedSubscriptions(): void {
  cache.clear()
}

/**
 * Clean up expired cache entries (optional, can be called periodically)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now()
  for (const [userId, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      cache.delete(userId)
    }
  }
}
