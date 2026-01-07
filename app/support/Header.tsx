'use client'

import { useRouter } from 'next/navigation'
import { IoArrowBack } from 'react-icons/io5'
import styles from './page.module.css'

export default function SupportHeader() {
  const router = useRouter()

  return (
    <header className={styles.header}>
      <button 
        className={styles.backButton} 
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <IoArrowBack size={24} color="#1e293b" />
      </button>
      <h1 className={styles.headerTitle}>Support</h1>
      <div style={{ width: '40px' }} />
    </header>
  )
}
