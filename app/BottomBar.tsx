'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IoClose, IoSparkles } from 'react-icons/io5'
import { useAuth } from '@/components/AuthProvider'
import styles from './page.module.css'

export default function BottomBar() {
  const { isAuthenticated, isLoading } = useAuth()
  const [dismissed, setDismissed] = useState(false)

  // Don't show for authenticated users, while loading, or if dismissed
  if (isLoading || isAuthenticated || dismissed) {
    return null
  }

  return (
    <aside className={styles.bottomBar} aria-label="Quick registration bar">
      <div className={styles.bottomBarContent}>
        <div className={styles.bottomBarTextGroup}>
          <div className={styles.bottomBarIconBadge}>
            <IoSparkles size={16} />
          </div>
          <div>
            <p className={styles.bottomBarTitle}>Ready to move in?</p>
            <p className={styles.bottomBarSubtitle}>Join 10k+ students finding verified rooms</p>
          </div>
        </div>
        <div className={styles.bottomBarActions}>
          <Link href="/auth/signup" className={styles.bottomBarCta}>
            Get Started
          </Link>
          <button
            type="button"
            className={styles.bottomBarDismiss}
            onClick={() => setDismissed(true)}
            aria-label="Dismiss banner"
          >
            <IoClose size={18} />
          </button>
        </div>
      </div>
    </aside>
  )
}
