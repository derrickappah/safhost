'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useRef, useEffect, useState } from 'react'
import { IoChevronDown, IoCheckmark } from 'react-icons/io5'
import styles from './page.module.css'

type SortOption = 'price_asc' | 'price_desc' | 'distance' | 'rating' | 'newest' | 'popular'

interface SortMenuProps {
  currentSort: SortOption
}

export default function SortMenu({ currentSort }: SortMenuProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('click', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showMenu])

  const setSort = (sort: SortOption) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', sort)
    router.push(`/hostels?${params.toString()}`)
    setShowMenu(false)
  }

  const sortLabels: Record<SortOption, string> = {
    price_asc: 'Price: Low to High',
    price_desc: 'Price: High to Low',
    distance: 'Distance',
    rating: 'Rating',
    newest: 'Newest First',
    popular: 'Most Popular'
  }

  return (
    <div className={styles.sortContainer} ref={menuRef}>
      <button
        className={styles.sortButton}
        onClick={() => setShowMenu(!showMenu)}
      >
        <span className={styles.sortText}>
          {sortLabels[currentSort]}
        </span>
        <IoChevronDown
          size={16}
          color="#2563eb"
          style={{
            transform: showMenu ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        />
      </button>
      {showMenu && (
        <div className={styles.sortMenu}>
          {(['newest', 'price_asc', 'price_desc', 'distance', 'rating', 'popular'] as SortOption[]).map((sort) => (
            <button
              key={sort}
              className={`${styles.sortOption} ${currentSort === sort ? styles.sortOptionActive : ''}`}
              onClick={() => setSort(sort)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <span>{sortLabels[sort]}</span>
                {currentSort === sort && <IoCheckmark size={18} color="#2563eb" />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
