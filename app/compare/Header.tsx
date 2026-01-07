'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { IoArrowBack, IoAdd } from 'react-icons/io5'
import styles from './page.module.css'
import { getHostelById } from '@/lib/actions/hostels'

export default function CompareHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeCount, setActiveCount] = useState(0)

  useEffect(() => {
    async function loadCount() {
      const ids = searchParams.get('ids')?.split(',').filter(Boolean) || []
      if (ids.length > 0) {
        const loadedHostels = await Promise.all(
          ids.map(async (id) => {
            const { data } = await getHostelById(id)
            return data
          })
        )
        setActiveCount(loadedHostels.filter(h => h !== null).length)
      } else {
        setActiveCount(0)
      }
    }
    loadCount()
  }, [searchParams])

  const addHostel = () => {
    router.push(`/hostels?compare=true`)
  }

  return (
    <header className={styles.header}>
      <button className={styles.backButton} onClick={() => router.back()}>
        <IoArrowBack size={24} color="#1e293b" />
      </button>
      <h1 className={styles.headerTitle}>Compare Hostels</h1>
      {activeCount > 0 && activeCount < 4 && (
        <button 
          className={styles.addButton} 
          onClick={addHostel}
          title="Add hostel to compare"
          aria-label="Add hostel to compare"
        >
          <IoAdd size={24} color="#2563eb" />
        </button>
      )}
    </header>
  )
}
