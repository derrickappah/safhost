'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { IoArrowBack, IoSearch, IoCloseCircle, IoList } from 'react-icons/io5'
import styles from './page.module.css'
import { useMap } from './MapContext'

export default function MapHeader() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { 
    searchQuery, 
    setSearchQuery, 
    showList, 
    setShowList,
    showSearch,
    setShowSearch 
  } = useMap()

  const handleBack = () => {
    // 1. If search is open, close it and clear query
    if (showSearch) {
      setShowSearch(false)
      if (searchQuery) setSearchQuery('')
      return
    }

    // 2. If list is open, close it
    if (showList) {
      setShowList(false)
      return
    }

    // 3. Default back behavior
    // This will naturally handle URL state like directions or selected hostels
    router.back()
  }

  return (
    <>
      <header className={styles.header}>
        <button 
          className={styles.backButton} 
          onClick={handleBack}
          aria-label="Go back"
        >
          <IoArrowBack size={22} color="#1e293b" />
        </button>

        <div className={styles.headerActions}>
          <button
            className={styles.searchToggleButton}
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Toggle search"
          >
            <IoSearch size={22} color={showSearch ? "#2563eb" : "#1e293b"} />
          </button>
          
          <button
            className={styles.listButton}
            onClick={() => setShowList(!showList)}
            aria-label="Toggle list"
          >
            <IoList size={22} color={showList ? "#2563eb" : "#1e293b"} />
          </button>
        </div>
      </header>

      <div className={`${styles.searchContainer} ${showSearch ? styles.searchContainerVisible : ''}`}>
        <div className={styles.searchBar}>
          <IoSearch size={20} color="#94a3b8" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search hostels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus={showSearch}
          />
          {searchQuery.length > 0 && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px' }}
            >
              <IoCloseCircle size={20} color="#94a3b8" />
            </button>
          )}
        </div>
      </div>
    </>
  )
}
