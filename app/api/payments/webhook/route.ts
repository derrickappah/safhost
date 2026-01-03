import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { verifyPayment } from '@/lib/payments/paystack'
import { updatePaymentStatus, getPaymentByProviderRef } from '@/lib/actions/payments'
import { activateSubscription } from '@/lib/actions/subscriptions'

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

/**
 * Verify Paystack webhook signature
 */
function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  if (!PAYSTACK_SECRET_KEY) {
    return false
  }

  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest('hex')

  return hash === signature
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-paystack-signature')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    const body = await request.text()
    
    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    // Handle charge.success event
    if (event.event === 'charge.success') {
      const { reference, amount, customer, metadata } = event.data

      // Verify payment with Paystack
      const { data: verification, error: verifyError } = await verifyPayment(reference)

      if (verifyError || !verification) {
        console.error('Payment verification failed:', verifyError)
        return NextResponse.json(
          { error: 'Verification failed' },
          { status: 400 }
        )
      }

      // Get payment record
      const { data: payment, error: paymentError } = await getPaymentByProviderRef(reference)

      if (paymentError || !payment) {
        console.error('Payment record not found:', paymentError)
        return NextResponse.json(
          { error: 'Payment record not found' },
          { status: 404 }
        )
      }

      // Update payment status
      await updatePaymentStatus(payment.id, 'success', reference)

      // Activate subscription using service role to bypass RLS
      // Webhooks don't have user session cookies
      const { data: subscription, error: activateError } = await activateSubscription(payment.subscription_id, true)

      if (activateError) {
        console.error('Failed to activate subscription:', activateError)
        console.error('Payment details:', { paymentId: payment.id, subscriptionId: payment.subscription_id })
        // Don't fail the webhook, but log the error
      } else if (subscription) {
        console.log('Subscription activated via webhook:', { subscriptionId: subscription.id, status: subscription.status })
      }

      return NextResponse.json({ received: true })
    }

    // Handle other events (charge.failed, etc.)
    if (event.event === 'charge.failed') {
      const { reference } = event.data

      const { data: payment } = await getPaymentByProviderRef(reference)

      if (payment) {
        await updatePaymentStatus(payment.id, 'failed', reference)
      }

      return NextResponse.json({ received: true })
    }

    // Acknowledge other events
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
