'use client'

import { useRouter } from 'next/navigation'
import { IoClose } from 'react-icons/io5'
import styles from './page.module.css'

export default function SubscribeHeader() {
  const router = useRouter()

  return (
    <header className={styles.header}>
      <button 
        className={styles.closeButton} 
        onClick={() => router.back()}
        aria-label="Close"
      >
        <IoClose size={24} color="#1e293b" />
      </button>
      <h1 className={styles.headerTitle}>Subscribe</h1>
      <div style={{ width: '40px' }} />
    </header>
  )
}
