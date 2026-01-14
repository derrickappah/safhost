/**
 * Cache warming utilities
 * Pre-populates cache for popular pages to improve performance
 */

import { getPublicHostelPreviews, getFeaturedHostels } from '../actions/hostels'

/**
 * Warm cache for landing page
 */
export async function warmLandingPageCache(): Promise<void> {
  try {
    // Pre-fetch public hostel previews
    await getPublicHostelPreviews(3)
    console.log('[Cache] Landing page cache warmed')
  } catch (error) {
    console.error('[Cache] Failed to warm landing page cache:', error)
  }
}

/**
 * Warm cache for dashboard
 */
export async function warmDashboardCache(): Promise<void> {
  try {
    // Pre-fetch featured hostels
    await getFeaturedHostels(10)
    console.log('[Cache] Dashboard cache warmed')
  } catch (error) {
    console.error('[Cache] Failed to warm dashboard cache:', error)
  }
}

/**
 * Warm all popular caches
 */
export async function warmAllCaches(): Promise<void> {
  await Promise.all([
    warmLandingPageCache(),
    warmDashboardCache(),
  ])
  console.log('[Cache] All caches warmed')
}
