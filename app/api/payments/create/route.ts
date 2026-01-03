import { NextRequest, NextResponse } from 'next/server'
import { createPayment } from '@/lib/actions/payments'
import { initializePayment, ghsToPesewas } from '@/lib/payments/paystack'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subscriptionId, amount, phone, email, promoCode } = body

    if (!subscriptionId || !amount || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Record promo code usage if provided
    if (promoCode) {
      const { getPromoCodeByCode, recordPromoCodeUsage } = await import('@/lib/actions/promo-codes')
      const { getUser } = await import('@/lib/auth')
      const user = await getUser()
      
      const { data: promoCodeData } = await getPromoCodeByCode(promoCode)
      if (promoCodeData) {
        // Record usage (will be confirmed after payment success)
        await recordPromoCodeUsage(
          promoCodeData.id,
          subscriptionId,
          user?.id || null,
          amount // This is the discounted amount already
        )
      }
    }

    // Create payment record
    const { data: payment, error: paymentError } = await createPayment({
      subscriptionId,
      amount,
      phone,
      metadata: {
        subscription_id: subscriptionId,
        email,
        phone
      }
    })

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: paymentError || 'Failed to create payment' },
        { status: 500 }
      )
    }

    // Initialize Paystack payment
    // Amount is already in pesewas from the request
    const { data: paystackData, error: paystackError } = await initializePayment({
      email,
      amount: amount, // Amount is already in pesewas
      phone,
      metadata: {
        payment_id: payment.id,
        subscription_id: subscriptionId,
        promo_code: promoCode || undefined
      },
      callback_url: (() => {
        // Get the origin from the request
        const origin = request.headers.get('origin') || request.nextUrl.origin
        // Use environment variable if set, otherwise use request origin
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || origin
        return `${baseUrl}/api/payments/callback`
      })()
    })

    if (paystackError || !paystackData) {
      return NextResponse.json(
        { error: paystackError || 'Failed to initialize payment' },
        { status: 500 }
      )
    }

    // Update payment record with Paystack reference
    const { updatePaymentStatus } = await import('@/lib/actions/payments')
    const reference = paystackData.data.reference
    if (reference) {
      await updatePaymentStatus(payment.id, 'pending', reference)
      console.log('Payment reference stored:', { paymentId: payment.id, reference })
    }

    return NextResponse.json({
      payment,
      authorizationUrl: paystackData.data.authorization_url
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
