import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/payments/paystack'
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
        // Use service role client for callback routes (no user session)
        const { createServiceRoleClient } = await import('@/lib/supabase/server')
        const serviceClient = createServiceRoleClient()
        
        // Try to find payment by reference first
        let payment = null
        const { data: paymentByRef, error: refError } = await serviceClient
          .from('payments')
          .select('*')
          .eq('provider_ref', reference)
          .single()
        
        if (paymentByRef && !refError) {
          payment = paymentByRef
          console.log('Payment found by reference:', { paymentId: payment.id, subscriptionId: payment.subscription_id })
        }
        
        // If not found by reference, try metadata fallback
        if (!payment) {
          console.log('Payment not found by reference, trying metadata lookup...')
          const paymentIdFromMetadata = verification?.data?.metadata?.payment_id
          
          if (paymentIdFromMetadata) {
            const { data: paymentById, error: idError } = await serviceClient
              .from('payments')
              .select('*')
              .eq('id', paymentIdFromMetadata)
              .single()
            
            if (paymentById && !idError) {
              payment = paymentById
              console.log('Found payment by metadata payment_id:', payment.id)
            }
          }
        }
        
        if (!payment) {
          console.error('Payment record not found for reference:', reference)
          console.error('Verification metadata:', verification?.data?.metadata)
          return NextResponse.redirect(new URL('/subscribe?error=payment_not_found', baseUrl))
        }
        
        // Update payment status to success and ensure reference is stored
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
