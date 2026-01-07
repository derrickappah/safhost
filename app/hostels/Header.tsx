'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { IoLocationOutline } from 'react-icons/io5'
import styles from './page.module.css'

export default function HostelsHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const schoolId = searchParams.get('school')

  return (
    <header className={styles.header}>
      <h1 className={styles.headerTitle}>Find Hostels</h1>
      <button 
        className={styles.mapButton}
        title="Open map view"
        onClick={() => {
          const params = new URLSearchParams()
          if (schoolId) params.set('school', schoolId)
          router.push(`/hostels/map?${params.toString()}`)
        }}
      >
        <IoLocationOutline size={22} color="#2563eb" />
      </button>
    </header>
  )
}
