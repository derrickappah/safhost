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
          try {
            const serviceClient = createServiceRoleClient()
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
                // Update the payment with the reference for future lookups
                await serviceClient
                  .from('payments')
                  .update({ provider_ref: reference })
                  .eq('id', paymentById.id)
                
                // Use this payment
                const { data: updatedPayment } = await serviceClient
                  .from('payments')
                  .select('*')
                  .eq('id', paymentById.id)
                  .single()
                
                if (updatedPayment) {
                  // Continue with activation using updatedPayment
                  const payment = updatedPayment as any
                  
                  console.log('Payment found, activating subscription:', { paymentId: payment.id, subscriptionId: payment.subscription_id })
                  
                  // Activate subscription
                  const { data: activatedSubscription, error: activateError } = await serviceClient
                    .from('subscriptions')
                    .update({ status: 'active' })
                    .eq('id', payment.subscription_id)
                    .select()
                    .single()
                  
                  if (activateError) {
                    console.error('Subscription activation error:', activateError)
                  } else if (activatedSubscription) {
                    console.log('Subscription activated successfully:', { subscriptionId: activatedSubscription.id, status: activatedSubscription.status })
                  }
                  
                  return NextResponse.redirect(new URL('/dashboard?payment=success', baseUrl))
                }
              }
            }
            
            // Log recent payments for debugging
            const { data: recentPayments } = await serviceClient
              .from('payments')
              .select('*')
              .eq('status', 'pending')
              .order('created_at', { ascending: false })
              .limit(5)
            
            console.log('Recent pending payments:', recentPayments?.map(p => ({ id: p.id, provider_ref: p.provider_ref, created_at: p.created_at })))
          } catch (e) {
            console.error('Could not query payments:', e)
          }
          
          console.error('Payment record not found for reference:', reference)
          return NextResponse.redirect(new URL('/subscribe?error=payment_not_found', baseUrl))
        }
        
        if (payment) {
          console.log('Payment found, activating subscription:', { paymentId: payment.id, subscriptionId: payment.subscription_id })
          
          // Try with service role first (for webhooks/callbacks without user session)
          let activatedSubscription = null
          let activateError = null
          
          try {
            const { createServiceRoleClient } = await import('@/lib/supabase/server')
            const serviceClient = createServiceRoleClient()
            
            const { data, error } = await serviceClient
              .from('subscriptions')
              .update({ status: 'active' })
              .eq('id', payment.subscription_id)
              .select()
              .single()
            
            if (error) {
              console.error('Service role activation failed:', error)
              // Fallback to regular activation
              const result = await activateSubscription(payment.subscription_id, false)
              activatedSubscription = result.data
              activateError = result.error
            } else {
              activatedSubscription = data
              console.log('Subscription activated via service role:', { subscriptionId: data?.id, status: data?.status })
            }
          } catch (serviceError: any) {
            console.error('Service role client error:', serviceError?.message || serviceError)
            // Fallback to regular activation
            const result = await activateSubscription(payment.subscription_id, false)
            activatedSubscription = result.data
            activateError = result.error
          }
          
          if (activateError) {
            console.error('Subscription activation error:', activateError)
            console.error('Payment details:', { paymentId: payment.id, subscriptionId: payment.subscription_id })
          } else if (activatedSubscription) {
            console.log('Subscription activated successfully:', { subscriptionId: activatedSubscription.id, status: activatedSubscription.status })
          } else {
            console.warn('Subscription activation returned no data')
          }
        } else {
          console.error('Payment record not found for reference:', reference)
        }
        
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
