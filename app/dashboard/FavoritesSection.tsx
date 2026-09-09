'use client'

import { useState } from 'react'
import Link from 'next/link'
import { IoHeartOutline, IoArrowForward, IoCompassOutline } from 'react-icons/io5'
import styles from './page.module.css'
import { removeFavorite, addFavorite } from '@/lib/actions/favorites'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'
import DashboardHostelCard, { HostelCardData } from './DashboardHostelCard'

export interface FavoriteHostel extends HostelCardData {
  favoriteId?: string
}

interface FavoritesSectionProps {
  favorites: FavoriteHostel[]
  hasSubscription: boolean
}

export default function FavoritesSection({ favorites: initialFavorites, hasSubscription }: FavoritesSectionProps) {
  const { navigate } = useInstantNavigation()
  const [favorites, setFavorites] = useState(initialFavorites)

  const handleToggleFavorite = async (hostelId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!hasSubscription) {
      window.location.href = '/subscribe'
      return
    }
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
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyStateIcon}>
            <IoHeartOutline size={28} />
          </div>
          <p className={styles.emptyStateTitle}>No saved hostels yet</p>
          <p className={styles.emptyStateSubtitle}>
            Tap the heart icon on any hostel listing to save and compare your top accommodation choices.
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
        <h2 className={styles.sectionTitle}>Your Favorites</h2>
        <Link href="/favorites" className={styles.seeAll}>
          See All <IoArrowForward size={14} />
        </Link>
      </div>
      <div className={styles.horizontalScroll}>
        {favorites.map((hostel) => (
          <DashboardHostelCard
            key={hostel.id}
            hostel={hostel}
            isFavorite={true}
            onToggleFavorite={(id, e) => handleToggleFavorite(id, e)}
            variant="carousel"
          />
        ))}
      </div>
    </section>
  )
}
