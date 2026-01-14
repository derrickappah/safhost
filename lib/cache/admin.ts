/**
 * Distributed cache for admin role checks using Vercel KV
 * Caches admin status per user to avoid redundant database queries
 * Falls back to in-memory cache if Vercel KV is not configured
 */

import { getCached, setCached, deleteCached, clearPattern } from './kv'

const CACHE_TTL_SECONDS = 5 * 60 // 5 minutes - admin status changes rarely

/**
 * Get cached admin status for a user
 */
export async function getCachedAdminStatus(userId: string): Promise<boolean | null> {
  const key = `admin:${userId}`
  return await getCached<boolean>(key)
}

/**
 * Set cached admin status for a user
 */
export async function setCachedAdminStatus(userId: string, isAdmin: boolean): Promise<void> {
  const key = `admin:${userId}`
  await setCached(key, isAdmin, CACHE_TTL_SECONDS)
}

/**
 * Clear cached admin status for a user
 */
export async function clearCachedAdminStatus(userId: string): Promise<void> {
  const key = `admin:${userId}`
  await deleteCached(key)
}

/**
 * Clear all cached admin statuses
 */
export async function clearAllCachedAdminStatuses(): Promise<void> {
  await clearPattern('admin:*')
}
