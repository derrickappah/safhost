'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'
import dynamic from 'next/dynamic'
import { type Hostel } from '@/lib/actions/hostels'
import HostelsHeader from './HostelsHeader'
import SortMenu from './SortMenu'
import HostelsList from './HostelsList'
import styles from './page.module.css'

// Dynamically import FiltersSheet to reduce initial bundle size
const FiltersSheet = dynamic(() => import('./FiltersSheet'), {
  ssr: false
})

type SortOption = 'price_asc' | 'price_desc' | 'distance' | 'rating' | 'newest' | 'popular'

interface HostelsPageClientProps {
  hostels: Hostel[]
  favorited: Set<string>
  sortBy: SortOption
  initialFilters: {
    minPrice: number
    maxPrice: number
    distance: number
    amenities: string[]
    roomTypes: string[]
    genderRestriction: string
    isAvailable: boolean | undefined
  }
  defaultSchoolId: string | null
}

const MAX_COMPARE = 4

export default function HostelsPageClient({ 
  hostels, 
  favorited, 
  sortBy,
  initialFilters,
  defaultSchoolId
}: HostelsPageClientProps) {
  const { navigate } = useInstantNavigation()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [selectedHostels, setSelectedHostels] = useState<Set<string>>(new Set())

  // Check if compare mode should be enabled from URL
  useEffect(() => {
    const compareParam = searchParams.get('compare')
    if (compareParam === 'true') {
      setCompareMode(true)
    }
  }, [searchParams])

  const toggleCompareMode = () => {
    const newCompareMode = !compareMode
    setCompareMode(newCompareMode)
    if (!newCompareMode) {
      setSelectedHostels(new Set())
    }
    
    // Update URL
    const params = new URLSearchParams(searchParams.toString())
    if (newCompareMode) {
      params.set('compare', 'true')
    } else {
      params.delete('compare')
    }
    router.replace(`/hostels?${params.toString()}`)
  }

  const toggleHostelSelection = (hostelId: string) => {
    setSelectedHostels(prev => {
      const newSet = new Set(prev)
      if (newSet.has(hostelId)) {
        newSet.delete(hostelId)
      } else {
        if (newSet.size < MAX_COMPARE) {
          newSet.add(hostelId)
        } else {
          // Show alert when max is reached
          alert(`You can compare up to ${MAX_COMPARE} hostels at a time. Please remove one to add another.`)
        }
      }
      return newSet
    })
  }

  const handleCompare = () => {
    if (selectedHostels.size > 0) {
      const ids = Array.from(selectedHostels).join(',')
      navigate(`/compare?ids=${ids}`)
    }
  }

  return (
    <div className={styles.container}>
      <HostelsHeader 
        onFilterClick={() => setShowFilters(true)}
        compareMode={compareMode}
        onToggleCompareMode={toggleCompareMode}
        defaultSchoolId={defaultSchoolId}
      />

      {/* Compare Bar */}
      {compareMode && selectedHostels.size > 0 && (
        <div className={styles.compareBar}>
          <span className={styles.compareCount}>
            {selectedHostels.size} of {MAX_COMPARE} selected
          </span>
          <button className={styles.compareButton} onClick={handleCompare}>
            Compare
          </button>
        </div>
      )}

      {/* Results Count */}
      <div className={styles.resultsHeader}>
        <span className={styles.resultsCount}>
          <span className={styles.resultsCountNumber}>{hostels.length}</span> 
          hostels found
        </span>
        <SortMenu currentSort={sortBy} />
      </div>

      {/* Hostel List */}
      <HostelsList 
        initialHostels={hostels} 
        initialFavorited={favorited}
        compareMode={compareMode}
        selectedHostels={selectedHostels}
        onToggleSelection={toggleHostelSelection}
      />

      {/* Filter Modal */}
      <FiltersSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        initialFilters={initialFilters}
      />
    </div>
  )
}
