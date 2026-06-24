'use client'

import { useRouter, usePathname } from 'next/navigation'
import { IoArrowBack } from 'react-icons/io5'
import styles from './AdminPageHeader.module.css'

interface AdminPageHeaderProps {
  title: string
  actions?: React.ReactNode
}

export default function AdminPageHeader({ title, actions }: AdminPageHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()

  const pathSegments = pathname.split('/').filter(Boolean)
  const isSubpage = pathSegments.length > 2

  return (
    <header className={`${styles.header} ${isSubpage ? styles.stickyHeader : styles.staticHeader}`}>
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
