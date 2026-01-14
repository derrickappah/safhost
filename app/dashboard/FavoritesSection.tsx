'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { IoStar, IoHeart, IoLocation, IoArrowForward } from 'react-icons/io5'
import styles from './page.module.css'
import { removeFavorite, addFavorite } from '@/lib/actions/favorites'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'

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
  const { navigate, handleMouseEnter, handleTouchStart } = useInstantNavigation()
  const [favorites, setFavorites] = useState(initialFavorites)

  const handleToggleFavorite = async (hostelId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const favorite = favorites.find(f => f.id === hostelId)
    const previousFavorites = favorites
    
    if (favorite) {
      // Optimistic update: remove from favorites immediately
      setFavorites(favorites.filter(f => f.id !== hostelId))
      
      // API call
      try {
        const { error } = await removeFavorite(hostelId)
        if (error) {
          // Rollback
          setFavorites(previousFavorites)
          alert('Failed to remove from favorites: ' + error)
        }
      } catch (error) {
        // Rollback on unexpected errors
        setFavorites(previousFavorites)
        alert('An unexpected error occurred')
      }
    } else {
      // Add to favorites (edge case - shouldn't normally happen in FavoritesSection)
      // Since we don't have hostel data, we can't add optimistically
      // Skip the expensive getFavorites() call - just attempt the add
      try {
        const { error } = await addFavorite(hostelId)
        if (error) {
          if (error === 'Authentication required') {
            alert('Please log in to save favorites')
          } else if (error === 'Active subscription required') {
            alert('An active subscription is required to save favorites')
          } else {
            alert('Failed to add to favorites: ' + error)
          }
        }
        // Note: Adding to FavoritesSection is rare - page refresh will show it
      } catch (error) {
        alert('An unexpected error occurred')
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
            onClick={() => navigate('/hostels')}
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
              onClick={() => navigate(`/hostel/${hostel.id}`)}
              onMouseEnter={() => handleMouseEnter(`/hostel/${hostel.id}`)}
              onTouchStart={() => handleTouchStart(`/hostel/${hostel.id}`)}
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
                <span className={styles.favoritePrice}>GHS {hostel.price || 0}/sem</span>
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
