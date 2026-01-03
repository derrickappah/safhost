'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoArrowBack, IoList, IoSearch, IoCloseCircle, IoLocation } from 'react-icons/io5'
import dynamic from 'next/dynamic'
import styles from './page.module.css'
import { getHostels, type Hostel } from '@/lib/actions/hostels'
import { getCurrentLocation } from '@/lib/location/detect'

// Dynamically import MapView to avoid SSR issues
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoading}>
      <p>Loading map...</p>
    </div>
  ),
})

function MapPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const schoolId = searchParams.get('school')

  const [hostels, setHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 5.6037, // Accra, Ghana default
    lng: -0.1870,
  })
  const [mapZoom, setMapZoom] = useState(13)
  const [searchQuery, setSearchQuery] = useState('')
  const [showList, setShowList] = useState(false)

  const loadHostels = useCallback(async () => {
    setLoading(true)
    const filters: any = {
      search: searchQuery || undefined,
    }

    if (schoolId) {
      filters.schoolId = schoolId
    }

    const { data, error } = await getHostels(filters)
    if (data) {
      setHostels(data)

      // If hostels have coordinates, center map on first hostel or average
      const hostelsWithCoords = data.filter(
        (h) => h.latitude && h.longitude
      )
      if (hostelsWithCoords.length > 0) {
        const avgLat =
          hostelsWithCoords.reduce((sum, h) => sum + (h.latitude || 0), 0) /
          hostelsWithCoords.length
        const avgLng =
          hostelsWithCoords.reduce((sum, h) => sum + (h.longitude || 0), 0) /
          hostelsWithCoords.length
        setMapCenter({ lat: avgLat, lng: avgLng })
        setMapZoom(hostelsWithCoords.length === 1 ? 15 : 13)
      }
    }
    setLoading(false)
  }, [searchQuery, schoolId])

  useEffect(() => {
    loadHostels()
  }, [loadHostels])

  useEffect(() => {
    // Try to get user's location
    getCurrentLocation().then((location) => {
      if (location) {
        setMapCenter({ lat: location.latitude, lng: location.longitude })
        setMapZoom(14)
      }
    })
  }, [])

  const handleHostelClick = (hostel: Hostel) => {
    setSelectedHostel(selectedHostel?.id === hostel.id ? null : hostel)
  }

  const handleViewDetails = (hostelId: string) => {
    router.push(`/hostel/${hostelId}`)
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <div className={styles.searchContainer}>
          <div className={styles.searchBar}>
            <IoSearch size={20} color="#94a3b8" />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search hostels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery.length > 0 && (
              <button onClick={() => setSearchQuery('')}>
                <IoCloseCircle size={20} color="#94a3b8" />
              </button>
            )}
          </div>
        </div>
        <button
          className={styles.listButton}
          onClick={() => setShowList(!showList)}
        >
          <IoList size={24} color="#1e293b" />
        </button>
      </header>

      {/* Map Container */}
      <div className={styles.mapContainer}>
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
          <MapView
            hostels={hostels}
            center={mapCenter}
            zoom={mapZoom}
            onHostelClick={handleHostelClick}
            selectedHostelId={selectedHostel?.id || null}
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
              <div className={styles.loadingState}>Loading hostels...</div>
            ) : hostels.length === 0 ? (
              <div className={styles.emptyState}>No hostels found</div>
            ) : (
              hostels.map((hostel) => (
                <button
                  key={hostel.id}
                  className={`${styles.hostelListItem} ${
                    selectedHostel?.id === hostel.id
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
                        GHS {hostel.price_min}/mo
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
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected Hostel Info Card */}
      {selectedHostel && !showList && (
        <div className={styles.infoCard}>
          <button
            className={styles.closeInfoButton}
            onClick={() => setSelectedHostel(null)}
          >
            <IoCloseCircle size={20} color="#64748b" />
          </button>
          <h3 className={styles.infoCardName}>{selectedHostel.name}</h3>
          {selectedHostel.address && (
            <p className={styles.infoCardAddress}>{selectedHostel.address}</p>
          )}
          <div className={styles.infoCardMeta}>
            <span className={styles.infoCardPrice}>
              GHS {selectedHostel.price_min}/mo
            </span>
            {selectedHostel.distance && (
              <span className={styles.infoCardDistance}>
                {selectedHostel.distance}km away
              </span>
            )}
          </div>
          <button
            className={styles.infoCardButton}
            onClick={() => handleViewDetails(selectedHostel.id)}
          >
            View Details
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
          <div className={styles.mapLoading}>Loading...</div>
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  )
}
