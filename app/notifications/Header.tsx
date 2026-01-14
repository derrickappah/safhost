'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'
import { getNotifications, markAllAsRead } from '@/lib/notifications/get'

export default function NotificationsHeader() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    async function loadNotifications() {
      const { data } = await getNotifications(100)
      if (data) {
        const unread = data.filter(n => !n.read).length
        setUnreadCount(unread)
      }
    }
    loadNotifications()
    
    // Refresh count periodically
    const interval = setInterval(loadNotifications, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    setUnreadCount(0)
    // Trigger a page refresh to update the list
    window.dispatchEvent(new Event('notifications-updated'))
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.headerTitle}>Notifications</h1>
      {unreadCount > 0 && (
        <button className={styles.markAllButton} onClick={handleMarkAllAsRead}>
          Mark all read
        </button>
      )}
    </header>
  )
}
