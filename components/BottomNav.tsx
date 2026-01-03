'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { IoHome, IoHomeOutline, IoSearch, IoSearchOutline, IoHeart, IoHeartOutline, IoPerson, IoPersonOutline } from 'react-icons/io5'
import styles from './BottomNav.module.css'

export default function BottomNav() {
  const pathname = usePathname()

  // Don't show bottom nav on these pages
  const hiddenPaths = ['/subscribe', '/select-school', '/admin', '/auth']
  const shouldHide = pathname === '/' || hiddenPaths.some(path => pathname.startsWith(path))
  
  useEffect(() => {
    if (shouldHide) {
      document.body.classList.remove('has-bottom-nav')
    } else {
      document.body.classList.add('has-bottom-nav')
    }
    return () => {
      document.body.classList.remove('has-bottom-nav')
    }
  }, [shouldHide])

  if (shouldHide) {
    return null
  }

  const tabs = [
    {
      name: 'Home',
      href: '/dashboard',
      icon: IoHome,
      iconOutline: IoHomeOutline,
    },
    {
      name: 'Hostels',
      href: '/hostels',
      icon: IoSearch,
      iconOutline: IoSearchOutline,
    },
    {
      name: 'Favorites',
      href: '/favorites',
      icon: IoHeart,
      iconOutline: IoHeartOutline,
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: IoPerson,
      iconOutline: IoPersonOutline,
    },
  ]

  return (
    <nav className={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href || 
          (tab.href === '/dashboard' && (pathname === '/' || pathname === '/dashboard')) ||
          (tab.href === '/hostels' && pathname.startsWith('/hostel')) ||
          (tab.href === '/favorites' && pathname === '/favorites') ||
          (tab.href === '/profile' && pathname === '/profile')
        const Icon = isActive ? tab.icon : tab.iconOutline
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
          >
            <div className={`${styles.iconContainer} ${isActive ? styles.iconContainerActive : ''}`}>
              <Icon size={22} color={isActive ? '#2563eb' : '#94a3b8'} />
            </div>
            <span className={styles.tabLabel}>{tab.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}
