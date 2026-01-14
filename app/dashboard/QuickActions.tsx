'use client'

import Link from 'next/link'
import { IoSearch, IoMap, IoStar, IoFlame, IoGitCompare } from 'react-icons/io5'
import styles from './page.module.css'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'

export default function QuickActions() {
  const { handleMouseEnter, handleTouchStart } = useInstantNavigation()
  const actions = [
    {
      href: "/hostels",
      icon: IoSearch,
      label: "Browse",
      className: styles.iconBlue
    },
    {
      href: "/hostels/map",
      icon: IoMap,
      label: "Map",
      className: styles.iconGreen
    },
    {
      href: "/hostels?sortBy=rating",
      icon: IoStar,
      label: "Top Rated",
      className: styles.iconYellow
    },
    {
      href: "/hostels?sortBy=popular",
      icon: IoFlame,
      label: "Popular",
      className: styles.iconOrange
    },
    {
      href: "/compare",
      icon: IoGitCompare,
      label: "Compare",
      className: styles.iconPurple
    }
  ]

  return (
    <div className={styles.quickActions}>
      {actions.map((action, index) => {
        const Icon = action.icon
        return (
          <Link
            key={index}
            href={action.href}
            prefetch={true}
            className={styles.quickActionCard}
            onMouseEnter={() => handleMouseEnter(action.href)}
            onTouchStart={() => handleTouchStart(action.href)}
          >
            <div className={`${styles.quickActionIcon} ${action.className}`}>
              <Icon size={22} />
            </div>
            <span className={styles.quickActionText}>{action.label}</span>
          </Link>
        )
      })}
    </div>
  )
}
