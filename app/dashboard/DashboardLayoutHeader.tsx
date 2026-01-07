'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoNotificationsOutline } from 'react-icons/io5'
import styles from './page.module.css'
import { getCurrentUser } from '@/lib/auth/client'
import { getUnreadCount } from '@/lib/notifications/get'

export default function DashboardLayoutHeader() {
  const router = useRouter()
  const [userName, setUserName] = useState('User')
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [userResult, unreadCountResult] = await Promise.all([
          getCurrentUser(),
          getUnreadCount().catch(() => ({ data: 0, error: null }))
        ])

        if (userResult.data?.user) {
          const user = userResult.data.user
          if (user.user_metadata?.name) {
            setUserName(user.user_metadata.name)
          } else if (user.email) {
            setUserName(user.email.split('@')[0])
          }
        }

        setUnreadNotifications(unreadCountResult.data || 0)
      } catch (error) {
        console.error('Error loading header data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <header className={styles.header}>
        <div>
          <p className={styles.greeting}>{getGreeting()} 👋</p>
          <h1 className={styles.schoolName}>Loading...</h1>
        </div>
        <button 
          className={styles.notificationBtn}
          onClick={() => router.push('/notifications')}
        >
          <IoNotificationsOutline size={24} color="#1e293b" />
        </button>
      </header>
    )
  }

  return (
    <header className={styles.header}>
      <div>
        <p className={styles.greeting}>{getGreeting()} 👋</p>
        <h1 className={styles.schoolName}>{userName}</h1>
      </div>
      <button 
        className={styles.notificationBtn}
        onClick={() => router.push('/notifications')}
      >
        {unreadNotifications > 0 ? (
          <IoNotificationsOutline size={24} color="#2563eb" />
        ) : (
          <IoNotificationsOutline size={24} color="#1e293b" />
        )}
        {unreadNotifications > 0 && (
          <span className={styles.notificationBadge}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
        )}
      </button>
    </header>
  )
}
