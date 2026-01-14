'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoClose, IoDiamond, IoCheckmarkCircle, IoArrowForward, IoLockClosed, IoCloseCircle } from 'react-icons/io5'
import styles from './page.module.css'
import { ghsToPesewas, pesewasToGhs } from '@/lib/payments/paystack'
import { getCurrentUser } from '@/lib/auth/client'
import { validatePromoCode } from '@/lib/actions/promo-codes'
import { getActiveSubscription } from '@/lib/actions/subscriptions'

const plans = [
  {
    id: "monthly",
    name: "Monthly",
    price: 20,
    period: "month",
    popular: true,
    features: [
      "Full access to all hostels",
      "Contact hostel managers directly",
      "Save favorites",
      "View all photos & details",
    ],
  },
  {
    id: "semester",
    name: "Semester",
    price: 50,
    period: "3 months",
    popular: false,
    savings: "Save GHS 10",
    features: [
      "Everything in Monthly",
      "Priority support",
      "Early access to new listings",
    ],
  },
]

// Paystack is the payment processor - it supports all mobile money methods
const paymentMethod = {
  id: "paystack",
  name: "Paystack",
  description: "Secure payment via Paystack (supports MTN, Vodafone, AirtelTigo)",
  color: "#006FCF"
}

export default function SubscribePage() {
  const router = useRouter()
  const [selectedPlan, setSelectedPlan] = useState("monthly")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [promoCode, setPromoCode] = useState("")
  const [promoCodeValid, setPromoCodeValid] = useState<{ valid: boolean; discountAmount: number; error?: string } | null>(null)
  const [validatingPromo, setValidatingPromo] = useState(false)

  useEffect(() => {
    // Check authentication and subscription on mount
    const checkAuth = async () => {
      const { data, error } = await getCurrentUser()
      if (error || !data?.user) {
        router.push(`/auth/login?redirect=${encodeURIComponent('/subscribe')}`)
        return
      }
      setUser(data.user)
      
      // Check if user already has an active subscription
      const { data: subscription, error: subError } = await getActiveSubscription()
      if (subscription && subscription.status === 'active') {
        // Also check if subscription is not expired
        const now = new Date()
        const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null
        const isNotExpired = !expiresAt || expiresAt > now
        
        if (isNotExpired) {
          // User already has an active, non-expired subscription, redirect to dashboard
          router.push('/dashboard')
          return
        }
      }
      
      setCheckingAuth(false)
    }
    checkAuth()
  }, [router])

  const handlePromoCodeChange = async (code: string) => {
    setPromoCode(code)
    
    if (!code.trim()) {
      setPromoCodeValid(null)
      return
    }
    
    setValidatingPromo(true)
    const result = await validatePromoCode(code, currentPlan?.price || 0)
    
    if (result.valid) {
      setPromoCodeValid({
        valid: true,
        discountAmount: result.discountAmount || 0,
      })
    } else {
      setPromoCodeValid({
        valid: false,
        discountAmount: 0,
        error: result.error || 'Invalid promo code',
      })
    }
    
    setValidatingPromo(false)
  }

  const removePromoCode = () => {
    setPromoCode('')
    setPromoCodeValid(null)
  }

  const getDiscountAmount = (): number => {
    if (!promoCodeValid?.valid) return 0
    return promoCodeValid.discountAmount || 0
  }

  const getFinalPrice = (): number => {
    const basePrice = currentPlan?.price || 0
    return Math.max(0, basePrice - getDiscountAmount())
  }

  const handleSubscribe = async (e?: React.MouseEvent) => {
    e?.preventDefault()
    if (!user) {
      setError("You must be logged in to subscribe")
      return
    }

    setError("")
    setIsLoading(true)
    
    try {
      // Create subscription (API will use authenticated user's ID)
      const subscriptionRes = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planType: selectedPlan
        })
      })
      
      if (!subscriptionRes.ok) {
        const errorData = await subscriptionRes.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Subscription creation failed:', errorData)
        throw new Error(errorData.error || 'Failed to create subscription')
      }
      
      const { subscription } = await subscriptionRes.json()
      
      // Get user's email and phone from metadata
      const userEmail = user.email || user.user_metadata?.email
      const userPhone = user.user_metadata?.phone || user.phone
      
      // Calculate final amount with promo code discount
      const finalPrice = getFinalPrice()
      const amountInPesewas = ghsToPesewas(finalPrice)
      
      // Create payment record
      const paymentRes = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription.id,
          amount: amountInPesewas,
          phone: userPhone,
          email: userEmail,
          promoCode: promoCodeValid?.valid ? promoCode : undefined,
        })
      })
      
      if (!paymentRes.ok) {
        const errorData = await paymentRes.json()
        throw new Error(errorData.error || 'Failed to create payment')
      }
      
      const { payment, authorizationUrl } = await paymentRes.json()
      
      // Redirect to Paystack payment page
      if (authorizationUrl) {
        window.location.href = authorizationUrl
      } else {
        throw new Error('Payment initialization failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.')
      setIsLoading(false)
    }
  }

  const currentPlan = plans.find((p) => p.id === selectedPlan)

  // Show loading state while checking authentication
  if (checkingAuth) {
    return (
      <div className={styles.container}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          fontSize: '16px',
          color: 'var(--color-text-secondary)'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.scrollContent}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroIcon}>
            <IoDiamond size={32} color="#2563eb" />
          </div>
          <h2 className={styles.heroTitle}>Unlock Full Access</h2>
          <p className={styles.heroSubtitle}>
            Get unlimited access to all hostel listings, contact details, and
            exclusive features
          </p>
        </section>

        {/* Plans */}
        <div className={styles.plansContainer}>
          {plans.map((plan) => (
            <button
              key={plan.id}
              className={`${styles.planCard} ${selectedPlan === plan.id ? styles.planCardSelected : ''}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.popular && (
                <div className={styles.popularBadge}>
                  <span className={styles.popularText}>POPULAR</span>
                </div>
              )}
              {plan.savings && (
                <div className={styles.savingsBadge}>
                  <span className={styles.savingsText}>{plan.savings}</span>
                </div>
              )}
              <div className={styles.planHeader}>
                <div className={`${styles.radioOuter} ${selectedPlan === plan.id ? styles.radioOuterSelected : ''}`}>
                  {selectedPlan === plan.id && (
                    <div className={styles.radioInner} />
                  )}
                </div>
                <div className={styles.planInfo}>
                  <h3 className={styles.planName}>{plan.name}</h3>
                  <div className={styles.planPriceRow}>
                    <span className={styles.planCurrency}>GHS</span>
                    <span className={styles.planPrice}>{plan.price}</span>
                    <span className={styles.planPeriod}>/{plan.period}</span>
                  </div>
                </div>
              </div>
              <div className={styles.planFeatures}>
                {plan.features.map((feature, index) => (
                  <div key={index} className={styles.featureRow}>
                    <IoCheckmarkCircle size={18} color="#22c55e" />
                    <span className={styles.featureText}>{feature}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Payment Methods */}
        <section className={styles.paymentSection}>
          <h2 className={styles.sectionTitle}>Payment Method</h2>
          <div className={styles.paymentMethods}>
            <div className={`${styles.paymentCard} ${styles.paymentCardSelected}`}>
              <div
                className={styles.paymentIcon}
                style={{ backgroundColor: paymentMethod.color }}
              >
                <IoLockClosed size={16} color="#fff" />
              </div>
              <div style={{ flex: 1 }}>
                <span className={styles.paymentName}>{paymentMethod.name}</span>
                <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0' }}>
                  {paymentMethod.description}
                </p>
              </div>
              <IoCheckmarkCircle size={20} color="#2563eb" />
            </div>
          </div>
        </section>

        {/* Promo Code */}
        <section className={styles.promoSection}>
          <label className={styles.promoLabel}>Promo Code (Optional)</label>
          <div className={styles.promoInputContainer}>
            <input
              type="text"
              className={styles.promoInput}
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => handlePromoCodeChange(e.target.value)}
              disabled={validatingPromo}
            />
            {promoCode && (
              <button
                className={styles.promoRemoveButton}
                onClick={removePromoCode}
                type="button"
              >
                <IoCloseCircle size={20} color="#64748b" />
              </button>
            )}
          </div>
          {validatingPromo && (
            <p className={styles.promoMessage}>Validating...</p>
          )}
          {promoCodeValid && !validatingPromo && (
            <p className={`${styles.promoMessage} ${promoCodeValid.valid ? styles.promoMessageSuccess : styles.promoMessageError}`}>
              {promoCodeValid.valid ? (
                <>
                  <IoCheckmarkCircle size={16} color="#22c55e" />
                  <span>Promo code applied! Save GHS {getDiscountAmount().toFixed(2)}</span>
                </>
              ) : (
                <>
                  <IoCloseCircle size={16} color="#ef4444" />
                  <span>{promoCodeValid.error}</span>
                </>
              )}
            </p>
          )}
        </section>

        {/* Summary */}
        <section className={styles.summarySection}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>
              {currentPlan?.name} Plan</span>
            <span className={styles.summaryValue}>GHS {currentPlan?.price}</span>
          </div>
          {promoCodeValid?.valid && getDiscountAmount() > 0 && (
            <>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Discount</span>
                <span className={styles.summaryValueDiscount}>-GHS {getDiscountAmount().toFixed(2)}</span>
              </div>
            </>
          )}
          <div className={styles.summaryDivider} />
          <div className={styles.summaryRow}>
            <span className={styles.totalLabel}>Total</span>
            <span className={styles.totalValue}>GHS {getFinalPrice().toFixed(2)}</span>
          </div>
        </section>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '8px',
            marginTop: '16px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{ height: '120px' }} />
      </div>

      {/* Bottom CTA */}
      <div className={styles.bottomCTA}>
        <button
          className={`${styles.subscribeButton} ${isLoading ? styles.buttonDisabled : ''}`}
          onClick={handleSubscribe}
          disabled={isLoading || !user}
        >
          {isLoading ? (
            <span className={styles.loader}>Processing...</span>
          ) : (
            <>
              <span className={styles.subscribeButtonText}>
                Pay GHS {getFinalPrice().toFixed(2)}
              </span>
              <IoArrowForward size={20} color="#fff" />
            </>
          )}
        </button>
        <p className={styles.secureText}>
          <IoLockClosed size={12} color="#94a3b8" /> Secure
          payment via Paystack
        </p>
      </div>
    </div>
  )
}
