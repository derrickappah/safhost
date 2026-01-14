/**
 * Distributed cache for subscription data using Vercel KV
 * Caches subscription data per user to avoid redundant queries
 * Falls back to in-memory cache if Vercel KV is not configured
 */

import { getCached, setCached, deleteCached, clearPattern } from './kv'

const CACHE_TTL_SECONDS = 300 // 5 minutes - optimized for performance while maintaining freshness

/**
 * Get cached subscription data for a user
 */
export async function getCachedSubscription(userId: string): Promise<any | null> {
  const key = `subscription:${userId}`
  return await getCached<any>(key)
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
