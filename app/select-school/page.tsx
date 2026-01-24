'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoSchool, IoSearch, IoCloseCircle, IoLocation, IoCheckmark, IoNavigate } from 'react-icons/io5'
import styles from './page.module.css'
import { getSchools } from '@/lib/actions/schools'
import { getCurrentLocation, calculateDistance } from '@/lib/location/detect'
import { updateProfile } from '@/lib/actions/profile'
import { getCurrentUser } from '@/lib/auth/client'
import Loader from '@/components/Loader'

interface School {
  id: string
  name: string
  location: string
  latitude?: number | null
  longitude?: number | null
}

export default function SelectSchoolPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [schools, setSchools] = useState<School[]>([])
  const [loading, setLoading] = useState(true)
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [nearestSchool, setNearestSchool] = useState<string | null>(null)

  useEffect(() => {
    async function loadSchools() {
      const { data, error } = await getSchools()
      if (data) {
        setSchools(data)
      }
      setLoading(false)
    }
    loadSchools()
  }, [])

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectSchool = (schoolId: string) => {
    setSelectedSchool(schoolId)
    // Store selected school in localStorage
    localStorage.setItem('selectedSchool', schoolId)
  }

  const handleUseLocation = async () => {
    setDetectingLocation(true)
    try {
      const location = await getCurrentLocation()
      if (!location) {
        alert('Unable to detect your location. Please enable location services and try again.')
        setDetectingLocation(false)
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
        localStorage.setItem('selectedSchool', nearest.school.id)
      } else {
        alert('No schools found with location data. Please select a school manually.')
      }
    } catch (error) {
      console.error('Location error:', error)
      alert('Failed to detect location. Please select a school manually.')
    } finally {
      setDetectingLocation(false)
    }
  }

  const handleContinue = async () => {
    if (selectedSchool) {
      setIsRedirecting(true)
      // Check if user is authenticated
      const { data: userData } = await getCurrentUser()

      if (userData?.user) {
        // Save school to user profile
        const { error } = await updateProfile(undefined, undefined, undefined, selectedSchool)
        if (error) {
          console.error('Error saving school:', error)
          // Still continue even if save fails
        }
      }

      // Store in localStorage as fallback
      localStorage.setItem('selectedSchool', selectedSchool)

      // Use window.location.href to force a full reload and bypass any client-side router cache/issues
      window.location.href = '/hostels'
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
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

      {/* School List */}
      <div className={styles.listContainer}>
        {filteredSchools.length === 0 ? (
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
            className={styles.continueButton}
            onClick={handleContinue}
            disabled={isRedirecting}
            style={{ opacity: isRedirecting ? 0.7 : 1, cursor: isRedirecting ? 'not-allowed' : 'pointer' }}
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
