'use client'

import React from 'react'
import Image from 'next/image'
import {
  IoStar,
  IoHeart,
  IoHeartOutline,
  IoLocation,
  IoShieldCheckmark,
  IoWifi,
  IoSnowOutline,
  IoFlashOutline,
  IoWaterOutline,
  IoShieldOutline,
  IoFitnessOutline,
  IoBookOutline
} from 'react-icons/io5'
import styles from './page.module.css'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'
import { formatCediPrice, formatRatingBadge, formatDistance } from '@/lib/formatters'

export interface HostelCardData {
  id: string
  name: string
  price_min?: number
  price?: number
  rating?: number
  review_count?: number
  distance?: number | null
  address?: string
  images?: string[]
  image?: string
  amenities?: string[]
  featured?: boolean
  is_available?: boolean
  school?: { id: string; name: string }
}

export interface DashboardHostelCardProps {
  hostel: HostelCardData
  isFavorite?: boolean
  onToggleFavorite?: (id: string, e: React.MouseEvent) => Promise<void> | void
  badgeText?: string
  priority?: boolean
  variant?: 'carousel' | 'grid'
}

export default function DashboardHostelCard({
  hostel,
  isFavorite = false,
  onToggleFavorite,
  badgeText,
  priority = false,
  variant = 'carousel'
}: DashboardHostelCardProps) {
  const { navigate, handleMouseEnter, handleTouchStart } = useInstantNavigation()

  const hostelUrl = `/hostel/${hostel.id}`

  const defaultPlaceholder = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'
  const rawImage = (hostel.images && hostel.images.length > 0 ? hostel.images[0] : null) || hostel.image || ''
  const imageUrl = rawImage && rawImage.trim() !== '' ? rawImage : defaultPlaceholder

  const priceValue = hostel.price_min ?? hostel.price ?? 0
  const formattedPrice = formatCediPrice(priceValue)

  const { ratingText, reviewCountText } = formatRatingBadge(hostel.rating, hostel.review_count)
  const distanceFormatted = formatDistance(hostel.distance)

  // Amenity icon mapper
  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase()
    if (lower.includes('wifi') || lower.includes('internet')) return <IoWifi size={11} />
    if (lower.includes('ac') || lower.includes('air') || lower.includes('cool')) return <IoSnowOutline size={11} />
    if (lower.includes('generator') || lower.includes('power') || lower.includes('light')) return <IoFlashOutline size={11} />
    if (lower.includes('water')) return <IoWaterOutline size={11} />
    if (lower.includes('security') || lower.includes('cctv')) return <IoShieldOutline size={11} />
    if (lower.includes('gym') || lower.includes('fit')) return <IoFitnessOutline size={11} />
    if (lower.includes('study') || lower.includes('desk') || lower.includes('library')) return <IoBookOutline size={11} />
    return null
  }

  const allAmenities = hostel.amenities || []
  const visibleAmenities = allAmenities.slice(0, 3)
  const remainingAmenities = allAmenities.length - visibleAmenities.length

  const handleCardClick = () => {
    // Ungated navigation: non-subscribers navigate directly without being kicked to /subscribe
    navigate(hostelUrl)
  }

  const isGrid = variant === 'grid'

  return (
    <div
      className={isGrid ? styles.hostelCard : styles.favoriteCard}
      onClick={handleCardClick}
      onMouseEnter={() => handleMouseEnter(hostelUrl)}
      onTouchStart={() => handleTouchStart(hostelUrl)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          navigate(hostelUrl)
        }
      }}
    >
      <div className={isGrid ? styles.hostelImageContainer : styles.favoriteImageContainer}>
        <Image
          src={imageUrl}
          alt={hostel.name || 'Hostel'}
          fill
          sizes={isGrid ? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw' : '(max-width: 640px) 50vw, 220px'}
          className={isGrid ? styles.hostelImage : styles.favoriteImage}
          priority={priority}
          quality={90}
        />

        {/* Verified Shield Badge */}
        <div className={styles.cardVerifiedBadge}>
          <IoShieldCheckmark size={11} />
          <span>Verified</span>
        </div>

        {/* Optional Custom Badge */}
        {badgeText && (
          <div className={styles.cardCustomBadge}>
            <span>{badgeText}</span>
          </div>
        )}

        {/* Favorite Toggle Button */}
        {onToggleFavorite && (
          <button
            type="button"
            className={styles.heartButton}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(hostel.id, e)
            }}
          >
            {isFavorite ? (
              <IoHeart size={18} color="#ef4444" />
            ) : (
              <IoHeartOutline size={18} color="#ffffff" />
            )}
          </button>
        )}
      </div>

      <div className={isGrid ? styles.hostelInfo : styles.favoriteContent}>
        <h3 className={isGrid ? styles.hostelName : styles.favoriteName} title={hostel.name}>
          {hostel.name}
        </h3>

        {/* Campus affiliation if available */}
        {hostel.school?.name && (
          <div className={styles.cardSchoolContext}>
            <span>{hostel.school.name}</span>
          </div>
        )}

        {/* Rating and Distance Badges */}
        <div className={styles.favoriteRow}>
          <div className={styles.ratingSmall}>
            <IoStar size={12} color="#f59e0b" />
            <span className={styles.ratingSmallText}>{ratingText}</span>
            <span className={styles.reviewCountText}>{reviewCountText}</span>
          </div>

          {distanceFormatted && (
            <span className={styles.distanceSmall}>
              <IoLocation size={12} color="#64748b" />
              {distanceFormatted}
            </span>
          )}
        </div>

        {/* Top Amenity Pills with +X more badge */}
        {visibleAmenities.length > 0 && (
          <div className={styles.cardAmenitiesList}>
            {visibleAmenities.map((amenity, idx) => (
              <span key={idx} className={styles.cardAmenityPill}>
                {getAmenityIcon(amenity)}
                <span>{amenity}</span>
              </span>
            ))}
            {remainingAmenities > 0 && (
              <span className={styles.cardAmenityMore}>
                +{remainingAmenities}
              </span>
            )}
          </div>
        )}

        {/* Formatted Price */}
        <div className={isGrid ? styles.hostelPrice : styles.favoritePrice}>
          {formattedPrice}
        </div>
      </div>
    </div>
  )
}
