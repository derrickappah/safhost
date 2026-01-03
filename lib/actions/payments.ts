'use server'

import { createClient } from '../supabase/server'

export interface Payment {
  id: string
  subscription_id: string
  amount: number
  provider: string
  provider_ref: string | null
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  phone: string | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CreatePaymentInput {
  subscriptionId: string
  amount: number
  phone?: string
  provider?: string
  metadata?: Record<string, any>
}

/**
 * Create a payment record
 */
export async function createPayment(input: CreatePaymentInput): Promise<{
  data: Payment | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const paymentData: any = {
      subscription_id: input.subscriptionId,
      amount: input.amount,
      provider: input.provider || 'paystack',
      status: 'pending',
      phone: input.phone || null,
      metadata: input.metadata || {}
    }
    
    const { data, error } = await supabase
      .from('payments')
      .insert(paymentData)
      .select()
      .single()
    
    if (error) {
      // Log failed payment attempt
      console.error('Payment creation failed:', error)
      return { data: null, error: error.message }
    }
    
    // Payment record created successfully (status will be updated later)
    return { data: data as Payment, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create payment'
    }
  }
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: 'pending' | 'success' | 'failed' | 'cancelled',
  providerRef?: string
): Promise<{
  data: Payment | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    }
    
    if (providerRef) {
      updateData.provider_ref = providerRef
    }
    
    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', paymentId)
      .select()
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as Payment, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update payment'
    }
  }
}

/**
 * Get payment by provider reference
 */
export async function getPaymentByProviderRef(providerRef: string): Promise<{
  data: Payment | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('provider_ref', providerRef)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      return { data: null, error: error.message }
    }
    
    return { data: data as Payment | null, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to get payment'
    }
  }
}

/**
 * Get payments for a subscription
 */
export async function getSubscriptionPayments(subscriptionId: string): Promise<{
  data: Payment[] | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .order('created_at', { ascending: false })
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as Payment[], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch payments'
    }
  }
}
