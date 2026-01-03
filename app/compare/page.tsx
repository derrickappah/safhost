'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { IoArrowBack, IoClose, IoAdd, IoLocation, IoStar, IoWifi, IoWater, IoShieldCheckmark } from 'react-icons/io5'
import styles from './page.module.css'
import { getHostelById, type Hostel } from '@/lib/actions/hostels'
import Image from 'next/image'

const MAX_COMPARE = 4

function ComparePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialIds = searchParams.get('ids')?.split(',').filter(Boolean) || []

  const [hostels, setHostels] = useState<(Hostel | null)[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadHostels() {
      if (initialIds.length === 0) {
        setLoading(false)
        return
      }

      const loadedHostels = await Promise.all(
        initialIds.slice(0, MAX_COMPARE).map(async (id) => {
          const { data } = await getHostelById(id)
          return data
        })
      )

      setHostels(loadedHostels)
      setLoading(false)
    }

    loadHostels()
  }, [initialIds])

  const removeHostel = (index: number) => {
    const newHostels = [...hostels]
    newHostels[index] = null
    setHostels(newHostels)
    
    // Update URL
    const activeIds = newHostels.filter(h => h !== null).map(h => h!.id)
    if (activeIds.length > 0) {
      router.replace(`/compare?ids=${activeIds.join(',')}`)
    } else {
      router.replace('/compare')
    }
  }

  const addHostel = () => {
    router.push(`/hostels?compare=true`)
  }

  const activeHostels = hostels.filter(h => h !== null) as Hostel[]

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading hostels...</div>
      </div>
    )
  }

  if (activeHostels.length === 0) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            <IoArrowBack size={24} color="#1e293b" />
          </button>
          <h1 className={styles.headerTitle}>Compare Hostels</h1>
          <div style={{ width: '40px' }} />
        </header>
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>No hostels selected for comparison</p>
          <button className={styles.addButton} onClick={addHostel}>
            <IoAdd size={20} color="#fff" />
            <span>Add Hostels to Compare</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <h1 className={styles.headerTitle}>Compare Hostels</h1>
        {activeHostels.length < MAX_COMPARE && (
          <button className={styles.addButton} onClick={addHostel}>
            <IoAdd size={20} color="#2563eb" />
            <span>Add</span>
          </button>
        )}
      </header>

      <div className={styles.comparisonContainer}>
        <div className={styles.comparisonTable}>
          {/* Header Row */}
          <div className={styles.tableRow}>
            <div className={styles.tableHeader}>Property</div>
            {activeHostels.map((hostel, index) => (
              <div key={hostel.id} className={styles.hostelColumn}>
                <button
                  className={styles.removeButton}
                  onClick={() => removeHostel(index)}
                >
                  <IoClose size={18} color="#64748b" />
                </button>
                <div className={styles.hostelImageContainer}>
                  {hostel.images && hostel.images.length > 0 ? (
                    <Image
                      src={hostel.images[0]}
                      alt={hostel.name}
                      width={200}
                      height={120}
                      className={styles.hostelImage}
                    />
                  ) : (
                    <div className={styles.hostelImagePlaceholder}>No Image</div>
                  )}
                </div>
                <h3 className={styles.hostelName}>{hostel.name}</h3>
              </div>
            ))}
            {activeHostels.length < MAX_COMPARE && (
              <div className={styles.addColumn}>
                <button className={styles.addColumnButton} onClick={addHostel}>
                  <IoAdd size={32} color="#2563eb" />
                  <span>Add Hostel</span>
                </button>
              </div>
            )}
          </div>

          {/* Price */}
          <div className={styles.tableRow}>
            <div className={styles.tableLabel}>Price</div>
            {activeHostels.map((hostel) => (
              <div key={hostel.id} className={styles.tableCell}>
                <span className={styles.priceValue}>GHS {hostel.price_min}</span>
                {hostel.price_max && hostel.price_max !== hostel.price_min && (
                  <span className={styles.priceRange}> - GHS {hostel.price_max}</span>
                )}
                <span className={styles.pricePeriod}>/month</span>
              </div>
            ))}
          </div>

          {/* Rating */}
          <div className={styles.tableRow}>
            <div className={styles.tableLabel}>Rating</div>
            {activeHostels.map((hostel) => (
              <div key={hostel.id} className={styles.tableCell}>
                <div className={styles.ratingContainer}>
                  <IoStar size={16} color="#fbbf24" />
                  <span className={styles.ratingValue}>{Number(hostel.rating).toFixed(1)}</span>
                  <span className={styles.reviewCount}>({hostel.review_count})</span>
                </div>
              </div>
            ))}
          </div>

          {/* Distance */}
          <div className={styles.tableRow}>
            <div className={styles.tableLabel}>Distance</div>
            {activeHostels.map((hostel) => (
              <div key={hostel.id} className={styles.tableCell}>
                {hostel.distance ? (
                  <div className={styles.distanceContainer}>
                    <IoLocation size={14} color="#64748b" />
                    <span>{hostel.distance}km</span>
                  </div>
                ) : (
                  <span className={styles.na}>N/A</span>
                )}
              </div>
            ))}
          </div>

          {/* Address */}
          <div className={styles.tableRow}>
            <div className={styles.tableLabel}>Address</div>
            {activeHostels.map((hostel) => (
              <div key={hostel.id} className={styles.tableCell}>
                <span className={styles.addressText}>{hostel.address}</span>
              </div>
            ))}
          </div>

          {/* Amenities */}
          <div className={styles.tableRow}>
            <div className={styles.tableLabel}>Amenities</div>
            {activeHostels.map((hostel) => (
              <div key={hostel.id} className={styles.tableCell}>
                <div className={styles.amenitiesList}>
                  {hostel.amenities && hostel.amenities.length > 0 ? (
                    hostel.amenities.slice(0, 5).map((amenity, idx) => (
                      <span key={idx} className={styles.amenityTag}>
                        {amenity}
                      </span>
                    ))
                  ) : (
                    <span className={styles.na}>None listed</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Room Types */}
          <div className={styles.tableRow}>
            <div className={styles.tableLabel}>Room Types</div>
            {activeHostels.map((hostel) => (
              <div key={hostel.id} className={styles.tableCell}>
                {hostel.room_types && hostel.room_types.length > 0 ? (
                  <div className={styles.roomTypesList}>
                    {hostel.room_types.map((room, idx) => (
                      <div key={idx} className={styles.roomTypeItem}>
                        <span className={styles.roomType}>{room.type}</span>
                        <span className={styles.roomPrice}>GHS {room.price}/mo</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className={styles.na}>N/A</span>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className={styles.tableRow}>
            <div className={styles.tableLabel}>Actions</div>
            {activeHostels.map((hostel) => (
              <div key={hostel.id} className={styles.tableCell}>
                <button
                  className={styles.viewButton}
                  onClick={() => router.push(`/hostel/${hostel.id}`)}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    }>
      <ComparePageContent />
    </Suspense>
  )
}
