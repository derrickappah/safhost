'use client'

import { memo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import styles from './page.module.css'

interface HostelPreviewCardProps {
    id: string
    name: string
    price: number
    rating: number
    distance: string | null
    image: string
}

function HostelPreviewCard({
    id,
    name,
    price,
    rating,
    distance,
    image
}: HostelPreviewCardProps) {
    const [imageError, setImageError] = useState(false)
    const fallbackImage = 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'

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
                    <span className="material-icons-round">star</span> {rating.toFixed(1)}
                </div>
                <div className={styles.verifiedBadge}>Verified</div>
            </div>
            <div className={styles.cardContent}>
                <div className={styles.cardInfo}>
                    <h3 className={styles.hostelName}>{name}</h3>
                    <p className={styles.distanceInfo}>
                        <span className="material-icons-round">location_on</span> {distance || 'Near'} Campus
                    </p>
                </div>
                <div className={styles.priceInfo}>
                    <p className={styles.priceAmount}>GHS {price.toLocaleString()}</p>
                    <p className={styles.pricePeriod}>Per Semester</p>
                </div>
            </div>
        </Link>
    )
}

// Memoize to prevent unnecessary re-renders
export default memo(HostelPreviewCard)
