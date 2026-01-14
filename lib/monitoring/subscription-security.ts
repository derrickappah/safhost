'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'

export interface SecurityEvent {
  eventType: 'suspicious_update_attempt' | 'activation_without_payment' | 'null_expires_at_detected' | 'unauthorized_activation_attempt'
  subscriptionId: string | null
  userId: string | null
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Log a security event related to subscriptions
 */
export async function logSubscriptionSecurityEvent(event: SecurityEvent): Promise<{
  error: string | null
}> {
  try {
    const user = await getUser()
    const supabase = await createClient()
    
    // Try to log to audit_logs table if it exists
    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          admin_id: user?.id || null,
          action_type: event.eventType,
          resource_type: 'subscription',
          resource_id: event.subscriptionId,
          details: {
            ...event.details,
            userId: event.userId,
            severity: event.severity,
            timestamp: new Date().toISOString()
          }
        })
      
      if (error) {
        // If audit_logs doesn't exist or insert fails, fall back to console logging
        console.error('[Subscription Security] Failed to log to audit_logs:', error)
        console.warn('[Subscription Security Event]', {
          type: event.eventType,
          severity: event.severity,
          subscriptionId: event.subscriptionId,
          userId: event.userId || user?.id,
          details: event.details
        })
      }
    } catch (err) {
      // Fallback to console logging if audit_logs table doesn't exist
      console.warn('[Subscription Security Event]', {
        type: event.eventType,
        severity: event.severity,
        subscriptionId: event.subscriptionId,
        userId: event.userId || user?.id,
        details: event.details
      })
    }
    
    return { error: null }
  } catch (error) {
    // Always log to console as fallback
    console.error('[Subscription Security] Error logging security event:', error)
    console.warn('[Subscription Security Event]', event)
    return {
      error: error instanceof Error ? error.message : 'Failed to log security event'
    }
  }
}

/**
 * Log when user attempts to modify restricted subscription fields
 */
export async function logSuspiciousUpdateAttempt(
  subscriptionId: string,
  attemptedChanges: Record<string, { old: any; new: any }>
): Promise<void> {
  const user = await getUser()
  
  await logSubscriptionSecurityEvent({
    eventType: 'suspicious_update_attempt',
    subscriptionId,
    userId: user?.id || null,
    details: {
      attemptedChanges,
      message: 'User attempted to modify restricted subscription fields'
    },
    severity: 'high'
  })
}

/**
 * Log when subscription is activated without proper payment verification
 */
export async function logActivationWithoutPayment(
  subscriptionId: string,
  reason: string
): Promise<void> {
  const user = await getUser()
  
  await logSubscriptionSecurityEvent({
    eventType: 'activation_without_payment',
    subscriptionId,
    userId: user?.id || null,
    details: {
      reason,
      message: 'Subscription activation attempted without proper payment verification'
    },
    severity: 'critical'
  })
}

/**
 * Log when NULL expires_at is detected in active subscription
 */
export async function logNullExpiresAtDetected(
  subscriptionId: string
): Promise<void> {
  const user = await getUser()
  
  await logSubscriptionSecurityEvent({
    eventType: 'null_expires_at_detected',
    subscriptionId,
    userId: user?.id || null,
    details: {
      message: 'Active subscription with NULL expires_at detected - security risk'
    },
    severity: 'high'
  })
}

/**
 * Log when unauthorized activation attempt is made
 */
export async function logUnauthorizedActivationAttempt(
  subscriptionId: string,
  reason: string
): Promise<void> {
  const user = await getUser()
  
  await logSubscriptionSecurityEvent({
    eventType: 'unauthorized_activation_attempt',
    subscriptionId,
    userId: user?.id || null,
    details: {
      reason,
      message: 'Unauthorized attempt to activate subscription'
    },
    severity: 'high'
  })
}
