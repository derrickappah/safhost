'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { IoStar, IoLocation, IoArrowForward } from 'react-icons/io5'
import styles from './page.module.css'

interface RecentlyViewedHostel {
  id: string
  name: string
  price_min: number
  rating: number
  distance: number | null
  images: string[]
}

interface RecentlyViewedSectionProps {
  recentlyViewed: RecentlyViewedHostel[]
}

export default function RecentlyViewedSection({ recentlyViewed }: RecentlyViewedSectionProps) {
  const router = useRouter()

  if (recentlyViewed.length === 0) {
    return null
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
          const mainImage = hostel.images && hostel.images.length > 0 
            ? hostel.images[0] 
            : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'
          
          return (
            <button
              key={hostel.id}
              className={styles.recentCard}
              onClick={() => router.push(`/hostel/${hostel.id}`)}
            >
              <div className={styles.recentImageContainer}>
                {mainImage && (
                  <Image
                    src={mainImage}
                    alt={hostel.name || 'Hostel'}
                    fill
                    sizes="90px"
                    className={styles.recentImage}
                    quality={90}
                  />
                )}
              </div>
              <div className={styles.recentContent}>
                <h3 className={styles.recentName}>{hostel.name}</h3>
                <div className={styles.recentPrice}>GHS {hostel.price_min || 0}/sem</div>
                <div className={styles.recentMeta}>
                  <div className={styles.rating}>
                    <IoStar size={14} color="#fbbf24" />
                    <span>{Number(hostel.rating || 0).toFixed(1)}</span>
                  </div>
                  {hostel.distance && (
                    <div className={styles.distance}>
                      <IoLocation size={14} color="#64748b" />
                      <span>{hostel.distance}km</span>
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
