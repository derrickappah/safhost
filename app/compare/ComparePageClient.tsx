'use client'

import { useState } from 'react'
import { IoClose, IoAdd, IoStar, IoLocation } from 'react-icons/io5'
import { type Hostel } from '@/lib/actions/hostels'
import Image from 'next/image'
import styles from './page.module.css'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'

const MAX_COMPARE = 4

interface ComparePageClientProps {
  initialHostels: (Hostel | null)[]
  initialIds: string[]
}

export default function ComparePageClient({ initialHostels, initialIds }: ComparePageClientProps) {
  const { navigate, router } = useInstantNavigation()
  const [hostels, setHostels] = useState<(Hostel | null)[]>(initialHostels)
  
  // Expose router.replace for URL updates
  const routerReplace = router.replace.bind(router)

  const removeHostel = (index: number) => {
    const newHostels = [...hostels]
    newHostels[index] = null
    setHostels(newHostels)
    
    // Update URL
    const activeIds = newHostels.filter(h => h !== null).map(h => h!.id)
    if (activeIds.length > 0) {
      routerReplace(`/compare?ids=${activeIds.join(',')}`)
    } else {
      routerReplace('/compare')
    }
  }

  const addHostel = () => {
    navigate(`/hostels?compare=true`)
  }

  const activeHostels = hostels.filter(h => h !== null) as Hostel[]

  if (activeHostels.length === 0) {
    return (
      <div className={styles.container}>
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
      {/* Mobile Card View */}
      <div className={styles.mobileView}>
        {activeHostels.map((hostel, index) => (
          <div key={hostel.id} className={styles.hostelCard}>
            <div className={styles.cardHeader}>
              <div className={styles.hostelImageContainer}>
                {hostel.images && hostel.images.length > 0 ? (
                  <Image
                    src={hostel.images[0]}
                    alt={hostel.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className={styles.hostelImage}
                    quality={90}
                  />
                ) : (
                  <div className={styles.hostelImagePlaceholder}>No Image</div>
                )}
              </div>
              <button
                className={styles.removeButton}
                onClick={() => removeHostel(index)}
                aria-label="Remove hostel"
              >
                <IoClose size={20} color="#64748b" />
              </button>
            </div>
            <h3 className={styles.hostelName}>{hostel.name}</h3>
            
            <div className={styles.cardDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Price</span>
                <span className={styles.detailValue}>
                  <span className={styles.priceValue}>GHS {hostel.price_min}</span>
                  {hostel.price_max && hostel.price_max !== hostel.price_min && (
                    <span className={styles.priceRange}> - GHS {hostel.price_max}</span>
                  )}
                  <span className={styles.pricePeriod}>/sem</span>
                </span>
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Rating</span>
                <div className={styles.ratingContainer}>
                  <IoStar size={16} color="#fbbf24" fill="#fbbf24" />
                  <span className={styles.ratingValue}>{Number(hostel.rating).toFixed(1)}</span>
                  {hostel.review_count > 0 && (
                    <span className={styles.reviewCount}>({hostel.review_count})</span>
                  )}
                </div>
              </div>

              {hostel.distance && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Distance</span>
                  <div className={styles.distanceContainer}>
                    <IoLocation size={14} color="#64748b" />
                    <span>{hostel.distance}km</span>
                  </div>
                </div>
              )}

              {hostel.address && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Address</span>
                  <span className={styles.addressText}>{hostel.address}</span>
                </div>
              )}

              {hostel.amenities && hostel.amenities.length > 0 && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Amenities</span>
                  <div className={styles.amenitiesList}>
                    {hostel.amenities.slice(0, 5).map((amenity, idx) => (
                      <span key={idx} className={styles.amenityTag}>
                        {amenity}
                      </span>
                    ))}
                    {hostel.amenities.length > 5 && (
                      <span className={styles.moreAmenities}>+{hostel.amenities.length - 5}</span>
                    )}
                  </div>
                </div>
              )}

              {hostel.room_types && hostel.room_types.length > 0 && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Room Types</span>
                  <div className={styles.roomTypesList}>
                    {hostel.room_types.map((room: any, idx: number) => (
                      <div key={idx} className={styles.roomTypeItem}>
                        <span className={styles.roomType}>{room.type}</span>
                        <span className={styles.roomPrice}>GHS {room.price}/sem</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className={styles.viewButton}
              onClick={() => router.push(`/hostel/${hostel.id}`)}
            >
              View Details
            </button>
          </div>
        ))}
        
        {activeHostels.length < MAX_COMPARE && (
          <button className={styles.addCardButton} onClick={addHostel}>
            <IoAdd size={32} color="#2563eb" />
            <span>Add Hostel to Compare</span>
          </button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className={styles.desktopView}>
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
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className={styles.hostelImage}
                      quality={90}
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
                    {hostel.room_types.map((room: any, idx: number) => (
                      <div key={idx} className={styles.roomTypeItem}>
                        <span className={styles.roomType}>{room.type}</span>
                        <span className={styles.roomPrice}>GHS {room.price}/sem</span>
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
    </div>
  )
}
