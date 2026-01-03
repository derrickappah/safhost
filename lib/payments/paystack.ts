import {
  PaystackInitializeResponse,
  PaystackVerifyResponse,
  InitializePaymentInput,
  PaymentMethod
} from './types'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
const PAYSTACK_BASE_URL = 'https://api.paystack.co'

if (!PAYSTACK_SECRET_KEY && process.env.NODE_ENV !== 'test') {
  console.warn('PAYSTACK_SECRET_KEY is not set - payment functionality will not work')
}

/**
 * Initialize a Paystack payment transaction
 */
export async function initializePayment(
  input: InitializePaymentInput
): Promise<{
  data: PaystackInitializeResponse | null
  error: string | null
}> {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return { data: null, error: 'Paystack secret key not configured' }
    }

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: input.email,
        amount: input.amount, // Amount in pesewas
        phone: input.phone,
        metadata: input.metadata || {},
        callback_url: input.callback_url || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/payments/callback`
      })
    })

    const data: PaystackInitializeResponse = await response.json()

    if (!data.status) {
      return { data: null, error: data.message || 'Failed to initialize payment' }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to initialize payment'
    }
  }
}

/**
 * Verify a Paystack payment transaction
 */
export async function verifyPayment(reference: string): Promise<{
  data: PaystackVerifyResponse | null
  error: string | null
}> {
  try {
    if (!PAYSTACK_SECRET_KEY) {
      return { data: null, error: 'Paystack secret key not configured' }
    }

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    })

    const data: PaystackVerifyResponse = await response.json()

    if (!data.status) {
      return { data: null, error: data.message || 'Failed to verify payment' }
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to verify payment'
    }
  }
}

/**
 * Convert GHS to pesewas (Paystack uses pesewas)
 */
export function ghsToPesewas(ghs: number): number {
  return Math.round(ghs * 100)
}

/**
 * Convert pesewas to GHS
 */
export function pesewasToGhs(pesewas: number): number {
  return pesewas / 100
}

/**
 * Get payment method channel code for Paystack
 */
export function getPaymentChannel(method: PaymentMethod): string {
  const channels: Record<PaymentMethod, string> = {
    mtn: 'mobile_money',
    vodafone: 'mobile_money',
    airteltigo: 'mobile_money'
  }
  return channels[method] || 'mobile_money'
}
