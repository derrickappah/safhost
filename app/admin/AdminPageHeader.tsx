'use client'

import { useRouter } from 'next/navigation'
import { IoArrowBack } from 'react-icons/io5'
import styles from './AdminPageHeader.module.css'

interface AdminPageHeaderProps {
  title: string
  actions?: React.ReactNode
}

export default function AdminPageHeader({ title, actions }: AdminPageHeaderProps) {
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
      <h1 className={styles.headerTitle}>{title}</h1>
      <div className={styles.headerActions}>
        {actions}
      </div>
    </header>
  )
}
