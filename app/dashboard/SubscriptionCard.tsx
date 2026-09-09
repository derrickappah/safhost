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

export interface Subscription {
  id: string
  status: string
  plan_type?: 'monthly' | 'semester'
  expires_at: string | null
  created_at?: string
  updated_at?: string
}

export interface SubscriptionCardProps {
  subscription: Subscription | null
}

export default function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const router = useRouter()

  const getSubscriptionDaysLeft = (): number | null => {
    if (!subscription?.expires_at) return null
    const expiresAt = new Date(subscription.expires_at)
    if (isNaN(expiresAt.getTime())) return null
    const now = new Date()
    const diffTime = expiresAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const getSubscriptionProgress = (): number => {
    if (!subscription?.expires_at) return 100
    const expiresAt = new Date(subscription.expires_at)
    if (isNaN(expiresAt.getTime())) return 100
    const createdAt = subscription.created_at
      ? new Date(subscription.created_at)
      : new Date(expiresAt.getTime() - 30 * 86400000)
    if (isNaN(createdAt.getTime())) return 100
    const now = new Date()
    const total = expiresAt.getTime() - createdAt.getTime()
    if (total <= 0) return 100
    const elapsed = now.getTime() - createdAt.getTime()
    const pct = (elapsed / total) * 100
    return Math.min(100, Math.max(0, pct))
  }

  const daysLeft = getSubscriptionDaysLeft()
  const progress = getSubscriptionProgress()
  const isActive = Boolean(subscription && subscription.status === 'active')

  const planTierLabel = subscription?.plan_type === 'semester'
    ? 'Semester Pass'
    : subscription?.plan_type === 'monthly'
    ? 'Monthly Pass'
    : 'Student Pass'

  if (isActive) {
    return (
      <div className={styles.subscriptionCardActive}>
        <div className={styles.subscriptionHeaderRow}>
          <div className={styles.subscriptionStatusBadge}>
            <IoCheckmarkCircle size={16} color="#16a34a" />
            <span className={styles.subscriptionStatusText}>{planTierLabel} Active</span>
          </div>
          {daysLeft !== null ? (
            <div className={styles.subscriptionDaysLeft}>
              <IoTimeOutline size={14} />
              <span>{daysLeft} days remaining</span>
            </div>
          ) : (
            <div className={styles.subscriptionDaysLeft}>
              <span>Active</span>
            </div>
          )}
        </div>

        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.max(5, progress)}%` }}
          />
        </div>

        <div className={styles.subscriptionPerksList}>
          <span className={styles.subscriptionPerkItem}>
            <IoLogoWhatsapp size={14} className={styles.whatsappIconActive} />
            <span>Direct Manager WhatsApp Unlocked</span>
          </span>
          <span className={styles.subscriptionPerkItem}>
            <IoCallOutline size={14} />
            <span>Direct Phone Contact Unlocked</span>
          </span>
          <span className={styles.subscriptionPerkItem}>
            <IoShieldCheckmark size={14} />
            <span>Verified Hostels Access</span>
          </span>
        </div>

        <div className={styles.subscriptionActionsRow}>
          <button
            type="button"
            className={styles.subscriptionManageBtn}
            onClick={() => router.push('/subscribe')}
          >
            <span>Renew / Manage Pass</span>
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
          <span>Student Access Pass</span>
        </div>
        <h3 className={styles.upgradeTitle}>
          Unlock Direct Manager WhatsApp & Contact Numbers
        </h3>
        <p className={styles.upgradeSubtitle}>
          Connect directly with verified hostel managers. Skip unverified agents, eliminate viewing
          fees, and secure your campus accommodation early.
        </p>

        <div className={styles.upgradePerksRow}>
          <div className={styles.upgradePerk}>
            <IoLogoWhatsapp size={15} className={styles.whatsappIcon} />
            <span>Direct Manager WhatsApp</span>
          </div>
          <div className={styles.upgradePerk}>
            <IoCallOutline size={15} />
            <span>Verified Phone</span>
          </div>
          <div className={styles.upgradePerk}>
            <IoShieldCheckmark size={15} />
            <span>100% Inspected Hostels</span>
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
