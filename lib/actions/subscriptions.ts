'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'

export interface Subscription {
  id: string
  user_id: string | null
  phone: string | null
  email: string | null
  plan_type: 'monthly' | 'semester'
  status: 'pending' | 'active' | 'expired' | 'cancelled'
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface CreateSubscriptionInput {
  userId: string
  phone?: string
  email?: string
  planType: 'monthly' | 'semester'
}

/**
 * Create a new subscription (requires authenticated user)
 */
export async function createSubscription(input: CreateSubscriptionInput): Promise<{
  data: Subscription | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    console.log('createSubscription - user:', user?.id, 'input.userId:', input.userId)
    
    // Require authenticated user
    if (!user || !input.userId) {
      console.error('createSubscription - Authentication failed:', { user: !!user, userId: input.userId })
      return { data: null, error: 'Authentication required to create subscription' }
    }
    
    // Ensure user_id matches authenticated user
    if (input.userId !== user.id) {
      console.error('createSubscription - User ID mismatch:', { inputUserId: input.userId, authUserId: user.id })
      return { data: null, error: 'User ID mismatch' }
    }
    
    // Calculate expiration date
    const expiresAt = new Date()
    if (input.planType === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1)
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 4) // 4 months for semester
    }
    
    const subscriptionData: any = {
      plan_type: input.planType,
      status: 'pending', // Will be activated after payment
      expires_at: expiresAt.toISOString(),
      user_id: input.userId, // Always require user_id
      phone: input.phone || null,
      email: input.email || null
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single()
    
    if (error) {
      console.error('Supabase insert error:', error)
      console.error('Subscription data:', subscriptionData)
      return { data: null, error: error.message }
    }
    
    return { data: data as Subscription, error: null }
  } catch (error) {
    console.error('createSubscription catch error:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create subscription'
    }
  }
}

/**
 * Get active subscription for authenticated user only
 * Also checks for pending subscriptions with successful payments
 */
export async function getActiveSubscription(): Promise<{
  data: Subscription | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { data: null, error: 'Authentication required' }
    }
    
    // First, check for active subscriptions
    // Check for active status first, then verify expiration
    const { data: activeSubs, error: activeError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
    
    if (activeSubs && activeSubs.length > 0) {
      // Find the first non-expired subscription
      // IMPORTANT: Only return non-expired subscriptions to match RLS policy requirements
      const now = new Date()
      const activeSub = activeSubs.find(sub => {
        if (!sub.expires_at) return true // If no expiration date, consider it active
        return new Date(sub.expires_at) > now
      })
      
      // Only return if we found a non-expired subscription
      if (activeSub) {
        return { data: activeSub as Subscription, error: null }
      }
      
      // If all subscriptions are expired, log and return null
      console.warn('All active subscriptions are expired:', {
        count: activeSubs.length,
        mostRecent: {
          id: activeSubs[0].id,
          status: activeSubs[0].status,
          expires_at: activeSubs[0].expires_at,
          now: now.toISOString()
        }
      })
    }
    
    // If no active subscription, check for pending subscriptions with successful payments
    const { data: pendingSubs, error: pendingError } = await supabase
      .from('subscriptions')
      .select(`
        *,
        payments!inner(id, status)
      `)
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .eq('payments.status', 'success')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (pendingSubs && pendingSubs.length > 0) {
      // Found a pending subscription with successful payment - activate it
      const pendingSub = pendingSubs[0] as any
      console.log('Found pending subscription with successful payment, activating:', pendingSub.id)
      
      const { data: activated, error: activateError } = await activateSubscription(pendingSub.id, false)
      
      if (activated) {
        return { data: activated, error: null }
      } else {
        console.error('Failed to activate pending subscription:', activateError)
      }
    }
    
    if (activeError && activeError.code !== 'PGRST116') {
      return { data: null, error: activeError.message }
    }
    
    return { data: null, error: null }
  } catch (error) {
    console.error('getActiveSubscription error:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to get subscription'
    }
  }
}

/**
 * Check if user has active subscription
 */
export async function hasActiveSubscription(): Promise<boolean> {
  const { data } = await getActiveSubscription()
  return data !== null
}

/**
 * Activate a subscription (called after successful payment)
 * @param subscriptionId - The subscription ID to activate
 * @param useServiceRole - If true, uses service role key to bypass RLS (for webhooks/callbacks)
 */
export async function activateSubscription(
  subscriptionId: string,
  useServiceRole: boolean = false
): Promise<{
  data: Subscription | null
  error: string | null
}> {
  try {
    let supabase
    if (useServiceRole) {
      const { createServiceRoleClient } = await import('../supabase/server')
      supabase = createServiceRoleClient()
    } else {
      supabase = await createClient()
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('id', subscriptionId)
      .select()
      .single()
    
    if (error) {
      console.error('Subscription activation error:', error)
      return { data: null, error: error.message }
    }
    
    console.log('Subscription activated:', { subscriptionId, status: data?.status })
    return { data: data as Subscription, error: null }
  } catch (error) {
    console.error('Subscription activation exception:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to activate subscription'
    }
  }
}

/**
 * Get subscription by ID
 */
export async function getSubscriptionById(id: string): Promise<{
  data: Subscription | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as Subscription, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to get subscription'
    }
  }
}

/**
 * Update subscription expiration (for renewals)
 */
export async function renewSubscription(
  subscriptionId: string,
  planType: 'monthly' | 'semester'
): Promise<{
  data: Subscription | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    // Get current subscription
    const { data: current, error: fetchError } = await supabase
      .from('subscriptions')
      .select('expires_at')
      .eq('id', subscriptionId)
      .single()
    
    if (fetchError || !current) {
      return { data: null, error: 'Subscription not found' }
    }
    
    // Calculate new expiration
    const currentExpiry = new Date(current.expires_at || new Date())
    const newExpiry = new Date(currentExpiry)
    
    if (planType === 'monthly') {
      newExpiry.setMonth(newExpiry.getMonth() + 1)
    } else {
      newExpiry.setMonth(newExpiry.getMonth() + 4)
    }
    
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        expires_at: newExpiry.toISOString(),
        status: 'active',
        plan_type: planType
      })
      .eq('id', subscriptionId)
      .select()
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as Subscription, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to renew subscription'
    }
  }
}
