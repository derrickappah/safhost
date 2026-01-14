'use client'

import { IoFilter } from 'react-icons/io5'
import styles from './page.module.css'
import { useFilter } from './FilterContext'

export default function ContactedHeader() {
  const { showFilters, setShowFilters } = useFilter()

  return (
    <header className={styles.header}>
      <h1 className={styles.headerTitle}>Contacted Hostels</h1>
      <button 
        className={styles.filterButton}
        onClick={() => setShowFilters(!showFilters)}
      >
        <IoFilter size={20} color={showFilters ? "#2563eb" : "#64748b"} />
      </button>
    </header>
  )
}
