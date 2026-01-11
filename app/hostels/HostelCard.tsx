'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { IoStar, IoHeart, IoHeartOutline, IoWalk, IoCar, IoCheckmarkCircle, IoCheckmarkCircleOutline } from 'react-icons/io5'
import styles from './page.module.css'
import { type Hostel } from '@/lib/actions/hostels'
import { calculateWalkingTime, calculateDrivingTime, formatTime } from '@/lib/location/detect'

const amenityIcons: Record<string, any> = {
  "Wi-Fi": IoStar,
  "Water": IoStar,
  "Security": IoStar,
  "Electricity": IoStar,
  "AC": IoStar,
  "Air Conditioning": IoStar,
  "Kitchen": IoStar,
  "Gym": IoStar,
  "Fitness": IoStar,
  "Laundry": IoStar,
  "Parking": IoStar,
  "Study Room": IoStar,
  "Study": IoStar,
  "Common Area": IoStar,
  "Common Space": IoStar,
}

interface HostelCardProps {
  hostel: Hostel
  isFavorited: boolean
  onToggleFavorite: (id: string, e: React.MouseEvent) => void
  compareMode?: boolean
  isSelected?: boolean
  onToggleSelection?: (id: string, e: React.MouseEvent) => void
}

export default function HostelCard({ 
  hostel, 
  isFavorited, 
  onToggleFavorite,
  compareMode = false,
  isSelected = false,
  onToggleSelection
}: HostelCardProps) {
  const router = useRouter()
  const AmenityIcon = amenityIcons[hostel.amenities?.[0] || ''] || IoStar
  const mainImage = hostel.images && hostel.images.length > 0 
    ? hostel.images[0] 
    : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'

  const handleCardClick = (e: React.MouseEvent) => {
    if (compareMode && onToggleSelection) {
      onToggleSelection(hostel.id, e)
    } else {
      router.push(`/hostel/${hostel.id}`)
    }
  }

  return (
    <div
      className={styles.hostelCard}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Image */}
      <div className={styles.imageContainer}>
        <Image
          src={mainImage}
          alt={hostel.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={styles.hostelImage}
          quality={90}
        />
        {compareMode && onToggleSelection && (
          <button
            className={styles.compareCheckbox}
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelection(hostel.id, e)
            }}
          >
            {isSelected ? (
              <IoCheckmarkCircle size={24} color="#2563eb" />
            ) : (
              <IoCheckmarkCircleOutline size={24} color="#fff" />
            )}
          </button>
        )}
        {!compareMode && (
          <button
            className={styles.saveButton}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(hostel.id, e)
            }}
          >
            {isFavorited ? (
              <IoHeart size={20} color="#ef4444" />
            ) : (
              <IoHeartOutline size={20} color="#fff" />
            )}
          </button>
        )}
      </div>

      {/* Content */}
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <h3 className={styles.hostelName}>{hostel.name}</h3>
          <div className={styles.ratingBadge}>
            <IoStar size={12} color="#fbbf24" />
            <span className={styles.ratingText}>{Number(hostel.rating).toFixed(1)}</span>
            <span className={styles.reviewCount}>({hostel.review_count})</span>
          </div>
        </div>

        <div className={styles.cardMeta}>
          <span className={styles.priceText}>
            From <strong className={styles.priceAmount}>GHS {hostel.price_min}</strong>/sem
          </span>
        </div>
        
        {hostel.distance && (
          <div className={styles.distanceInfo}>
            <div className={styles.distanceBadge}>
              <IoWalk size={12} color="#6b7280" />
              <span className={styles.distanceText}>
                {formatTime(calculateWalkingTime(hostel.distance))} walk
              </span>
            </div>
            <div className={styles.distanceBadge} style={{ marginLeft: '8px' }}>
              <IoCar size={12} color="#6b7280" />
              <span className={styles.distanceText}>
                {formatTime(calculateDrivingTime(hostel.distance))} drive
              </span>
            </div>
          </div>
        )}

        <div className={styles.amenitiesRow}>
          {hostel.amenities?.slice(0, 4).map((amenity, idx) => {
            const Icon = amenityIcons[amenity] || IoStar
            return (
              <div key={idx} className={styles.amenityTag}>
                <Icon size={12} color="#64748b" />
                <span className={styles.amenityText}>{amenity}</span>
              </div>
            )
          })}
          {hostel.amenities && hostel.amenities.length > 4 && (
            <div className={styles.moreTag}>
              <span className={styles.moreText}>+{hostel.amenities.length - 4}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
