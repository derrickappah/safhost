'use server'

import { createClient } from '../supabase/server'

export interface PromoCode {
  id: string
  code: string
  description: string | null
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_uses: number | null
  used_count: number
  is_active: boolean
  valid_from: string
  valid_until: string | null
  created_at: string
  updated_at: string
}

export interface ValidatePromoCodeResult {
  valid: boolean
  discountAmount: number
  error?: string
}

/**
 * Validate and apply a promo code
 */
export async function validatePromoCode(
  code: string,
  amount: number // Amount in pesewas
): Promise<ValidatePromoCodeResult> {
  try {
    const supabase = await createClient()
    
    // Get promo code
    const { data: promoCode, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()
    
    if (error || !promoCode) {
      return {
        valid: false,
        discountAmount: 0,
        error: 'Invalid or inactive promo code',
      }
    }
    
    // Check if code has expired
    if (promoCode.valid_until) {
      const now = new Date()
      const validUntil = new Date(promoCode.valid_until)
      if (now > validUntil) {
        return {
          valid: false,
          discountAmount: 0,
          error: 'This promo code has expired',
        }
      }
    }
    
    // Check if code has reached max uses
    if (promoCode.max_uses && promoCode.used_count >= promoCode.max_uses) {
      return {
        valid: false,
        discountAmount: 0,
        error: 'This promo code has reached its usage limit',
      }
    }
    
    // Check if code is valid from date
    const now = new Date()
    const validFrom = new Date(promoCode.valid_from)
    if (now < validFrom) {
      return {
        valid: false,
        discountAmount: 0,
        error: 'This promo code is not yet valid',
      }
    }
    
    // Calculate discount
    let discountAmount = 0
    if (promoCode.discount_type === 'percentage') {
      discountAmount = Math.round((amount * promoCode.discount_value) / 100)
    } else {
      // Fixed amount (convert from GHS to pesewas)
      discountAmount = Math.round(promoCode.discount_value * 100)
    }
    
    // Ensure discount doesn't exceed amount
    if (discountAmount > amount) {
      discountAmount = amount
    }
    
    return {
      valid: true,
      discountAmount,
    }
  } catch (error) {
    return {
      valid: false,
      discountAmount: 0,
      error: error instanceof Error ? error.message : 'Failed to validate promo code',
    }
  }
}

/**
 * Record promo code usage
 */
export async function recordPromoCodeUsage(
  promoCodeId: string,
  subscriptionId: string,
  userId: string | null,
  discountAmount: number
): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    // Insert usage record
    const { error: usageError } = await supabase
      .from('promo_code_usage')
      .insert({
        promo_code_id: promoCodeId,
        subscription_id: subscriptionId,
        user_id: userId,
        discount_amount: discountAmount,
      })
    
    if (usageError) {
      return { error: usageError.message }
    }
    
    // Increment used_count
    const { error: updateError } = await supabase.rpc('increment_promo_code_usage', {
      promo_code_id: promoCodeId,
    })
    
    if (updateError) {
      // Try manual update as fallback
      const { data: promoCode } = await supabase
        .from('promo_codes')
        .select('used_count')
        .eq('id', promoCodeId)
        .single()
      
      if (promoCode) {
        await supabase
          .from('promo_codes')
          .update({ used_count: promoCode.used_count + 1 })
          .eq('id', promoCodeId)
      }
    }
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to record promo code usage',
    }
  }
}

/**
 * Get promo code by code string
 */
export async function getPromoCodeByCode(code: string): Promise<{
  data: PromoCode | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as PromoCode, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch promo code',
    }
  }
}
