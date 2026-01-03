'use server'

import { checkSubscriptionAccess } from '../auth/subscription'

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const { hasAccess } = await checkSubscriptionAccess()
  return hasAccess
}

/**
 * Get subscription ID if user has active subscription
 */
export async function getSubscriptionId(): Promise<string | null> {
  const { subscriptionId } = await checkSubscriptionAccess()
  return subscriptionId
}
