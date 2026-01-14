import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { getActiveSubscription } from '@/lib/actions/subscriptions'
import SubscribePageClient from './SubscribePageClient'

export const revalidate = 0 // Force dynamic rendering to always check for latest subscription status

export default async function SubscribePage() {
  // Middleware already handles auth check, but we need the user object
  const user = await getUser()
  if (!user) {
    redirect('/auth/login?redirect=/subscribe')
  }

  // Check if user already has an active subscription
  const { data: subscription } = await getActiveSubscription()
  if (subscription && subscription.status === 'active') {
    // Also check if subscription is not expired
    const now = new Date()
    const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null
    const isNotExpired = !expiresAt || expiresAt > now
    
    if (isNotExpired) {
      // User already has an active, non-expired subscription, redirect to dashboard
      redirect('/dashboard')
    }
  }

  return <SubscribePageClient user={user} />
}
