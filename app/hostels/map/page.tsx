'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoList, IoLocation, IoCloseCircle, IoStar, IoNavigate } from 'react-icons/io5'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import styles from './page.module.css'
import { getHostels, getHostelById, type Hostel } from '@/lib/actions/hostels'
import { getSchoolById, type School } from '@/lib/actions/schools'
import { hasActiveSubscription } from '@/lib/actions/subscriptions'
import { getCurrentLocation } from '@/lib/location/detect'
import { useMap } from './MapContext'
import Loader from '@/components/Loader'

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Loader />
    </div>
  ),
})

function MapPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const schoolIdParam = searchParams.get('school')
  const hostelIdParam = searchParams.get('hostel')
  const modeParam = searchParams.get('mode')

  const [hostels, setHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null)
  const [destinationSchool, setDestinationSchool] = useState<School | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 5.6037, // Accra, Ghana default
    lng: -0.1870,
  })
  const [mapZoom, setMapZoom] = useState(13)
  const { searchQuery, setSearchQuery, showList, setShowList } = useMap()
  const [checkingSubscription, setCheckingSubscription] = useState(true)

  // Double check subscription on client side
  useEffect(() => {
    async function checkAccess() {
      const hasAccess = await hasActiveSubscription()
      if (!hasAccess) {
        router.push('/subscribe')
      } else {
        setCheckingSubscription(false)
      }
    }
    checkAccess()
  }, [])

  const loadHostels = useCallback(async () => {
    setLoading(true)
    setError(null)

    // If in directions mode, we primarily care about the specific hostel and school
    if (modeParam === 'directions' && hostelIdParam) {
      const { data: hostel, error: hostelError } = await getHostelById(hostelIdParam)
      if (hostelError) {
        setError(hostelError)
        setLoading(false)
        return
      }
      if (hostel) {
        setHostels([hostel])
        setSelectedHostel(hostel)

        // Use provided schoolId or fall back to hostel's associated school
        const targetSchoolId = schoolIdParam || hostel.school_id
        if (targetSchoolId) {
          const { data: school } = await getSchoolById(targetSchoolId)
          if (school) {
            setDestinationSchool(school)
          }
        }

        if (hostel.latitude && hostel.longitude) {
          setMapCenter({ lat: Number(hostel.latitude), lng: Number(hostel.longitude) })
          setMapZoom(15)
        }
      }
      setLoading(false)
      return
    }

    const filters: any = {
      search: searchQuery || undefined,
    }

    if (schoolIdParam) {
      filters.schoolId = schoolIdParam
    }

    const { data, error: hostelsError } = await getHostels(filters)

    if (hostelsError) {
      setError(hostelsError)
      setLoading(false)
      return
    }

    // Fetch school details if schoolIdParam is present
    let schoolData: School | null = null
    if (schoolIdParam) {
      const { data: school } = await getSchoolById(schoolIdParam)
      if (school) {
        setDestinationSchool(school)
        schoolData = school
      }
    }

    if (data && data.length > 0) {
      setHostels(data)

      // If a specific hostel is requested, center on it
      if (hostelIdParam) {
        const requestedHostel = data.find(h => h.id === hostelIdParam)
        if (requestedHostel && requestedHostel.latitude && requestedHostel.longitude) {
          setSelectedHostel(requestedHostel)
          setMapCenter({ lat: Number(requestedHostel.latitude), lng: Number(requestedHostel.longitude) })
          setMapZoom(15)
        }
      } else {
        // Center map on average of hostels
        const hostelsWithCoords = data.filter(
          (h) => h.latitude && h.longitude
        )
        if (hostelsWithCoords.length > 0) {
          const avgLat =
            hostelsWithCoords.reduce((sum, h) => sum + Number(h.latitude || 0), 0) /
            hostelsWithCoords.length
          const avgLng =
            hostelsWithCoords.reduce((sum, h) => sum + Number(h.longitude || 0), 0) /
            hostelsWithCoords.length
          setMapCenter({ lat: avgLat, lng: avgLng })
          setMapZoom(hostelsWithCoords.length === 1 ? 15 : 13)
        } else if (schoolData?.latitude && schoolData?.longitude) {
          // Fallback to school if no hostels have coordinates
          setMapCenter({ lat: Number(schoolData.latitude), lng: Number(schoolData.longitude) })
          setMapZoom(14)
        }
      }
    } else {
      setHostels([])
      // If no hostels found, center on school if available
      if (schoolData?.latitude && schoolData?.longitude) {
        setMapCenter({ lat: Number(schoolData.latitude), lng: Number(schoolData.longitude) })
        setMapZoom(14)
      }
    }
    setLoading(false)
  }, [searchQuery, schoolIdParam, hostelIdParam, modeParam])

  useEffect(() => {
    if (!checkingSubscription) {
      loadHostels()
    }
  }, [loadHostels, checkingSubscription])

  useEffect(() => {
    // Only try to get user's location if not in a specific mode and no school/hostel is targeted
    if (modeParam === 'directions' || schoolIdParam || hostelIdParam) return

    getCurrentLocation().then((location) => {
      if (location) {
        // Use a functional update to avoid unnecessary re-renders
        setMapCenter(prev => {
          if (prev.lat === location.latitude && prev.lng === location.longitude) return prev
          return { lat: location.latitude, lng: location.longitude }
        })
        setMapZoom(14)
      }
    })
  }, [modeParam, schoolIdParam, hostelIdParam])

  const handleHostelClick = (hostel: Hostel) => {
    setSelectedHostel(selectedHostel?.id === hostel.id ? null : hostel)
  }

  const handleViewDetails = (hostelId: string) => {
    router.push(`/hostel/${hostelId}`)
  }

  const handleExitDirections = () => {
    // Going back will return to the state before directions were requested
    // (either the map with a selected hostel, or the previous page)
    router.back()
  }

  const handleGetDirections = (hostel: Hostel) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('hostel', hostel.id)
    params.set('mode', 'directions')

    // Use school from search params or hostel's linked school
    const targetSchoolId = schoolIdParam || hostel.school_id
    if (targetSchoolId) {
      params.set('school', targetSchoolId)
    }

    router.push(`/hostels/map?${params.toString()}`)
  }

  const handleZoomChange = useCallback((newZoom: number) => {
    setMapZoom(prev => Math.abs(prev - newZoom) > 0.1 ? newZoom : prev)
  }, [])

  const handleCenterChange = useCallback((newCenter: { lat: number; lng: number }) => {
    // Only update state if significantly different to avoid state-thrashing during pans
    setMapCenter(prev => {
      const latDiff = Math.abs(prev.lat - newCenter.lat)
      const lngDiff = Math.abs(prev.lng - newCenter.lng)
      if (latDiff > 0.001 || lngDiff > 0.001) return newCenter
      return prev
    })
  }, [])

  return (
    <div className={styles.container}>
      {(loading || checkingSubscription) && (
        <div className={styles.mapLoading} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Loader />
        </div>
      )}

      {/* Map Container */}
      <div className={styles.mapContainer}>
        {error ? (
          <div className={styles.mapError}>
            <p>{error}</p>
            {error.includes('Subscription') && (
              <button
                onClick={() => router.push('/subscribe')}
                style={{
                  marginTop: '16px',
                  padding: '10px 20px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Go to Subscription
              </button>
            )}
          </div>
        ) : process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
          <MapView
            hostels={hostels}
            center={mapCenter}
            zoom={mapZoom}
            onHostelClick={handleHostelClick}
            onZoomChange={handleZoomChange}
            onCenterChange={handleCenterChange}
            onExitDirections={handleExitDirections}
            selectedHostelId={selectedHostel?.id || null}
            directionsMode={modeParam === 'directions'}
            destinationSchool={destinationSchool}
          />
        ) : (
          <div className={styles.mapError}>
            <p>Google Maps API key not configured</p>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '8px' }}>
              Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables
            </p>
          </div>
        )}
      </div>

      {/* Hostel List Sidebar */}
      {showList && (
        <div className={styles.listSidebar}>
          <div className={styles.listHeader}>
            <h2 className={styles.listTitle}>
              {hostels.length} Hostels Found
            </h2>
            <button
              className={styles.closeListButton}
              onClick={() => setShowList(false)}
            >
              <IoCloseCircle size={24} color="#64748b" />
            </button>
          </div>
          <div className={styles.listContent}>
            {loading ? (
              <div className={styles.loadingState} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                <Loader />
              </div>
            ) : hostels.length === 0 ? (
              <div className={styles.emptyState}>No hostels found</div>
            ) : (
              hostels.map((hostel) => (
                <div
                  key={hostel.id}
                  className={`${styles.hostelListItem} ${selectedHostel?.id === hostel.id
                      ? styles.hostelListItemSelected
                      : ''
                    }`}
                  onClick={() => {
                    handleHostelClick(hostel)
                    if (hostel.latitude && hostel.longitude) {
                      setMapCenter({
                        lat: hostel.latitude,
                        lng: hostel.longitude,
                      })
                      setMapZoom(15)
                    }
                  }}
                >
                  <div className={styles.listItemContent}>
                    <h3 className={styles.listItemName}>{hostel.name}</h3>
                    {hostel.address && (
                      <div className={styles.listItemAddress}>
                        <IoLocation size={12} color="#64748b" />
                        <span>{hostel.address}</span>
                      </div>
                    )}
                    <div className={styles.listItemMeta}>
                      <span className={styles.listItemPrice}>
                        GHS {hostel.price_min}/sem
                      </span>
                      {hostel.distance && (
                        <span className={styles.listItemDistance}>
                          {hostel.distance}km away
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className={styles.viewButton}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewDetails(hostel.id)
                    }}
                  >
                    View
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected Hostel Info Card */}
      {selectedHostel && !showList && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          className={styles.infoCard}
        >
          <button
            className={styles.closeInfoButton}
            onClick={() => setSelectedHostel(null)}
          >
            <IoCloseCircle size={24} color="#64748b" />
          </button>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            {selectedHostel.images?.[0] && (
              <img
                src={selectedHostel.images[0]}
                alt={selectedHostel.name}
                style={{ width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h3 className={styles.infoCardName}>{selectedHostel.name}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div className={styles.infoCardPrice} style={{ marginBottom: 0 }}>GHS {selectedHostel.price_min}/sem</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#fbbf24',
                  backgroundColor: '#fffbeb',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}>
                  <IoStar size={12} />
                  {Number(selectedHostel.rating).toFixed(1)}
                </div>
              </div>
              {selectedHostel.distance && (
                <div className={styles.infoCardDistance}>
                  <IoLocation size={14} style={{ marginRight: '4px' }} />
                  {selectedHostel.distance}km to {destinationSchool?.name || 'School'}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button
              className={styles.infoCardButton}
              style={{ flex: 1, backgroundColor: '#000000', margin: 0 }}
              onClick={() => handleViewDetails(selectedHostel.id)}
            >
              View Details
            </button>
            <button
              onClick={() => handleGetDirections(selectedHostel)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                flexShrink: 0
              }}
              title="Get Directions"
            >
              <IoNavigate size={20} />
            </button>
          </div>
        </motion.div>
      )}

      {/* No Hostels Found Overlay */}
      {!loading && !error && hostels.length === 0 && (
        <div style={{
          position: 'absolute',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px 20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 100,
          textAlign: 'center',
          width: 'max-content',
          border: '1px solid #e2e8f0'
        }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#1e293b' }}>
            No hostels found for this school
          </p>
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              params.delete('school')
              router.push(`/hostels/map?${params.toString()}`)
            }}
            style={{
              marginTop: '8px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Show All Hostels
          </button>
        </div>
      )}
    </div>
  )
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.mapContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Loader />
          </div>
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  )
}
