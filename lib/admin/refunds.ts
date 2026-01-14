'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'
import { isAdmin } from '../auth/middleware'
import { logAuditAction } from './audit'

/**
 * Process a refund for a subscription
 */
export async function processRefund(
  subscriptionId: string,
  reason?: string
): Promise<{
  error: string | null
}> {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { error: 'Admin access required' }
    }

    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { error: 'Authentication required' }
    }
    
    // Get subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*, payments(id, amount, status)')
      .eq('id', subscriptionId)
      .single()
    
    if (subError || !subscription) {
      return { error: 'Subscription not found' }
    }
    
    // Find successful payment
    const successfulPayment = (subscription.payments as any[])?.find(
      (p: any) => p.status === 'success'
    )
    
    if (!successfulPayment) {
      return { error: 'No successful payment found for this subscription' }
    }
    
    // Cancel subscription immediately (lose access)
    const { error: cancelError } = await supabase
      .from('subscriptions')
      .update({ 
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
    
    if (cancelError) {
      return { error: cancelError.message }
    }
    
    // Clear cache when subscription is cancelled
    if (subscription.user_id) {
      const { clearCachedSubscription } = await import('../cache/subscription')
      await clearCachedSubscription(subscription.user_id)
    }
    
    // Create refund record (for tracking)
    // Note: Actual refund would be processed through Paystack API
    // This just marks it in the system
    
    // Log audit action
    await logAuditAction('refund_subscription', 'subscription', subscriptionId, {
      amount: successfulPayment.amount,
      reason: reason || null,
    })
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to process refund',
    }
  }
}

/**
 * Manually add a subscription
 */
export async function manuallyAddSubscription(
  userId: string,
  planType: 'monthly' | 'semester',
  expiresAt: Date
): Promise<{
  data: any | null
  error: string | null
}> {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { data: null, error: 'Admin access required' }
    }

    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { data: null, error: 'Authentication required' }
    }
    
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan_type: planType,
        status: 'active',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    // Log audit action
    await logAuditAction('manual_add_subscription', 'subscription', subscription.id, {
      user_id: userId,
      plan_type: planType,
      expires_at: expiresAt.toISOString(),
    })
    
    return { data: subscription, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to add subscription',
    }
  }
}

/**
 * Manually remove a subscription
 */
export async function manuallyRemoveSubscription(
  subscriptionId: string,
  reason?: string
): Promise<{
  error: string | null
}> {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { error: 'Admin access required' }
    }

    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { error: 'Authentication required' }
    }
    
    // Get subscription to find user_id for cache invalidation
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('id', subscriptionId)
      .single()
    
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
    
    if (error) {
      return { error: error.message }
    }
    
    // Clear cache when subscription is cancelled
    if (subscription?.user_id) {
      const { clearCachedSubscription } = await import('../cache/subscription')
      await clearCachedSubscription(subscription.user_id)
    }
    
    // Log audit action
    await logAuditAction('manual_remove_subscription', 'subscription', subscriptionId, {
      reason: reason || null,
    })
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to remove subscription',
    }
  }
}
