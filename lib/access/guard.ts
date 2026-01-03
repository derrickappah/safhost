'use server'

import { redirect } from 'next/navigation'
import { hasActiveSubscription } from './check'

/**
 * Guard a route - redirect to subscribe if no active subscription
 */
export async function requireSubscription() {
  const hasAccess = await hasActiveSubscription()
  
  if (!hasAccess) {
    redirect('/subscribe')
  }
}

/**
 * Guard admin routes - redirect if not admin
 */
export async function requireAdmin() {
  const { isAdmin } = await import('../auth/middleware')
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/')
  }
}
