'use client'

import { useRouter } from 'next/navigation'
import { IoArrowBack } from 'react-icons/io5'
import styles from './users/page.module.css'

interface AdminPageHeaderProps {
  title: string
}

export default function AdminPageHeader({ title }: AdminPageHeaderProps) {
  const router = useRouter()

  return (
    <header className={styles.header}>
      <button className={styles.backButton} onClick={() => router.back()}>
        <IoArrowBack size={24} color="#1e293b" />
      </button>
      <h1 className={styles.headerTitle}>{title}</h1>
      <div style={{ width: '40px' }} />
    </header>
  )
}
