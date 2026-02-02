'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoSchool, IoSearch, IoCloseCircle, IoLocation, IoCheckmark, IoNavigate, IoWarning } from 'react-icons/io5'
import styles from './page.module.css'
import { getSchools, type School } from '@/lib/actions/schools'
import { getCurrentLocation, calculateDistance } from '@/lib/location/detect'
import { updateProfile } from '@/lib/actions/profile'
import { getCurrentUser } from '@/lib/auth/client'
import Loader from '@/components/Loader'

const STORAGE_KEY_SELECTED_SCHOOL = 'selectedSchool'

function SelectSchoolContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [nearestSchool, setNearestSchool] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSchools() {
      try {
        setLoading(true)
        setError(null)
        const { data, error: apiError } = await getSchools()

        if (apiError) {
          throw new Error(apiError)
        }

        if (data) {
          setSchools(data)
        }
      } catch (err) {
        console.error('Failed to load schools:', err)
        setError('Unable to load schools. Please check your connection and try again.')
      } finally {
        setLoading(false)
      }
    }
    loadSchools()
  }, [])

  const filteredSchools = useMemo(() => schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.location.toLowerCase().includes(searchQuery.toLowerCase())
  ), [schools, searchQuery])

  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchool(schoolId)
    setActionError(null)
    // Store selected school in localStorage
    localStorage.setItem(STORAGE_KEY_SELECTED_SCHOOL, schoolId)
  }

  const handleUseLocation = async () => {
    setDetectingLocation(true)
    setActionError(null)
    try {
      const location = await getCurrentLocation()
      if (!location) {
        setActionError('Unable to detect your location. Please enable location services and try again.')
        return
      }

      // Calculate distance to each school and find the nearest one
      let nearest: { school: School; distance: number } | null = null

      for (const school of schools) {
        if (school.latitude && school.longitude) {
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            school.latitude,
            school.longitude
          )

          if (!nearest || distance < nearest.distance) {
            nearest = { school, distance }
          }
        }
      }

      if (nearest) {
        setSelectedSchool(nearest.school.id)
        setNearestSchool(nearest.school.id)
        localStorage.setItem(STORAGE_KEY_SELECTED_SCHOOL, nearest.school.id)
      } else {
        setActionError('No schools found with location data. Please select a school manually.')
      }
    } catch (error) {
      console.error('Location error:', error)
      setActionError('Failed to detect location. Please select a school manually.')
    } finally {
      setDetectingLocation(false)
    }
  }

  const handleContinue = async () => {
    if (!selectedSchool) return
    setIsRedirecting(true)
    setActionError(null)

    try {
      // Store in localStorage immediately as fallback
      localStorage.setItem(STORAGE_KEY_SELECTED_SCHOOL, selectedSchool)

      // Check if user is authenticated
      const { data: userData } = await getCurrentUser()

      if (userData?.user) {
        // Save school to user profile
        const { error } = await updateProfile(undefined, undefined, undefined, selectedSchool)

        if (error) {
          // If update fails, show error and stop redirect to prevent loop
          setActionError('Failed to save your school selection. Please try again.')
          setIsRedirecting(false)
          return
        }
      }

      // Smooth SPA navigation to intended page or dashboard
      router.push(redirect)
    } catch (error) {
      console.error('Critical error in handleContinue:', error)
      setIsRedirecting(false)
      setActionError('Something went wrong. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loaderWrapper}>
          <Loader />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <IoSchool size={28} color="#2563eb" />
        </div>
        <h1 className={styles.headerTitle}>Select Your School</h1>
        <p className={styles.headerSubtitle}>
          We'll show you hostels near your campus
        </p>
      </header>

      {/* Search */}
      <div className={styles.searchContainer}>
        <div className={styles.searchBar}>
          <IoSearch size={20} color="#94a3b8" />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search schools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <button onClick={() => setSearchQuery("")}>
              <IoCloseCircle size={20} color="#94a3b8" />
            </button>
          )}
        </div>
        <button
          className={styles.locationButton}
          onClick={handleUseLocation}
          disabled={detectingLocation}
        >
          <IoNavigate size={18} color={detectingLocation ? "#94a3b8" : "#2563eb"} />
          <span className={styles.locationButtonText}>
            {detectingLocation ? 'Detecting...' : 'Use my location'}
          </span>
        </button>
      </div>

      {/* Action Error Message */}
      {actionError && (
        <div className={styles.errorContainer}>
          <IoWarning size={20} color="#dc2626" />
          <span className={styles.errorMessage}>{actionError}</span>
          <button
            className={styles.retryButton}
            onClick={() => setActionError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* School List */}
      <div className={styles.listContainer}>
        {error ? (
          <div className={styles.errorContainer} style={{ margin: 0 }}>
            <IoWarning size={24} color="#dc2626" />
            <div className={styles.errorMessage}>
              {error}
            </div>
            <button
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredSchools.length === 0 ? (
          <div className={styles.emptyState}>
            <IoSearch size={48} color="#cbd5e1" />
            <h2 className={styles.emptyTitle}>No schools found</h2>
            <p className={styles.emptySubtitle}>
              Try a different search term
            </p>
          </div>
        ) : (
          filteredSchools.map((school) => (
            <button
              key={school.id}
              className={`${styles.schoolCard} ${selectedSchool === school.id ? styles.schoolCardSelected : ''}`}
              onClick={() => handleSelectSchool(school.id)}
            >
              <div className={styles.schoolIcon}>
                <IoSchool
                  size={24}
                  color={selectedSchool === school.id ? "#2563eb" : "#64748b"}
                />
              </div>
              <div className={styles.schoolInfo}>
                <h3 className={`${styles.schoolName} ${selectedSchool === school.id ? styles.schoolNameSelected : ''}`}>
                  {school.name}
                </h3>
                <div className={styles.schoolMeta}>
                  <IoLocation size={12} color="#94a3b8" />
                  <span className={styles.schoolLocation}>{school.location}</span>
                </div>
              </div>
              {selectedSchool === school.id && (
                <div className={styles.checkIcon}>
                  <IoCheckmark size={18} color="#fff" />
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Continue Button */}
      {selectedSchool && (
        <div className={styles.bottomCTA}>
          <button
            className={`${styles.continueButton} ${isRedirecting ? styles.continueButtonDisabled : ''}`}
            onClick={handleContinue}
            disabled={isRedirecting}
          >
            <span className={styles.continueButtonText}>
              {isRedirecting ? 'Continuing...' : 'Continue'}
            </span>
            {!isRedirecting && <IoCheckmark size={20} color="#fff" />}
          </button>
        </div>
      )}
    </div>
  )
}

export default function SelectSchoolPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loaderWrapper}>
          <Loader />
        </div>
      </div>
    }>
      <SelectSchoolContent />
    </Suspense>
  )
}
