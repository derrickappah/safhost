'use server'

import { getActiveSubscription } from '../actions/subscriptions'

/**
 * @deprecated Anonymous subscriptions are no longer supported. Use authenticated user subscriptions only.
 * Get subscription ID from cookies (for anonymous users)
 */
export async function getSubscriptionFromCookies(): Promise<{
  subscriptionId: string | null
  phone: string | null
  email: string | null
}> {
  // Return null values as anonymous subscriptions are no longer supported
  return {
    subscriptionId: null,
    phone: null,
    email: null
  }
}

/**
 * @deprecated Anonymous subscriptions are no longer supported. Use authenticated user subscriptions only.
 * Set subscription cookies (for anonymous users)
 */
export async function setSubscriptionCookies(
  subscriptionId: string,
  phone: string,
  email: string
): Promise<void> {
  // No-op: anonymous subscriptions are no longer supported
  return
}

/**
 * Clear subscription cookies
 */
export async function clearSubscriptionCookies(): Promise<void> {
  // No-op: cookies are no longer used
  return
}

/**
 * Check if user has active subscription (authenticated users only)
 */
export async function checkSubscriptionAccess(): Promise<{
  hasAccess: boolean
  subscriptionId: string | null
  isAuthenticated: boolean
}> {
  // Check authenticated user subscription only
  const { getUser } = await import('../auth')
  const user = await getUser()

  if (!user) {
    return {
      hasAccess: false,
      subscriptionId: null,
      isAuthenticated: false
    }
  }

  const { data: subscription, error } = await getActiveSubscription()

  // getActiveSubscription already filters for active and non-expired subscriptions
  // So if it returns a subscription, the user has access
  if (subscription) {
    return {
      hasAccess: true,
      subscriptionId: subscription.id,
      isAuthenticated: true
    }
  }

  // If there was an error, log it for debugging
  if (error) {
    console.error('Subscription access check error:', error)
  }

  return {
    hasAccess: false,
    subscriptionId: null,
    isAuthenticated: true
  }
}
