'use client'

import { useState, useEffect, useRef, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import {
  IoSearch,
  IoLocationOutline,
  IoSchoolOutline,
  IoCloseCircle,
  IoArrowForward,
} from 'react-icons/io5'
import { autocompleteSearch } from '@/lib/actions/hostels'
import styles from './page.module.css'

interface SearchResult {
  type: 'hostel' | 'school'
  id: string
  name: string
  location?: string
}

const POPULAR_CAMPUSES = [
  { name: 'UG Legon', query: 'University of Ghana' },
  { name: 'KNUST', query: 'Kwame Nkrumah University' },
  { name: 'UPSA', query: 'UPSA' },
  { name: 'UCC', query: 'University of Cape Coast' },
  { name: 'ATU', query: 'Accra Technical University' },
]

export default function SearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Debounced search autocomplete
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const { data, error } = await autocompleteSearch(query.trim(), 5)
        if (data && !error && data.length > 0) {
          setResults(data)
          setShowResults(true)
        } else {
          setResults([])
        }
      } catch (err) {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => clearTimeout(timer)
  }, [query])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      setShowResults(false)
      router.push(`/hostels?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    setShowResults(false)
    if (result.type === 'hostel') {
      router.push(`/hostel/${result.id}`)
    } else {
      router.push(`/hostels?school=${encodeURIComponent(result.id)}`)
    }
  }

  const handleCampusChipClick = (campusQuery: string) => {
    router.push(`/hostels?search=${encodeURIComponent(campusQuery)}`)
  }

  return (
    <div ref={containerRef} className={styles.searchWrapper}>
      <form onSubmit={handleSubmit} className={styles.searchBar}>
        <div className={styles.searchIcon}>
          <IoSearch size={22} />
        </div>
        <input
          type="text"
          placeholder="Search by campus, school, or hostel name..."
          className={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowResults(true)
          }}
          aria-label="Search hostels or schools"
        />

        {query && (
          <button
            type="button"
            className={styles.searchClearButton}
            onClick={() => {
              setQuery('')
              setResults([])
              setShowResults(false)
            }}
            aria-label="Clear search"
          >
            <IoCloseCircle size={20} />
          </button>
        )}

        <button type="submit" className={styles.searchActionButton}>
          <span>Search</span>
          <IoArrowForward size={16} className={styles.searchButtonArrow} />
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {showResults && results.length > 0 && (
        <div className={styles.searchDropdown}>
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              type="button"
              className={styles.dropdownItem}
              onClick={() => handleSelectResult(result)}
            >
              <div className={styles.dropdownItemIcon}>
                {result.type === 'hostel' ? (
                  <IoLocationOutline size={18} />
                ) : (
                  <IoSchoolOutline size={18} />
                )}
              </div>
              <div className={styles.dropdownItemText}>
                <span className={styles.dropdownItemName}>{result.name}</span>
                {result.location && (
                  <span className={styles.dropdownItemLocation}>{result.location}</span>
                )}
              </div>
              <span className={styles.dropdownItemBadge}>
                {result.type === 'hostel' ? 'Hostel' : 'Campus'}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Quick Campus Chips */}
      <div className={styles.campusChips}>
        <span className={styles.campusChipsLabel}>Popular Campuses:</span>
        <div className={styles.chipsScroll}>
          {POPULAR_CAMPUSES.map((campus) => (
            <button
              key={campus.name}
              type="button"
              className={styles.campusChip}
              onClick={() => handleCampusChipClick(campus.query)}
            >
              {campus.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
