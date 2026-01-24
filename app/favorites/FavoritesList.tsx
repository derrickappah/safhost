'use client'

import { useState } from 'react'
import Image from 'next/image'
import { IoHeart, IoStar, IoLocationOutline, IoHeartOutline } from 'react-icons/io5'
import { removeFavorite, type Favorite } from '@/lib/actions/favorites'
import styles from './page.module.css'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'

interface FavoritesListProps {
  initialFavorites: Favorite[]
  hasSubscription: boolean
}

export default function FavoritesList({ initialFavorites, hasSubscription }: FavoritesListProps) {
  const { navigate, handleMouseEnter, handleTouchStart } = useInstantNavigation()
  const [favorites, setFavorites] = useState(initialFavorites)

  const handleRemoveFavorite = async (favoriteId: string, hostelId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!hasSubscription) {
      navigate('/subscribe')
      return
    }
    const previousFavorites = favorites

    // Optimistic update: remove from list immediately
    setFavorites(favorites.filter(f => f.id !== favoriteId))

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
  }

  if (favorites.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <IoHeartOutline size={64} color="#cbd5e1" />
        </div>
        <h2 className={styles.emptyTitle}>No saved hostels yet</h2>
        <p className={styles.emptySubtitle}>
          Start exploring and save your favorite hostels for quick access later
        </p>
        <button
          className={styles.browseButton}
          onClick={() => navigate('/hostels')}
        >
          <span className={styles.browseButtonText}>Browse Hostels</span>
        </button>
      </div>
    )
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.cardsGrid}>
        {favorites.map((favorite) => {
          const hostel = favorite.hostel
          if (!hostel) return null

          const mainImage = hostel.images && hostel.images.length > 0
            ? hostel.images[0]
            : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'

          const hostelUrl = `/hostel/${hostel.id}`
          return (
            <div
              key={favorite.id}
              className={styles.hostelCard}
              onClick={() => {
                if (!hasSubscription) {
                  navigate('/subscribe')
                } else {
                  navigate(hostelUrl)
                }
              }}
              onMouseEnter={() => hasSubscription && handleMouseEnter(hostelUrl)}
              onTouchStart={() => hasSubscription && handleTouchStart(hostelUrl)}
            >
              <div className={styles.imageContainer}>
                <Image
                  src={mainImage}
                  alt={hostel.name}
                  fill
                  className={styles.hostelImage}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <button
                  className={styles.heartButton}
                  onClick={(e) => handleRemoveFavorite(favorite.id, hostel.id, e)}
                  aria-label="Remove from favorites"
                >
                  <IoHeart size={20} color="#ef4444" fill="#ef4444" />
                </button>
                {hostel.rating > 0 && (
                  <div className={styles.ratingBadge}>
                    <IoStar size={14} color="#fbbf24" fill="#fbbf24" />
                    <span className={styles.ratingText}>{Number(hostel.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.hostelName}>{hostel.name}</h3>
                {hostel.address && (
                  <div className={styles.location}>
                    <IoLocationOutline size={14} color="#64748b" />
                    <span className={styles.locationText}>{hostel.address}</span>
                  </div>
                )}
                {hostel.amenities && hostel.amenities.length > 0 && (
                  <div className={styles.amenitiesRow}>
                    {hostel.amenities.slice(0, 3).map((amenity: string, idx: number) => (
                      <span key={idx} className={styles.amenityTag}>
                        {amenity}
                      </span>
                    ))}
                    {hostel.amenities.length > 3 && (
                      <span className={styles.moreAmenities}>+{hostel.amenities.length - 3}</span>
                    )}
                  </div>
                )}
                <div className={styles.cardFooter}>
                  <span className={styles.priceText}>GHS {hostel.price_min}</span>
                  <span className={styles.pricePeriod}>/sem</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ height: '100px' }} />
    </div>
  )
}
