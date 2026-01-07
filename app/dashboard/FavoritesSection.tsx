'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { IoStar, IoHeart, IoLocation, IoArrowForward } from 'react-icons/io5'
import styles from './page.module.css'
import { removeFavorite, addFavorite, getFavorites } from '@/lib/actions/favorites'

interface Favorite {
  id: string
  name: string
  price: number
  rating: number
  distance: string | null
  image: string
  favoriteId: string
}

interface FavoritesSectionProps {
  favorites: Favorite[]
}

export default function FavoritesSection({ favorites: initialFavorites }: FavoritesSectionProps) {
  const router = useRouter()
  const [favorites, setFavorites] = useState(initialFavorites)

  const handleToggleFavorite = async (hostelId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const favorite = favorites.find(f => f.id === hostelId)
    
    if (favorite) {
      // Remove from favorites
      await removeFavorite(hostelId)
      setFavorites(favorites.filter(f => f.id !== hostelId))
    } else {
      // Add to favorites
      const { data } = await addFavorite(hostelId)
      if (data) {
        // Reload favorites to get full data
        const { data: favoritesData } = await getFavorites()
        if (favoritesData) {
          setFavorites(favoritesData.map(fav => ({
            id: fav.hostel?.id || fav.hostel_id,
            name: fav.hostel?.name || 'Unknown',
            price: fav.hostel?.price_min || 0,
            rating: fav.hostel?.rating || 0,
            distance: null,
            image: fav.hostel?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
            favoriteId: fav.id
          })))
        }
      }
    }
  }

  if (favorites.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Your Favorites</h2>
        </div>
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            No favorites yet
          </p>
          <button
            onClick={() => router.push('/hostels')}
            style={{
              padding: '12px 24px',
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            Browse Hostels
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Your Favorites</h2>
        <Link href="/favorites" className={styles.seeAll}>
          See All <IoArrowForward size={14} />
        </Link>
      </div>
      <div className={styles.horizontalScroll}>
        {favorites.map((hostel) => {
          const imageUrl = hostel.image && hostel.image.trim() !== '' 
            ? hostel.image 
            : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'
          
          return (
            <div
              key={hostel.id}
              className={styles.favoriteCard}
              onClick={() => router.push(`/hostel/${hostel.id}`)}
            >
              {imageUrl && (
                <div className={styles.favoriteImageContainer}>
                  <Image
                    src={imageUrl}
                    alt={hostel.name || 'Hostel'}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className={styles.favoriteImage}
                    priority={hostel.id === favorites[0]?.id}
                    quality={90}
                  />
                </div>
              )}
              <div className={styles.favoriteContent}>
                <h3 className={styles.favoriteName}>{hostel.name}</h3>
                <div className={styles.favoriteRow}>
                  <div className={styles.ratingSmall}>
                    <IoStar size={10} color="#fbbf24" />
                    <span className={styles.ratingSmallText}>{Number(hostel.rating || 0).toFixed(1)}</span>
                  </div>
                  {hostel.distance && (
                    <span className={styles.distanceSmall}>{hostel.distance}</span>
                  )}
                </div>
                <span className={styles.favoritePrice}>GHS {hostel.price || 0}/mo</span>
              </div>
              <button 
                className={styles.heartButton}
                onClick={(e) => handleToggleFavorite(hostel.id, e)}
              >
                <IoHeart 
                  size={18} 
                  color="#ef4444"
                  fill="#ef4444"
                />
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
