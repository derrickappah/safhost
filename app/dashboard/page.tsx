import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import nextDynamic from 'next/dynamic'
import styles from './page.module.css'
import { getUser } from '@/lib/auth'
import { requireSubscription } from '@/lib/access/guard'
import { getActiveSubscription } from '@/lib/actions/subscriptions'
import { getFavorites } from '@/lib/actions/favorites'
import { getRecentlyViewed } from '@/lib/actions/views'
import { getUnreadCount } from '@/lib/notifications/get'
import { getFeaturedHostels } from '@/lib/actions/hostels'
import DashboardHeader from './DashboardHeader'
import FeaturedSection from './FeaturedSection'
import FavoritesSection from './FavoritesSection'
import RecommendationsLoader from './RecommendationsLoader'
import RecommendationsSkeleton from './RecommendationsSkeleton'

// Dynamically import non-critical sections to reduce initial bundle size
const RecentlyViewedSection = nextDynamic(() => import('./RecentlyViewedSection'), {
  ssr: true
})

// Quick Actions component (lightweight, can be in bundle)
const QuickActions = nextDynamic(() => import('./QuickActions'), {
  ssr: true
})

// Dashboard must be dynamic to prevent cross-user session leakage
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  // Check authentication
  const user = await getUser()
  if (!user) {
    redirect('/auth/login?redirect=/dashboard')
  }

  // Check subscription status (non-blocking)
  const { data: subscription } = await getActiveSubscription()
  const hasSubscription = !!(subscription && subscription.status === 'active')

  // Load critical data in parallel
  const [
    favoritesResult,
    unreadCountResult,
    recentlyViewedResult,
    featuredHostelsResult
  ] = await Promise.all([
    getFavorites().catch(() => ({ data: null, error: null })),
    getUnreadCount().catch(() => ({ data: 0, error: null })),
    getRecentlyViewed(10).catch(() => ({ data: null, error: null })),
    getFeaturedHostels(10).catch((error) => {
      console.error('[Dashboard] Error fetching featured hostels:', error)
      return { data: [], error: error instanceof Error ? error.message : 'Unknown error' }
    })
  ])


  const favorites = favoritesResult.data || []
  const unreadNotifications = unreadCountResult.data || 0
  const recentlyViewed = recentlyViewedResult.data || []
  const featuredHostels = featuredHostelsResult.data || []

  // Format favorites for display
  const formattedFavorites = favorites.map(fav => ({
    id: fav.hostel?.id || fav.hostel_id,
    name: fav.hostel?.name || 'Unknown',
    price: fav.hostel?.price_min || 0,
    rating: fav.hostel?.rating || 0,
    distance: null,
    image: fav.hostel?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
    favoriteId: fav.id
  }))

  // Format featured hostels for display
  const formattedFeaturedHostels = featuredHostels.map(hostel => ({
    id: hostel.id,
    name: hostel.name,
    price: hostel.price_min || 0,
    rating: hostel.rating || 0,
    distance: hostel.distance,
    image: hostel.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'
  }))

  const getUserName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  return (
    <div className={styles.container}>
      <div className={styles.scrollContent}>
        {/* Header */}
        <DashboardHeader
          userName={getUserName()}
          unreadNotifications={unreadNotifications}
          subscription={subscription}
        />

        {/* Quick Actions */}
        <QuickActions />

        {/* Featured Section */}
        <FeaturedSection featuredHostels={formattedFeaturedHostels} hasSubscription={hasSubscription} />

        {/* Favorites Section */}
        <FavoritesSection favorites={formattedFavorites} hasSubscription={hasSubscription} />

        {/* Recommended Hostels - Load asynchronously with Suspense */}
        <Suspense fallback={<RecommendationsSkeleton />}>
          <RecommendationsLoader />
        </Suspense>

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <RecentlyViewedSection recentlyViewed={recentlyViewed} hasSubscription={hasSubscription} />
        )}

        <div style={{ height: '120px' }} />
      </div>
    </div>
  )
}
