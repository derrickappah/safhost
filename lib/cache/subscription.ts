/**
 * Distributed cache for subscription data using Vercel KV
 * Caches subscription data per user to avoid redundant queries
 * Falls back to in-memory cache if Vercel KV is not configured
 */

import { getCached, setCached, deleteCached, clearPattern } from './kv'

const CACHE_TTL_SECONDS = 300 // 5 minutes - optimized for performance while maintaining freshness

/**
 * Get cached subscription data for a user
 * Validates expiration before returning cached value
 */
export async function getCachedSubscription(userId: string): Promise<any | null> {
  const key = `subscription:${userId}`
  const cached = await getCached<any>(key)
  
  // If cached value exists, validate expiration
  if (cached !== null && cached !== undefined) {
    // If it's a subscription object, check if it's expired
    if (typeof cached === 'object' && cached.expires_at) {
      const now = new Date()
      const expiresAt = new Date(cached.expires_at)
      
      // If expired, clear cache and return null
      if (expiresAt <= now) {
        await deleteCached(key)
        return null
      }
    }
    
    // If expires_at is NULL, treat as expired/invalid
    if (typeof cached === 'object' && cached.status === 'active' && !cached.expires_at) {
      await deleteCached(key)
      return null
    }
  }
  
  return cached
}

/**
 * Set cached subscription data for a user
 */
export async function setCachedSubscription(userId: string, data: any): Promise<void> {
  const key = `subscription:${userId}`
  await setCached(key, data, CACHE_TTL_SECONDS)
}

/**
 * Clear cached subscription data for a user
 */
export async function clearCachedSubscription(userId: string): Promise<void> {
  const key = `subscription:${userId}`
  await deleteCached(key)
}

/**
 * Clear all cached subscription data
 */
export async function clearAllCachedSubscriptions(): Promise<void> {
  await clearPattern('subscription:*')
}
