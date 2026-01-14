'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { IoStar, IoHeart, IoHeartOutline, IoLocation, IoArrowForward } from 'react-icons/io5'
import styles from './page.module.css'
import { addFavorite, removeFavorite, getFavorites } from '@/lib/actions/favorites'
import { useState, useEffect } from 'react'

interface FeaturedHostel {
  id: string
  name: string
  price: number
  rating: number
  distance: number | null
  image: string
}

interface FeaturedSectionProps {
  featuredHostels: FeaturedHostel[]
}

export default function FeaturedSection({ featuredHostels: initialFeaturedHostels }: FeaturedSectionProps) {
  const router = useRouter()
  const [featuredHostels, setFeaturedHostels] = useState(initialFeaturedHostels)
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set())

  // Load favorited hostels on mount
  useEffect(() => {
    async function loadFavorites() {
      try {
        const { data } = await getFavorites()
        if (data) {
          const favoriteIds = new Set(data.map(fav => fav.hostel?.id || fav.hostel_id))
          setFavoritedIds(favoriteIds)
        }
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }
    loadFavorites()
  }, [])

  const handleToggleFavorite = async (hostelId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const isFavorited = favoritedIds.has(hostelId)
    const previousState = favoritedIds.has(hostelId)
    
    // Optimistic update
    if (isFavorited) {
      setFavoritedIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(hostelId)
        return newSet
      })
    } else {
      setFavoritedIds(prev => new Set(prev).add(hostelId))
    }
    
    // API call
    try {
      if (isFavorited) {
        const { error } = await removeFavorite(hostelId)
        if (error) {
          // Rollback
          setFavoritedIds(prev => {
            const newSet = new Set(prev)
            if (previousState) newSet.add(hostelId)
            else newSet.delete(hostelId)
            return newSet
          })
          alert('Failed to remove favorite: ' + error)
        }
      } else {
        const { error } = await addFavorite(hostelId)
        if (error) {
          // Rollback
          setFavoritedIds(prev => {
            const newSet = new Set(prev)
            if (previousState) newSet.add(hostelId)
            else newSet.delete(hostelId)
            return newSet
          })
          if (error === 'Authentication required') {
            alert('Please log in to save favorites')
          } else if (error === 'Active subscription required') {
            alert('An active subscription is required to save favorites')
          } else {
            alert('Failed to add favorite: ' + error)
          }
        }
      }
    } catch (error) {
      // Rollback on unexpected errors
      setFavoritedIds(prev => {
        const newSet = new Set(prev)
        if (previousState) newSet.add(hostelId)
        else newSet.delete(hostelId)
        return newSet
      })
      alert('An unexpected error occurred')
    }
  }

  if (featuredHostels.length === 0) {
    return null
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Featured Hostels</h2>
        <Link href="/hostels" className={styles.seeAll}>
          See All <IoArrowForward size={14} />
        </Link>
      </div>
      <div className={styles.horizontalScroll}>
        {featuredHostels.map((hostel) => {
          const imageUrl = hostel.image && hostel.image.trim() !== '' 
            ? hostel.image 
            : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'
          const isFavorited = favoritedIds.has(hostel.id)
          
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
                    priority={hostel.id === featuredHostels[0]?.id}
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
                    <span className={styles.distanceSmall}>
                      <IoLocation size={10} color="#6b7280" />
                      {hostel.distance.toFixed(1)}km
                    </span>
                  )}
                </div>
                <span className={styles.favoritePrice}>GHS {hostel.price || 0}/sem</span>
              </div>
              <button 
                className={styles.heartButton}
                onClick={(e) => handleToggleFavorite(hostel.id, e)}
              >
                {isFavorited ? (
                  <IoHeart size={20} color="#ef4444" />
                ) : (
                  <IoHeartOutline size={20} color="#fff" />
                )}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
