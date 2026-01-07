'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { IoLocationOutline, IoOptionsOutline, IoGitCompareOutline } from 'react-icons/io5'
import styles from './page.module.css'
import SearchAutocomplete from '@/components/SearchAutocomplete'

interface HostelsHeaderProps {
  onFilterClick: () => void
  compareMode?: boolean
  onToggleCompareMode?: () => void
  defaultSchoolId?: string | null
}

export default function HostelsHeader({ 
  onFilterClick, 
  compareMode = false,
  onToggleCompareMode,
  defaultSchoolId
}: HostelsHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const schoolId = searchParams.get('school')

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Find Hostels</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {onToggleCompareMode && (
            <button
              className={`${styles.compareModeButton} ${compareMode ? styles.compareModeButtonActive : ''}`}
              onClick={onToggleCompareMode}
              title={compareMode ? "Exit comparison mode" : "Compare hostels"}
            >
              <IoGitCompareOutline size={22} color={compareMode ? "#fff" : "#2563eb"} />
            </button>
          )}
          <button 
            className={styles.mapButton}
            title="Open map view"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              const currentSchool = params.get('school')
              
              // Prioritize: Current Search > Profile Default > LocalStorage Fallback
              const defaultSchool = defaultSchoolId || localStorage.getItem('selectedSchool')
              
              const targetSchool = currentSchool || defaultSchool
              
              if (targetSchool) {
                params.set('school', targetSchool)
              }
              
              router.push(`/hostels/map?${params.toString()}`)
            }}
          >
            <IoLocationOutline size={22} color="#2563eb" />
          </button>
        </div>
      </header>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <SearchAutocomplete
          placeholder="Search hostels or schools..."
          onSelect={(result) => {
            if (result.type === 'hostel') {
              router.push(`/hostel/${result.id}`)
            } else {
              router.push(`/hostels?school=${result.id}`)
            }
          }}
        />
        <button className={styles.filterButton} onClick={onFilterClick}>
          <IoOptionsOutline size={20} color="#1e293b" />
        </button>
      </div>
    </>
  )
}
