'use client'

import { useRouter } from 'next/navigation'
import { IoNotificationsOutline, IoCheckmarkCircle } from 'react-icons/io5'
import styles from './page.module.css'

interface Subscription {
  id: string
  status: string
  expires_at: string | null
  created_at: string
}

interface DashboardHeaderProps {
  userName: string
  unreadNotifications: number
  subscription: Subscription | null
}

export default function DashboardHeader({ userName, unreadNotifications, subscription }: DashboardHeaderProps) {
  const router = useRouter()

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getSubscriptionDaysLeft = () => {
    if (!subscription?.expires_at) return null
    const expiresAt = new Date(subscription.expires_at)
    const now = new Date()
    const diffTime = expiresAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const isActive = subscription && subscription.status === 'active'
  const daysLeft = getSubscriptionDaysLeft()

  return (
    <header className={styles.header}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
          <p className={styles.greeting}>{getGreeting()} 👋</p>
          {isActive && (
            <div className={styles.headerSubscriptionBadge}>
              <IoCheckmarkCircle size={12} color="#16a34a" />
              <span className={styles.headerSubscriptionStatus}>Active</span>
            </div>
          )}
        </div>
        <h1 className={styles.schoolName}>{userName}</h1>
      </div>
      <button 
        className={styles.notificationBtn}
        onClick={() => router.push('/notifications')}
        aria-label={`Notifications${unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ''}`}
      >
        <IoNotificationsOutline size={22} color={unreadNotifications > 0 ? "#2563eb" : "#64748b"} />
        {unreadNotifications > 0 && (
          <span className={styles.notificationBadge}>
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </span>
        )}
      </button>
    </header>
  )
}
