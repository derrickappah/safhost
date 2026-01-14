'use client'

import { useState, useEffect, useRef } from 'react'
import { IoSearch, IoLocation, IoSchool } from 'react-icons/io5'
import { autocompleteSearch } from '@/lib/actions/hostels'
import styles from './SearchAutocomplete.module.css'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'

interface SearchResult {
  type: 'hostel' | 'school'
  id: string
  name: string
  location?: string
}

interface SearchAutocompleteProps {
  placeholder?: string
  onSelect?: (result: SearchResult) => void
  className?: string
}

export default function SearchAutocomplete({
  placeholder = 'Search hostels or schools...',
  onSelect,
  className,
}: SearchAutocompleteProps) {
  const { navigate } = useInstantNavigation()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setShowResults(false)
      return
    }

    const search = async () => {
      setLoading(true)
      const { data, error } = await autocompleteSearch(query, 5)
      if (data && !error) {
        setResults(data)
        setShowResults(true)
      } else {
        setResults([])
      }
      setLoading(false)
    }

    const timeoutId = setTimeout(search, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSelect = (result: SearchResult) => {
    setQuery('')
    setShowResults(false)
    
    if (onSelect) {
      onSelect(result)
    } else {
      // Default behavior
      if (result.type === 'hostel') {
        navigate(`/hostel/${result.id}`)
      } else {
        navigate(`/hostels?school=${result.id}`)
      }
    }
  }

  return (
    <div ref={containerRef} className={`${styles.container} ${className || ''}`}>
      <div className={styles.searchBar}>
        <IoSearch size={20} color="#94a3b8" />
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) {
              setShowResults(true)
            }
          }}
        />
        {loading && <div className={styles.loader} />}
      </div>

      {showResults && results.length > 0 && (
        <div className={styles.results}>
          {results.map((result) => (
            <button
              key={`${result.type}-${result.id}`}
              className={styles.resultItem}
              onClick={() => handleSelect(result)}
            >
              <div className={styles.resultIcon}>
                {result.type === 'hostel' ? (
                  <IoLocation size={18} color="#2563eb" />
                ) : (
                  <IoSchool size={18} color="#2563eb" />
                )}
              </div>
              <div className={styles.resultContent}>
                <div className={styles.resultName}>{result.name}</div>
                {result.location && (
                  <div className={styles.resultLocation}>{result.location}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
