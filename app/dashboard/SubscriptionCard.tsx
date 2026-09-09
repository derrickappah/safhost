'use client'

import { useRouter } from 'next/navigation'
import {
  IoCheckmarkCircle,
  IoArrowForward,
  IoShieldCheckmark,
  IoCallOutline,
  IoLogoWhatsapp,
  IoSparkles,
  IoTimeOutline,
} from 'react-icons/io5'
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
  const isActive = subscription && subscription.status === 'active'

  if (isActive) {
    return (
      <div className={styles.subscriptionCardActive}>
        <div className={styles.subscriptionHeaderRow}>
          <div className={styles.subscriptionStatusBadge}>
            <IoCheckmarkCircle size={16} color="#16a34a" />
            <span className={styles.subscriptionStatusText}>Student Pass Active</span>
          </div>
          {daysLeft !== null && (
            <div className={styles.subscriptionDaysLeft}>
              <IoTimeOutline size={14} />
              <span>{daysLeft} days remaining</span>
            </div>
          )}
        </div>

        <div className={styles.subscriptionProgressBar}>
          <div
            className={styles.subscriptionProgressFill}
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>

        <div className={styles.subscriptionPerksList}>
          <span className={styles.subscriptionPerkItem}>✓ Direct WhatsApp & Calls</span>
          <span className={styles.subscriptionPerkItem}>✓ Precise Campus Distance</span>
          <span className={styles.subscriptionPerkItem}>✓ Verified Locations</span>
        </div>

        <div className={styles.subscriptionActionsRow}>
          <button
            type="button"
            className={styles.subscriptionManageBtn}
            onClick={() => router.push('/subscribe')}
          >
            <span>Manage Subscription</span>
            <IoArrowForward size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.subscriptionUpgradeBanner}>
      <div className={styles.upgradeContent}>
        <div className={styles.upgradeHeaderBadge}>
          <IoSparkles size={14} />
          <span>Unlock Direct Access</span>
        </div>
        <h3 className={styles.upgradeTitle}>Direct Hostel Contacts & WhatsApp</h3>
        <p className={styles.upgradeSubtitle}>
          Connect directly with verified hostel administrations. Skip fake agents, eliminate viewing
          fees, and secure your room early.
        </p>

        <div className={styles.upgradePerksRow}>
          <div className={styles.upgradePerk}>
            <IoLogoWhatsapp size={15} className={styles.whatsappIcon} />
            <span>Direct WhatsApp</span>
          </div>
          <div className={styles.upgradePerk}>
            <IoCallOutline size={15} />
            <span>Verified Phone</span>
          </div>
          <div className={styles.upgradePerk}>
            <IoShieldCheckmark size={15} />
            <span>100% Inspected</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        className={styles.upgradeCtaButton}
        onClick={() => router.push('/subscribe')}
      >
        <span>Get Access Pass</span>
        <IoArrowForward size={16} />
      </button>
    </div>
  )
}
