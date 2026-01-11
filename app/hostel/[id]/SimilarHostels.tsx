'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { IoStar, IoLocation } from 'react-icons/io5'
import { type Hostel } from '@/lib/actions/hostels'
import styles from './page.module.css'

interface SimilarHostelsProps {
  similarHostels: Hostel[]
}

export default function SimilarHostels({ similarHostels }: SimilarHostelsProps) {
  const router = useRouter()

  if (similarHostels.length === 0) {
    return null
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Similar Hostels</h2>
      </div>
      <div className={styles.similarHostelsGrid}>
        {similarHostels.map((similarHostel) => {
          const mainImage = similarHostel.images && similarHostel.images.length > 0 
            ? similarHostel.images[0] 
            : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'
          
          return (
            <button
              key={similarHostel.id}
              className={styles.similarHostelCard}
              onClick={() => router.push(`/hostel/${similarHostel.id}`)}
            >
              <div className={styles.similarHostelImageContainer}>
                <Image
                  src={mainImage}
                  alt={similarHostel.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  className={styles.similarHostelImage}
                  quality={90}
                />
              </div>
              <div className={styles.similarHostelInfo}>
                <h3 className={styles.similarHostelName}>{similarHostel.name}</h3>
                <div className={styles.similarHostelMeta}>
                  <div className={styles.similarHostelRating}>
                    <IoStar size={12} color="#fbbf24" />
                    <span>{Number(similarHostel.rating || 0).toFixed(1)}</span>
                  </div>
                  {similarHostel.distance && (
                    <div className={styles.similarHostelDistance}>
                      <IoLocation size={12} color="#64748b" />
                      <span>{similarHostel.distance}km</span>
                    </div>
                  )}
                </div>
                <div className={styles.similarHostelPrice}>
                  GHS {similarHostel.price_min || 0}/sem
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
