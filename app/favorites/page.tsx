'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { IoHeartOutline, IoHeart, IoLocation, IoStar } from 'react-icons/io5'
import styles from './page.module.css'
import { getFavorites, removeFavorite } from '@/lib/actions/favorites'
import { getCurrentUser } from '@/lib/auth/client'

export default function FavoritesPage() {
  const router = useRouter()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    async function loadData() {
      // Check authentication first
      const { data, error } = await getCurrentUser()
      if (error || !data?.user) {
        router.push(`/auth/login?redirect=${encodeURIComponent('/favorites')}`)
        return
      }
      
      setCheckingAuth(false)
      
      // Load favorites
      const { data: favoritesData, error: favoritesError } = await getFavorites()
      if (favoritesData) {
        setFavorites(favoritesData)
      }
      setLoading(false)
    }
    loadData()
  }, [router])
  
  if (checkingAuth) {
    return (
      <div className={styles.container}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          fontSize: '16px',
          color: 'var(--color-text-secondary)'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Saved Hostels</h1>
        </header>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Saved Hostels</h1>
        </header>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <IoHeartOutline size={48} color="#cbd5e1" />
          </div>
          <h2 className={styles.emptyTitle}>No saved hostels yet</h2>
          <p className={styles.emptySubtitle}>
            Tap the heart icon on any hostel to save it here for quick access
          </p>
          <button
            className={styles.browseButton}
            onClick={() => router.push('/hostels')}
          >
            <span className={styles.browseButtonText}>Browse Hostels</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Saved Hostels</h1>
        <span className={styles.headerCount}>{favorites.length} saved</span>
      </header>

      <div className={styles.listContainer}>
        {favorites.map((favorite) => {
          const hostel = favorite.hostel
          if (!hostel) return null
          
          const mainImage = hostel.images && hostel.images.length > 0 
            ? hostel.images[0] 
            : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'
          
          return (
            <div
              key={favorite.id}
              className={styles.hostelCard}
              onClick={() => router.push(`/hostel/${hostel.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <Image
                src={mainImage}
                alt={hostel.name}
                width={110}
                height={130}
                className={styles.hostelImage}
              />
              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.hostelName}>{hostel.name}</h3>
                  <button
                    className={styles.heartButton}
                    onClick={async (e) => {
                      e.stopPropagation()
                      const { error } = await removeFavorite(hostel.id)
                      if (error) {
                        alert('Failed to remove from favorites: ' + error)
                      } else {
                        setFavorites(favorites.filter(f => f.id !== favorite.id))
                      }
                    }}
                  >
                    <IoHeart size={20} color="#ef4444" />
                  </button>
                </div>
                <div className={styles.cardMeta}>
                  <div className={styles.ratingBadge}>
                    <IoStar size={12} color="#fbbf24" />
                    <span className={styles.ratingText}>{Number(hostel.rating).toFixed(1)}</span>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <div className={styles.amenitiesRow}>
                    {hostel.amenities?.slice(0, 3).map((amenity: string, idx: number) => (
                      <div key={idx} className={styles.amenityTag}>
                        <span className={styles.amenityText}>{amenity}</span>
                      </div>
                    ))}
                  </div>
                  <span className={styles.priceText}>GHS {hostel.price_min}/mo</span>
                </div>
              </div>
            </div>
          )
        })}
        <div style={{ height: '100px' }} />
      </div>
    </div>
  )
}
