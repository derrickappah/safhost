import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/payments/paystack'
import { getPaymentByProviderRef } from '@/lib/actions/payments'
import { activateSubscription } from '@/lib/actions/subscriptions'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Get the base URL from environment or request origin (needed in catch block)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin
  
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    const status = searchParams.get('status')

    console.log('Payment callback received:', { reference, status })
    
    if (!reference) {
      return NextResponse.redirect(new URL('/subscribe?error=no_reference', baseUrl))
    }

    if (status === 'success' || !status) {
      // Verify payment with Paystack
      const { data: verification, error: verifyError } = await verifyPayment(reference)
      
      if (verifyError) {
        console.error('Payment verification error:', verifyError)
        return NextResponse.redirect(new URL('/subscribe?error=verification_failed', baseUrl))
      }
      
      if (verification && verification.data.status === 'success') {
        // Get payment record by reference
        const { data: payment, error: paymentError } = await getPaymentByProviderRef(reference)
        
        if (paymentError) {
          console.error('Payment record error:', paymentError)
        }
        
        if (!payment) {
          // Try to find payment by metadata (fallback for payments created before reference was stored)
          console.log('Payment not found by reference, trying metadata lookup...')
          const { createServiceRoleClient } = await import('@/lib/supabase/server')
          const serviceClient = createServiceRoleClient()
          try {
            // Get verification metadata which should contain payment_id
            const paymentIdFromMetadata = verification?.data?.metadata?.payment_id
            
            if (paymentIdFromMetadata) {
              const { data: paymentById } = await serviceClient
                .from('payments')
                .select('*')
                .eq('id', paymentIdFromMetadata)
                .single()
              
              if (paymentById) {
                console.log('Found payment by metadata payment_id:', paymentById.id)
                // Update the payment with the reference and status
                await serviceClient
                  .from('payments')
                  .update({ 
                    provider_ref: reference,
                    status: 'success',
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', paymentById.id)
                
                // Activate subscription using activateSubscription function (clears cache)
                const { data: activatedSubscription, error: activateError } = await activateSubscription(paymentById.subscription_id, true)
                
                if (activateError || !activatedSubscription) {
                  console.error('Subscription activation error:', activateError)
                  return NextResponse.redirect(new URL('/subscribe?error=activation_failed', baseUrl))
                }
                
                console.log('Subscription activated successfully:', { subscriptionId: activatedSubscription.id, status: activatedSubscription.status })
                return NextResponse.redirect(new URL('/dashboard?payment=success', baseUrl))
              }
            }
          } catch (e) {
            console.error('Could not query payments:', e)
          }
          
          console.error('Payment record not found for reference:', reference)
          return NextResponse.redirect(new URL('/subscribe?error=payment_not_found', baseUrl))
        }
        
        if (payment) {
          console.log('Payment found, activating subscription:', { paymentId: payment.id, subscriptionId: payment.subscription_id })
          
          // Update payment status to success first
          const { createServiceRoleClient } = await import('@/lib/supabase/server')
          const serviceClient = createServiceRoleClient()
          
          await serviceClient
            .from('payments')
            .update({ 
              status: 'success',
              provider_ref: reference,
              updated_at: new Date().toISOString()
            })
            .eq('id', payment.id)
          
          // Activate subscription using activateSubscription function (clears cache automatically)
          const { data: activatedSubscription, error: activateError } = await activateSubscription(payment.subscription_id, true)
          
          if (activateError || !activatedSubscription) {
            console.error('Subscription activation error:', activateError)
            console.error('Payment details:', { paymentId: payment.id, subscriptionId: payment.subscription_id })
            return NextResponse.redirect(new URL('/subscribe?error=activation_failed', baseUrl))
          }
          
          console.log('Subscription activated successfully:', { subscriptionId: activatedSubscription.id, status: activatedSubscription.status })
          return NextResponse.redirect(new URL('/dashboard?payment=success', baseUrl))
        } else {
          console.error('Payment record not found for reference:', reference)
          return NextResponse.redirect(new URL('/subscribe?error=payment_not_found', baseUrl))
        }
      } else {
        return NextResponse.redirect(new URL('/subscribe?error=payment_not_verified', baseUrl))
      }
    } else {
      return NextResponse.redirect(new URL('/subscribe?error=payment_failed', baseUrl))
    }
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(new URL('/subscribe?error=callback_error', baseUrl))
  }
}
