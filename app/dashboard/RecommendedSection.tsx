'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { IoStar, IoLocation, IoArrowForward } from 'react-icons/io5'
import styles from './page.module.css'

interface RecommendedHostel {
  id: string
  name: string
  price_min: number
  rating: number
  distance: number | null
  images: string[]
  recommendationReasons?: string[]
}

interface RecommendedSectionProps {
  recommendedHostels: RecommendedHostel[]
  loading?: boolean
}

export default function RecommendedSection({ recommendedHostels, loading }: RecommendedSectionProps) {
  const router = useRouter()

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recommended for You</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Based on your viewing history
          </p>
        </div>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading recommendations...</p>
        </div>
      </section>
    )
  }

  if (recommendedHostels.length === 0) {
    return null
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader} style={{ alignItems: 'flex-start' }}>
        <div>
          <h2 className={styles.sectionTitle}>Recommended for You</h2>
          <span className={styles.sectionSubtitle}>
            Based on your viewing history
          </span>
        </div>
        <Link href="/hostels" className={styles.seeAll} style={{ marginTop: '2px' }}>
          See All <IoArrowForward size={14} />
        </Link>
      </div>
      <div className={styles.hostelGrid}>
        {recommendedHostels.map((hostel) => {
          const mainImage = hostel.images && hostel.images.length > 0 
            ? hostel.images[0] 
            : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'
          
          return (
            <button
              key={hostel.id}
              className={styles.hostelCard}
              onClick={() => router.push(`/hostel/${hostel.id}`)}
            >
              <div className={styles.hostelImageContainer}>
                <Image
                  src={mainImage}
                  alt={hostel.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className={styles.hostelImage}
                  quality={90}
                />
              </div>
              <div className={styles.hostelInfo}>
                <h3 className={styles.hostelName}>{hostel.name}</h3>
                {hostel.recommendationReasons && hostel.recommendationReasons.length > 0 && (
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', textAlign: 'left' }}>
                    {hostel.recommendationReasons[0]}
                  </p>
                )}
                <div className={styles.hostelMeta}>
                  <div className={styles.rating}>
                    <IoStar size={12} color="#fbbf24" />
                    <span>{Number(hostel.rating || 0).toFixed(1)}</span>
                  </div>
                  {hostel.distance && (
                    <div className={styles.distance}>
                      <IoLocation size={12} color="#64748b" />
                      <span>{hostel.distance}km</span>
                    </div>
                  )}
                </div>
                <div className={styles.hostelPrice}>GHS {hostel.price_min || 0}/mo</div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
