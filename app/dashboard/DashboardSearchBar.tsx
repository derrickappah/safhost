'use client'

import { useState, useEffect, useRef, useCallback, type KeyboardEvent, type FormEvent } from 'react'
import {
  IoSearchOutline,
  IoCloseCircle,
  IoHomeOutline,
  IoSchoolOutline,
  IoLocationOutline,
} from 'react-icons/io5'
import { autocompleteSearch, type AutocompleteResult } from '@/lib/actions/hostels'
import type { School } from '@/lib/actions/schools'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'
import styles from './page.module.css'

export interface DashboardSearchBarProps {
  schools?: School[]
  activeSchool?: School | null
  className?: string
}

interface CampusChip {
  name: string
  query: string
  schoolId?: string
}

const DEFAULT_POPULAR_CAMPUSES = [
  { name: 'UG Legon', query: 'University of Ghana' },
  { name: 'KNUST', query: 'Kwame Nkrumah' },
  { name: 'UPSA', query: 'UPSA' },
  { name: 'UCC', query: 'University of Cape Coast' },
  { name: 'ATU', query: 'Accra Technical University' },
]

export default function DashboardSearchBar({
  schools = [],
  activeSchool = null,
  className,
}: DashboardSearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AutocompleteResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [hasSearched, setHasSearched] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { navigate, handleMouseEnter, handleTouchStart } = useInstantNavigation()

  // Match campus chips to school records if available
  const campusChips: CampusChip[] = DEFAULT_POPULAR_CAMPUSES.map((campus) => {
    const matched = schools.find(
      (s) =>
        s.name.toLowerCase().includes(campus.query.toLowerCase()) ||
        campus.query.toLowerCase().includes(s.name.toLowerCase())
    )
    return {
      name: campus.name,
      query: campus.query,
      schoolId: matched?.id,
    }
  })

  // Dismiss dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 250ms debounced autocomplete query
  useEffect(() => {
    const trimmed = query.slice(0, 100).trim()

    if (trimmed.length < 2) {
      setResults([])
      setIsOpen(false)
      setLoading(false)
      setHasSearched(false)
      setSelectedIndex(-1)
      return
    }

    setLoading(true)
    const timeoutId = setTimeout(async () => {
      try {
        const { data, error } = await autocompleteSearch(trimmed, 6)
        if (data && !error) {
          setResults(data)
          setIsOpen(true)
        } else {
          setResults([])
          setIsOpen(true)
        }
      } catch {
        setResults([])
        setIsOpen(true)
      } finally {
        setLoading(false)
        setHasSearched(true)
        setSelectedIndex(-1)
      }
    }, 250)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Categorize suggestions
  const hostelResults = results.filter((r) => r.type === 'hostel')
  const schoolResults = results.filter((r) => r.type === 'school')
  const flatResults = [...hostelResults, ...schoolResults]

  // Clear query handler
  const handleClear = useCallback(() => {
    setQuery('')
    setResults([])
    setIsOpen(false)
    setLoading(false)
    setHasSearched(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }, [])

  // Navigate to item
  const handleSelectItem = useCallback(
    (item: AutocompleteResult) => {
      setIsOpen(false)
      setSelectedIndex(-1)
      if (item.type === 'hostel') {
        navigate(`/hostel/${item.id}`)
      } else {
        navigate(`/hostels?school=${encodeURIComponent(item.id)}`)
      }
    },
    [navigate]
  )

  // Submit full query
  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      if (e) e.preventDefault()
      const trimmed = query.trim()
      if (!trimmed) return

      if (selectedIndex >= 0 && selectedIndex < flatResults.length) {
        handleSelectItem(flatResults[selectedIndex])
        return
      }

      setIsOpen(false)
      setSelectedIndex(-1)
      navigate(`/hostels?search=${encodeURIComponent(trimmed)}`)
    },
    [query, selectedIndex, flatResults, handleSelectItem, navigate]
  )

  // Keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
      inputRef.current?.blur()
      return
    }

    if (!isOpen || flatResults.length === 0) {
      if (e.key === 'Enter') {
        handleSubmit(e)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < flatResults.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatResults.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Handle campus chip click
  const handleChipClick = (chip: CampusChip) => {
    if (chip.schoolId) {
      navigate(`/hostels?school=${encodeURIComponent(chip.schoolId)}`)
    } else {
      navigate(`/hostels?search=${encodeURIComponent(chip.query)}`)
    }
  }

  return (
    <div
      ref={containerRef}
      className={`${styles.searchContainer} ${className || ''}`}
      role="search"
      aria-label="Student hostel search"
    >
      <form onSubmit={handleSubmit} className={styles.searchBar} role="searchbox">
        <div className={styles.searchIcon} aria-hidden="true">
          <IoSearchOutline size={20} />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0 || (query.trim().length >= 2 && hasSearched)) {
              setIsOpen(true)
            }
          }}
          placeholder="Search hostels, campuses, locations..."
          className={styles.searchInput}
          aria-label="Search hostels, campuses, locations"
          autoComplete="off"
          spellCheck={false}
        />

        {query.length > 0 && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleClear}
            aria-label="Clear search"
          >
            <IoCloseCircle size={18} />
          </button>
        )}

        {loading && <div className={styles.searchSpinner} aria-label="Searching..." />}
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className={styles.dropdown} role="listbox" aria-label="Search suggestions">
          {flatResults.length > 0 ? (
            <>
              {hostelResults.length > 0 && (
                <div className={styles.suggestionGroup}>
                  <div className={styles.suggestionGroupTitle}>Hostels</div>
                  {hostelResults.map((item) => {
                    const flatIdx = flatResults.findIndex((r) => r.id === item.id && r.type === item.type)
                    const isSelected = flatIdx === selectedIndex
                    return (
                      <button
                        key={`hostel-${item.id}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`${styles.suggestionItem} ${isSelected ? styles.suggestionItemSelected : ''}`}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => {
                          setSelectedIndex(flatIdx)
                          handleMouseEnter(`/hostel/${item.id}`)
                        }}
                        onTouchStart={() => handleTouchStart(`/hostel/${item.id}`)}
                      >
                        <div className={`${styles.suggestionIcon} ${styles.hostelIconBg}`}>
                          <IoHomeOutline size={16} />
                        </div>
                        <div className={styles.suggestionText}>
                          <span className={styles.suggestionName}>{item.name}</span>
                          {item.location && (
                            <span className={styles.suggestionLocation}>
                              <IoLocationOutline size={12} />
                              {item.location}
                            </span>
                          )}
                        </div>
                        <span className={`${styles.suggestionBadge} ${styles.hostelBadge}`}>
                          Hostel
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {schoolResults.length > 0 && (
                <div className={styles.suggestionGroup}>
                  <div className={styles.suggestionGroupTitle}>Campuses & Areas</div>
                  {schoolResults.map((item) => {
                    const flatIdx = flatResults.findIndex((r) => r.id === item.id && r.type === item.type)
                    const isSelected = flatIdx === selectedIndex
                    const schoolHref = `/hostels?school=${encodeURIComponent(item.id)}`
                    return (
                      <button
                        key={`school-${item.id}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        className={`${styles.suggestionItem} ${isSelected ? styles.suggestionItemSelected : ''}`}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => {
                          setSelectedIndex(flatIdx)
                          handleMouseEnter(schoolHref)
                        }}
                        onTouchStart={() => handleTouchStart(schoolHref)}
                      >
                        <div className={`${styles.suggestionIcon} ${styles.schoolIconBg}`}>
                          <IoSchoolOutline size={16} />
                        </div>
                        <div className={styles.suggestionText}>
                          <span className={styles.suggestionName}>{item.name}</span>
                          {item.location && (
                            <span className={styles.suggestionLocation}>
                              <IoLocationOutline size={12} />
                              {item.location}
                            </span>
                          )}
                        </div>
                        <span className={`${styles.suggestionBadge} ${styles.schoolBadge}`}>
                          Campus
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </>
          ) : (
            !loading &&
            hasSearched &&
            query.trim().length >= 2 && (
              <div className={styles.emptySuggestion}>
                {`No hostels or campuses found for '${query.trim()}'`}
              </div>
            )
          )}
        </div>
      )}

      {/* Campus Filter Chips */}
      <div className={styles.chipsRow} aria-label="Quick campus filters">
        <span className={styles.chipsLabel}>Quick Campuses:</span>
        <div className={styles.chipsScroll}>
          {campusChips.map((chip) => {
            const isActive = !!(chip.schoolId && activeSchool?.id === chip.schoolId)
            const targetHref = chip.schoolId
              ? `/hostels?school=${encodeURIComponent(chip.schoolId)}`
              : `/hostels?search=${encodeURIComponent(chip.query)}`
            return (
              <button
                key={chip.name}
                type="button"
                className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
                onClick={() => handleChipClick(chip)}
                onMouseEnter={() => handleMouseEnter(targetHref)}
                onTouchStart={() => handleTouchStart(targetHref)}
              >
                {chip.name}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
