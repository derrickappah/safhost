/**
 * Vercel KV cache utility functions
 * Provides distributed caching across serverless function instances
 * Falls back to in-memory cache if Vercel KV is not configured
 */

let kv: any = null
try {
  kv = require('@vercel/kv').kv
} catch {
  // @vercel/kv not installed or not configured - will use fallback
}

// Fallback in-memory cache if KV is not available
const fallbackCache = new Map<string, { value: any; expires: number; staleExpires: number; tags?: string[] }>()
// Tag index for cache invalidation
const tagIndex = new Map<string, Set<string>>() // tag -> Set of cache keys

// Check if Vercel KV is configured
const isKVConfigured = (): boolean => {
  try {
    return !!(
      process.env.KV_URL ||
      process.env.KV_REST_API_URL ||
      (process.env.KV_REST_API_TOKEN && process.env.KV_REST_API_READ_ONLY_TOKEN)
    )
  } catch {
    return false
  }
}

const kvAvailable = isKVConfigured()

/**
 * Get cached value by key
 * @param key Cache key
 * @returns Cached value or null if not found/expired
 */
export async function getCached<T = any>(key: string): Promise<T | null> {
  try {
    if (kvAvailable && kv) {
      const value = await kv.get<T>(key)
      return value
    } else {
      // Fallback to in-memory cache
      const entry = fallbackCache.get(key)
      if (!entry) {
        return null
      }
      
      // Check if expired
      if (Date.now() > entry.expires) {
        fallbackCache.delete(key)
        return null
      }
      
      return entry.value as T
    }
  } catch (error) {
    console.error(`[Cache] Error getting key ${key}:`, error)
    // Fallback to in-memory cache on error
    const entry = fallbackCache.get(key)
    if (entry && Date.now() <= entry.expires) {
      return entry.value as T
    }
    return null
  }
}

/**
 * Get cached value with stale-while-revalidate support
 * Returns stale data immediately if available, even if expired
 * @param key Cache key
 * @param staleTtlSeconds Additional TTL for stale data (default: same as fresh TTL)
 * @returns Object with value (may be stale) and isStale flag
 */
export async function getCachedWithStale<T = any>(
  key: string,
  staleTtlSeconds?: number
): Promise<{ value: T | null; isStale: boolean }> {
  try {
    if (kvAvailable && kv) {
      const value = await kv.get<T>(key)
      // With KV, we can't easily track stale state, so assume not stale if found
      return { value, isStale: false }
    } else {
      // Fallback to in-memory cache
      const entry = fallbackCache.get(key)
      if (!entry) {
        return { value: null, isStale: false }
      }
      
      const now = Date.now()
      const isStale = now > entry.expires && now <= entry.staleExpires
      const isValid = now <= entry.expires
      
      if (isValid || isStale) {
        return { value: entry.value as T, isStale }
      }
      
      // Expired beyond stale period, remove it
      fallbackCache.delete(key)
      return { value: null, isStale: false }
    }
  } catch (error) {
    console.error(`[Cache] Error getting key ${key}:`, error)
    const entry = fallbackCache.get(key)
    if (entry) {
      const now = Date.now()
      const isStale = now > entry.expires && now <= entry.staleExpires
      if (now <= entry.staleExpires) {
        return { value: entry.value as T, isStale }
      }
    }
    return { value: null, isStale: false }
  }
}

/**
 * Set cached value with TTL
 * @param key Cache key
 * @param value Value to cache
 * @param ttlSeconds Time to live in seconds
 * @param staleTtlSeconds Additional TTL for stale data (default: same as fresh TTL)
 * @param tags Optional tags for cache invalidation
 */
export async function setCached(
  key: string,
  value: any,
  ttlSeconds: number,
  staleTtlSeconds?: number,
  tags?: string[]
): Promise<void> {
  try {
    if (kvAvailable && kv) {
      await kv.set(key, value, { ex: ttlSeconds })
    } else {
      // Fallback to in-memory cache
      const now = Date.now()
      const expires = now + ttlSeconds * 1000
      const staleExpires = now + (staleTtlSeconds || ttlSeconds) * 1000
      fallbackCache.set(key, { value, expires, staleExpires, tags })
      
      // Update tag index
      if (tags) {
        tags.forEach(tag => {
          if (!tagIndex.has(tag)) {
            tagIndex.set(tag, new Set())
          }
          tagIndex.get(tag)!.add(key)
        })
      }
      
      // Clean up expired entries periodically
      if (fallbackCache.size > 1000) {
        for (const [k, entry] of fallbackCache.entries()) {
          if (Date.now() > entry.staleExpires) {
            fallbackCache.delete(k)
          }
        }
      }
    }
  } catch (error) {
    console.error(`[Cache] Error setting key ${key}:`, error)
    // Silently fail - caching is not critical
  }
}

/**
 * Delete cached value
 * @param key Cache key to delete
 */
export async function deleteCached(key: string): Promise<void> {
  try {
    if (kvAvailable && kv) {
      await kv.del(key)
    } else {
      fallbackCache.delete(key)
    }
  } catch (error) {
    console.error(`[Cache] Error deleting key ${key}:`, error)
  }
}

/**
 * Clear all cached values matching a pattern
 * Note: This is a simple implementation. For production, consider using SCAN for better performance
 * @param pattern Pattern to match (supports wildcards like 'user:*')
 */
export async function clearPattern(pattern: string): Promise<void> {
  try {
    if (kvAvailable) {
      // Vercel KV doesn't support pattern matching directly
      // This would require SCAN which is not available in the basic KV API
      // For now, we'll log a warning
      console.warn('[Cache] Pattern clearing not fully supported with Vercel KV. Consider using specific keys.')
    } else {
      // Fallback: clear matching keys from in-memory cache
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$')
      for (const key of fallbackCache.keys()) {
        if (regex.test(key)) {
          fallbackCache.delete(key)
        }
      }
    }
  } catch (error) {
    console.error(`[Cache] Error clearing pattern ${pattern}:`, error)
  }
}

/**
 * Invalidate cache by tag
 * @param tag Tag to invalidate
 */
export async function invalidateByTag(tag: string): Promise<void> {
  try {
    if (kvAvailable) {
      // Vercel KV doesn't support tags directly
      // In production, you'd need to maintain a separate tag index
      console.warn('[Cache] Tag invalidation not fully supported with Vercel KV. Consider using specific keys.')
    } else {
      // Fallback: invalidate from in-memory cache
      const keys = tagIndex.get(tag)
      if (keys) {
        keys.forEach(key => {
          fallbackCache.delete(key)
        })
        tagIndex.delete(tag)
      }
    }
  } catch (error) {
    console.error(`[Cache] Error invalidating tag ${tag}:`, error)
  }
}

/**
 * Invalidate cache by multiple tags
 * @param tags Tags to invalidate
 */
export async function invalidateByTags(tags: string[]): Promise<void> {
  await Promise.all(tags.map(tag => invalidateByTag(tag)))
}

/**
 * Check if cache is available (KV configured)
 */
export function isCacheAvailable(): boolean {
  return kvAvailable
}
