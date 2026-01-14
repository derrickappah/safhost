'use client'

import { useState, useEffect } from 'react'
import { IoNotificationsOutline, IoCheckmarkCircle, IoTime, IoStar, IoGift, IoHome } from 'react-icons/io5'
import styles from './page.module.css'
import { getNotifications, markAsRead, markAllAsRead } from '@/lib/notifications/get'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'

const notificationIcons: Record<string, any> = {
  subscription_expiry: IoTime,
  new_hostel: IoHome,
  promotion: IoGift,
  hostel_updated: IoStar,
  other: IoNotificationsOutline,
}

interface NotificationsPageClientProps {
  initialNotifications: any[]
}

export default function NotificationsPageClient({ initialNotifications }: NotificationsPageClientProps) {
  const { navigate } = useInstantNavigation()
  const [notifications, setNotifications] = useState(initialNotifications)

  useEffect(() => {
    // Listen for notifications update event
    const handleUpdate = async () => {
      const { data: notificationsData } = await getNotifications(100)
      if (notificationsData) {
        setNotifications(notificationsData)
      }
    }
    window.addEventListener('notifications-updated', handleUpdate)
    return () => window.removeEventListener('notifications-updated', handleUpdate)
  }, [])

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId)
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ))
  }

  const handleNotificationClick = async (notification: any) => {
    // Mark as read if unread
    if (!notification.read) {
      await handleMarkAsRead(notification.id)
    }

    // Navigate to hostel if notification has hostelId in data
    if (notification.data?.hostelId) {
      navigate(`/hostel/${notification.data.hostelId}`)
    }
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

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className={styles.container}>
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
                  onClick={() => handleNotificationClick(notification)}
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
