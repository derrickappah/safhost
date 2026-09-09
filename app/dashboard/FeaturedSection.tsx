'use client'

import Link from 'next/link'
import { IoArrowForward } from 'react-icons/io5'
import styles from './page.module.css'
import { addFavorite, removeFavorite } from '@/lib/actions/favorites'
import { useState } from 'react'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'
import DashboardHostelCard, { HostelCardData } from './DashboardHostelCard'

export interface FeaturedHostel extends HostelCardData {}

interface FeaturedSectionProps {
  featuredHostels: FeaturedHostel[]
  hasSubscription: boolean
  initialFavoriteIds: string[]
}

export default function FeaturedSection({
  featuredHostels: initialFeaturedHostels,
  hasSubscription,
  initialFavoriteIds
}: FeaturedSectionProps) {
  const { navigate } = useInstantNavigation()
  const [featuredHostels] = useState(initialFeaturedHostels)
  const [favoritedIds, setFavoritedIds] = useState<Set<string>>(new Set(initialFavoriteIds))

  const handleToggleFavorite = async (hostelId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!hasSubscription) {
      window.location.href = '/subscribe'
      return
    }
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
        {featuredHostels.map((hostel, index) => (
          <DashboardHostelCard
            key={hostel.id}
            hostel={hostel}
            isFavorite={favoritedIds.has(hostel.id)}
            onToggleFavorite={(id, e) => handleToggleFavorite(id, e)}
            priority={index === 0}
            variant="carousel"
          />
        ))}
      </div>
    </section>
  )
}
