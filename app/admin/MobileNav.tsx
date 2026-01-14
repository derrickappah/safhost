'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { IoClose } from 'react-icons/io5'
import styles from './layout.module.css'

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname()

  // Close on navigation
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={styles.drawerBackdrop}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Drawer */}
      <aside 
        className={`${styles.mobileDrawer} ${styles.drawerOpen}`}
        aria-label="Navigation menu"
        role="navigation"
      >
        <div className={styles.drawerHeader}>
          <Image 
            src="/20260101_2143_SafHostel Logo_simple_compose_01kdxr7e9gfrvrqba7hb1811ghjhvh.png" 
            alt="SafHostel Logo" 
            width={140}
            height={40}
            className={styles.logoImage}
          />
          <p className={styles.logoSubtext}>Admin Panel</p>
          <button 
            className={styles.drawerCloseButton}
            onClick={onClose}
            aria-label="Close menu"
          >
            <IoClose size={24} color="#fff" />
          </button>
        </div>
        <nav className={styles.drawerNav}>
          <Link 
            href="/admin/dashboard" 
            className={`${styles.drawerNavLink} ${pathname === '/admin/dashboard' ? styles.active : ''}`}
            onClick={onClose}
          >
            Dashboard
          </Link>
          <Link 
            href="/admin/hostels" 
            className={`${styles.drawerNavLink} ${pathname.startsWith('/admin/hostels') ? styles.active : ''}`}
            onClick={onClose}
          >
            Hostels
          </Link>
          <Link 
            href="/admin/schools" 
            className={`${styles.drawerNavLink} ${pathname.startsWith('/admin/schools') ? styles.active : ''}`}
            onClick={onClose}
          >
            Schools
          </Link>
          <Link 
            href="/admin/subscriptions" 
            className={`${styles.drawerNavLink} ${pathname.startsWith('/admin/subscriptions') ? styles.active : ''}`}
            onClick={onClose}
          >
            Subscriptions
          </Link>
          <Link 
            href="/admin/payments" 
            className={`${styles.drawerNavLink} ${pathname.startsWith('/admin/payments') ? styles.active : ''}`}
            onClick={onClose}
          >
            Payments
          </Link>
          <Link 
            href="/admin/promo-codes" 
            className={`${styles.drawerNavLink} ${pathname.startsWith('/admin/promo-codes') ? styles.active : ''}`}
            onClick={onClose}
          >
            Promo Codes
          </Link>
          <Link 
            href="/admin/reports" 
            className={`${styles.drawerNavLink} ${pathname.startsWith('/admin/reports') ? styles.active : ''}`}
            onClick={onClose}
          >
            Reports
          </Link>
          <Link 
            href="/admin/reviews" 
            className={`${styles.drawerNavLink} ${pathname.startsWith('/admin/reviews') ? styles.active : ''}`}
            onClick={onClose}
          >
            Reviews
          </Link>
          <Link 
            href="/admin/users" 
            className={`${styles.drawerNavLink} ${pathname.startsWith('/admin/users') ? styles.active : ''}`}
            onClick={onClose}
          >
            Users
          </Link>
          <Link 
            href="/admin/audit" 
            className={`${styles.drawerNavLink} ${pathname.startsWith('/admin/audit') ? styles.active : ''}`}
            onClick={onClose}
          >
            Audit Log
          </Link>
          <Link 
            href="/admin/logs" 
            className={`${styles.drawerNavLink} ${pathname.startsWith('/admin/logs') ? styles.active : ''}`}
            onClick={onClose}
          >
            View & Contact Logs
          </Link>
          <Link 
            href="/admin/settings" 
            className={`${styles.drawerNavLink} ${pathname.startsWith('/admin/settings') ? styles.active : ''}`}
            onClick={onClose}
          >
            Settings
          </Link>
        </nav>
      </aside>
    </>
  )
}
