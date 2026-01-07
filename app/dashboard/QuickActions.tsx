'use client'

import Link from 'next/link'
import { IoSearch, IoMap, IoStar, IoFlame, IoGitCompare } from 'react-icons/io5'
import styles from './page.module.css'

export default function QuickActions() {
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
            className={styles.quickActionCard}
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
