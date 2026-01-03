'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoNotificationsOutline, IoCheckmarkCircle, IoTime, IoStar, IoGift, IoHome } from 'react-icons/io5'
import styles from './page.module.css'
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/notifications/get'
import { getCurrentUser } from '@/lib/auth/client'

const notificationIcons: Record<string, any> = {
  subscription_expiry: IoTime,
  new_hostel: IoHome,
  promotion: IoGift,
  hostel_updated: IoStar,
  other: IoNotificationsOutline,
}

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data, error } = await getCurrentUser()
      if (error || !data?.user) {
        router.push(`/auth/login?redirect=${encodeURIComponent('/notifications')}`)
        return
      }
      
      setCheckingAuth(false)
      
      const { data: notificationsData, error: notificationsError } = await getNotifications(100)
      if (notificationsData) {
        setNotifications(notificationsData)
      }
      setLoading(false)
    }
    loadData()
  }, [router])

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const getNotificationIcon = (type: string) => {
    return notificationIcons[type] || notificationIcons.other
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'subscription_expiry':
        return '#ef4444'
      case 'new_hostel':
        return '#22c55e'
      case 'promotion':
        return '#f59e0b'
      case 'hostel_updated':
        return '#2563eb'
      default:
        return '#64748b'
    }
  }

  if (checkingAuth || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading notifications...</div>
      </div>
    )
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <h1 className={styles.headerTitle}>Notifications</h1>
        {unreadCount > 0 && (
          <button className={styles.markAllButton} onClick={handleMarkAllAsRead}>
            Mark all read
          </button>
        )}
      </header>

      <div className={styles.content}>
        {notifications.length === 0 ? (
          <div className={styles.emptyState}>
            <IoNotificationsOutline size={48} color="#cbd5e1" />
            <h2 className={styles.emptyTitle}>No notifications</h2>
            <p className={styles.emptyText}>
              You'll see notifications about your subscription, new hostels, and more here.
            </p>
          </div>
        ) : (
          <div className={styles.notificationsList}>
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type)
              const iconColor = getNotificationColor(notification.type)
              const isUnread = !notification.read
              
              return (
                <button
                  key={notification.id}
                  className={`${styles.notificationItem} ${isUnread ? styles.notificationItemUnread : ''}`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className={styles.notificationIcon} style={{ backgroundColor: `${iconColor}15` }}>
                    <Icon size={20} color={iconColor} />
                  </div>
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <h3 className={styles.notificationTitle}>{notification.title}</h3>
                      {isUnread && <div className={styles.unreadDot} />}
                    </div>
                    <p className={styles.notificationMessage}>{notification.message}</p>
                    <span className={styles.notificationTime}>
                      {new Date(notification.created_at).toLocaleDateString()} at{' '}
                      {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {isUnread && (
                    <button
                      className={styles.markReadButton}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsRead(notification.id)
                      }}
                    >
                      <IoCheckmarkCircle size={20} color="#22c55e" />
                    </button>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
