'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { IoHome, IoHomeOutline, IoSearch, IoSearchOutline, IoMegaphone, IoMegaphoneOutline, IoHeart, IoHeartOutline, IoPerson, IoPersonOutline } from 'react-icons/io5'
import styles from './BottomNav.module.css'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'

export default function BottomNav() {
  const pathname = usePathname()
  const [advertisementEnabled, setAdvertisementEnabled] = useState<boolean | null>(null)
  const { handleMouseEnter, handleTouchStart } = useInstantNavigation()

  // Don't show bottom nav on these pages
  const hiddenPaths = ['/subscribe', '/select-school', '/admin', '/auth', '/hostels/map']
  const shouldHide = pathname === '/' || hiddenPaths.some(path => pathname.startsWith(path))
  
  // Load advertisement setting
  useEffect(() => {
    async function loadSetting() {
      try {
        const response = await fetch('/api/settings/advertisement')
        const data = await response.json()
        setAdvertisementEnabled(data.enabled ?? true)
      } catch (error) {
        console.error('Error loading advertisement setting:', error)
        // Default to enabled on error
        setAdvertisementEnabled(true)
      }
    }
    loadSetting()
  }, [])
  
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
    ...(advertisementEnabled === true ? [{
      name: 'Advertisement',
      href: '/advertisement',
      icon: IoMegaphone,
      iconOutline: IoMegaphoneOutline,
    }] : []),
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
          (tab.href === '/advertisement' && pathname.startsWith('/advertisement')) ||
          (tab.href === '/favorites' && pathname === '/favorites') ||
          (tab.href === '/profile' && pathname === '/profile')
        const Icon = isActive ? tab.icon : tab.iconOutline
        return (
          <Link
            key={tab.href}
            href={tab.href}
            prefetch={true}
            className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
            onMouseEnter={() => handleMouseEnter(tab.href)}
            onTouchStart={() => handleTouchStart(tab.href)}
          >
            <div className={`${styles.iconContainer} ${isActive ? styles.iconContainerActive : ''}`}>
              <Icon size={24} color={isActive ? '#2563eb' : '#94a3b8'} />
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
