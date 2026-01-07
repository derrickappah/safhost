'use client'

import { useRouter } from 'next/navigation'
import { IoArrowBack, IoFilter } from 'react-icons/io5'
import styles from './page.module.css'
import { useFilter } from './FilterContext'

export default function ViewedHeader() {
  const router = useRouter()
  const { showFilters, setShowFilters } = useFilter()

  return (
    <header className={styles.header}>
      <button className={styles.backButton} onClick={() => router.back()}>
        <IoArrowBack size={24} color="#1e293b" />
      </button>
      <h1 className={styles.headerTitle}>Viewed Hostels</h1>
      <button 
        className={styles.filterButton}
        onClick={() => setShowFilters(!showFilters)}
      >
        <IoFilter size={20} color={showFilters ? "#2563eb" : "#64748b"} />
      </button>
    </header>
  )
}
