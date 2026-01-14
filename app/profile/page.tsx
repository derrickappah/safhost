import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { isAdmin } from '@/lib/auth/middleware'
import { getActiveSubscription } from '@/lib/actions/subscriptions'
import { getFavorites } from '@/lib/actions/favorites'
import { getViewedCount } from '@/lib/actions/views'
import { getContactedCount } from '@/lib/actions/contacts'
import { getPaymentHistory, getProfile } from '@/lib/actions/profile'
import { getSchools } from '@/lib/actions/schools'
import ProfilePageClient from './ProfilePageClient'

// Revalidate every 60 seconds for fresh data
export const revalidate = 60

export default async function ProfilePage() {
  // Check authentication
  const user = await getUser()
  if (!user) {
    redirect('/auth/login?redirect=/profile')
  }

  // Load all data in parallel
  const [
    subscriptionResult,
    favoritesResult,
    viewedCountResult,
    contactedCountResult,
    paymentsResult,
    schoolsResult,
    profileResult
  ] = await Promise.all([
    getActiveSubscription().catch(() => ({ data: null, error: null })),
    getFavorites().catch(() => ({ data: null, error: null })),
    getViewedCount().catch(() => ({ data: 0, error: null })),
    getContactedCount().catch(() => ({ data: 0, error: null })),
    getPaymentHistory().catch(() => ({ data: [], error: null })),
    getSchools().catch(() => ({ data: null, error: null })),
    getProfile().catch(() => ({ data: null, error: null }))
  ])

  const subscription = subscriptionResult.data
  const favorites = favoritesResult.data || []
  const viewedCount = viewedCountResult.data ?? 0
  const contactedCount = contactedCountResult.data ?? 0
  const paymentHistory = paymentsResult.data || []
  const schools = schoolsResult.data || []
  const profile = profileResult.data
  const selectedSchool = profile?.school_id || null
  
  // Check if user is admin
  const isUserAdmin = await isAdmin()

  return (
    <ProfilePageClient
      user={user}
      subscription={subscription}
      favoritesCount={favorites.length}
      viewedCount={viewedCount}
      contactedCount={contactedCount}
      paymentHistory={paymentHistory}
      schools={schools}
      profile={profile}
      selectedSchool={selectedSchool}
      isAdmin={isUserAdmin}
    />
  )
}
