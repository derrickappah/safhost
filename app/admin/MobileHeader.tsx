'use client'

import { useState } from 'react'
import { IoMenu } from 'react-icons/io5'
import MobileNav from './MobileNav'
import styles from './layout.module.css'

export default function MobileHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <header className={styles.mobileHeader}>
        <button 
          className={styles.menuButton}
          onClick={() => setIsMenuOpen(true)}
          aria-label="Open navigation menu"
          aria-expanded={isMenuOpen}
        >
          <IoMenu size={24} color="#1e293b" />
        </button>
        <div className={styles.mobileHeaderTitle}>Admin Panel</div>
        <div style={{ width: '48px' }} /> {/* Spacer for centering */}
      </header>
      <MobileNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
