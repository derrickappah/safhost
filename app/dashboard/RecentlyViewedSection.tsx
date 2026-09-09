'use client'

import Image from 'next/image'
import Link from 'next/link'
import { IoStar, IoLocation, IoArrowForward, IoTimeOutline, IoCompassOutline } from 'react-icons/io5'
import styles from './page.module.css'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'
import { formatCediPrice, formatRatingBadge, formatDistance } from '@/lib/formatters'

export interface RecentlyViewedHostel {
  id: string
  name: string
  price_min?: number
  price?: number
  rating?: number
  review_count?: number
  distance?: number | null
  images?: string[]
  image?: string
}

interface RecentlyViewedSectionProps {
  recentlyViewed: RecentlyViewedHostel[]
  hasSubscription?: boolean
}

export default function RecentlyViewedSection({ recentlyViewed }: RecentlyViewedSectionProps) {
  const { navigate, handleMouseEnter, handleTouchStart } = useInstantNavigation()

  if (recentlyViewed.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recently Viewed</h2>
        </div>
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyStateIcon}>
            <IoTimeOutline size={28} />
          </div>
          <p className={styles.emptyStateTitle}>No recently viewed hostels</p>
          <p className={styles.emptyStateSubtitle}>
            Hostels you check out will appear here for fast, one-tap access.
          </p>
          <button
            type="button"
            className={styles.emptyStateCta}
            onClick={() => navigate('/hostels')}
          >
            <IoCompassOutline size={16} />
            <span>Browse Hostels</span>
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recently Viewed</h2>
        <Link href="/viewed" className={styles.seeAll}>
          See All <IoArrowForward size={14} />
        </Link>
      </div>
      <div className={styles.hostelList}>
        {recentlyViewed.map((hostel) => {
          const rawImage = (hostel.images && hostel.images.length > 0 ? hostel.images[0] : null) || hostel.image || ''
          const mainImage = rawImage && rawImage.trim() !== ''
            ? rawImage
            : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'

          const hostelUrl = `/hostel/${hostel.id}`
          const priceValue = hostel.price_min ?? hostel.price ?? 0
          const formattedPrice = formatCediPrice(priceValue)
          const { ratingText, reviewCountText } = formatRatingBadge(hostel.rating, hostel.review_count)
          const distanceFormatted = formatDistance(hostel.distance)

          return (
            <button
              key={hostel.id}
              className={styles.recentCard}
              onMouseEnter={() => handleMouseEnter(hostelUrl)}
              onTouchStart={() => handleTouchStart(hostelUrl)}
              onClick={() => navigate(hostelUrl)}
            >
              <div className={styles.recentImageContainer}>
                <Image
                  src={mainImage}
                  alt={hostel.name || 'Hostel'}
                  fill
                  sizes="90px"
                  className={styles.recentImage}
                  quality={90}
                />
              </div>
              <div className={styles.recentContent}>
                <h3 className={styles.recentName}>{hostel.name}</h3>
                <div className={styles.recentPrice}>{formattedPrice}</div>
                <div className={styles.recentMeta}>
                  <div className={styles.rating}>
                    <IoStar size={14} color="#f59e0b" />
                    <span>{ratingText}</span>
                    {hostel.review_count !== undefined && (
                      <span className={styles.reviewCountText}>{reviewCountText}</span>
                    )}
                  </div>
                  {distanceFormatted && (
                    <div className={styles.distance}>
                      <IoLocation size={14} color="#64748b" />
                      <span>{distanceFormatted}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.recentArrow}>
                <IoArrowForward size={22} color="#64748b" />
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
