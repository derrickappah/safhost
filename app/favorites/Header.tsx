'use client'

import { useEffect, useState } from 'react'
import styles from './page.module.css'
import { getFavorites } from '@/lib/actions/favorites'

export default function FavoritesHeader() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    async function loadCount() {
      const { data } = await getFavorites()
      if (data) {
        setCount(data.length)
      }
    }
    loadCount()
  }, [])

  return (
    <header className={styles.header}>
      <h1 className={styles.headerTitle}>Favorites</h1>
      {count > 0 && <span className={styles.headerCount}>{count} saved</span>}
    </header>
  )
}
