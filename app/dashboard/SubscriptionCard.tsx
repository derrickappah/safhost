'use client'

import { useRouter } from 'next/navigation'
import { IoCheckmarkCircle, IoArrowForward } from 'react-icons/io5'
import styles from './page.module.css'

interface Subscription {
  id: string
  status: string
  expires_at: string | null
  created_at: string
}

interface SubscriptionCardProps {
  subscription: Subscription | null
}

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const router = useRouter()

  const getSubscriptionDaysLeft = () => {
    if (!subscription?.expires_at) return null
    const expiresAt = new Date(subscription.expires_at)
    const now = new Date()
    const diffTime = expiresAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const getSubscriptionProgress = () => {
    if (!subscription?.expires_at) return 0
    const expiresAt = new Date(subscription.expires_at)
    const created = new Date(subscription.created_at)
    const now = new Date()
    const total = expiresAt.getTime() - created.getTime()
    const elapsed = now.getTime() - created.getTime()
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }

  const daysLeft = getSubscriptionDaysLeft()
  const progress = getSubscriptionProgress()

  if (subscription && subscription.status === 'active') {
    return (
      <div className={styles.subscriptionCard}>
        <div className={styles.subscriptionHeader}>
          <div className={styles.subscriptionBadge}>
            <IoCheckmarkCircle size={16} color="#22c55e" />
            <span className={styles.subscriptionStatus}>Active</span>
          </div>
          <span className={styles.daysLeft}>
            {daysLeft !== null ? `${daysLeft} days left` : 'Active'}
          </span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <button 
          className={styles.renewButton}
          onClick={() => router.push('/subscribe')}
        >
          <span className={styles.renewButtonText}>Renew Subscription</span>
          <IoArrowForward size={16} color="#2563eb" />
        </button>
      </div>
    )
  }

  return (
    <div className={styles.subscriptionCard} style={{ backgroundColor: '#fef2f2' }}>
      <div className={styles.subscriptionHeader}>
        <div className={styles.subscriptionBadge} style={{ backgroundColor: '#fee2e2' }}>
          <span className={styles.subscriptionStatus} style={{ color: '#dc2626' }}>No Subscription</span>
        </div>
      </div>
      <button 
        className={styles.renewButton}
        onClick={() => router.push('/subscribe')}
      >
        <span className={styles.renewButtonText}>Subscribe Now</span>
        <IoArrowForward size={16} color="#2563eb" />
      </button>
    </div>
  )
}
