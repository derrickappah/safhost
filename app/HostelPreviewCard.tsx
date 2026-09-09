'use client'

import { memo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  IoStar,
  IoLocationOutline,
  IoShieldCheckmark,
  IoWifiOutline,
  IoWaterOutline,
  IoFlashOutline,
} from 'react-icons/io5'
import styles from './page.module.css'

interface HostelPreviewCardProps {
  id: string
  name: string
  price: number
  rating: number
  distance: string | null
  image: string
  schoolName?: string | null
  amenities?: string[]
}

function HostelPreviewCard({
  id,
  name,
  price,
  rating,
  distance,
  image,
  schoolName,
  amenities = [],
}: HostelPreviewCardProps) {
  const [imageError, setImageError] = useState(false)
  const fallbackImage =
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80'

  return (
    <Link href={`/hostel/${id}`} className={styles.hostelCard}>
      <div className={styles.cardImageContainer}>
        <Image
          src={imageError ? fallbackImage : image}
          alt={name}
          fill
          className={styles.cardImage}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setImageError(true)}
        />
        <div className={styles.ratingBadge}>
          <IoStar className={styles.starIcon} size={14} />
          <span>{rating > 0 ? rating.toFixed(1) : 'New'}</span>
        </div>
        <div className={styles.verifiedBadge}>
          <IoShieldCheckmark size={12} />
          <span>Verified</span>
        </div>
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardHeaderRow}>
          <h3 className={styles.hostelName}>{name}</h3>
          <div className={styles.priceContainer}>
            <span className={styles.priceCurrency}>GHS</span>
            <span className={styles.priceAmount}>{price.toLocaleString()}</span>
            <span className={styles.pricePeriod}>/ sem</span>
          </div>
        </div>

        <div className={styles.cardMetaRow}>
          <div className={styles.distanceInfo}>
            <IoLocationOutline size={15} className={styles.metaIcon} />
            <span>
              {distance ? `${distance} from ` : 'Near '}
              <strong>{schoolName || 'Campus'}</strong>
            </span>
          </div>
        </div>

        {amenities && amenities.length > 0 && (
          <div className={styles.cardAmenitiesRow}>
            {amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className={styles.amenityTag}>
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className={styles.amenityMoreTag}>+{amenities.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}

export default memo(HostelPreviewCard)
