'use client'

import { useState, useEffect } from 'react'
import { addFavorite, removeFavorite } from '@/lib/actions/favorites'
import { type Hostel } from '@/lib/actions/hostels'
import HostelCard from './HostelCard'
import styles from './page.module.css'

interface HostelsListProps {
  initialHostels: Hostel[]
  initialFavorited?: Set<string>
  compareMode?: boolean
  selectedHostels?: Set<string>
  onToggleSelection?: (id: string, e: React.MouseEvent) => void
  hasSubscription: boolean
}

export default function HostelsList({
  initialHostels,
  initialFavorited,
  compareMode = false,
  selectedHostels = new Set(),
  onToggleSelection,
  hasSubscription
}: HostelsListProps) {
  const [favoritedHostels, setFavoritedHostels] = useState<Set<string>>(initialFavorited || new Set())

  useEffect(() => {
    if (initialFavorited) {
      setFavoritedHostels(initialFavorited)
    }
  }, [initialFavorited])



  const toggleSave = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const isFav = favoritedHostels.has(id)

    // Optimistic update
    setFavoritedHostels(prev => {
      const next = new Set(prev)
      if (isFav) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })

    // API call
    try {
      if (isFav) {
        const { error } = await removeFavorite(id)
        if (error) throw new Error(error)
      } else {
        const { error } = await addFavorite(id)
        if (error) throw new Error(error)
      }
    } catch (error) {
      // Rollback on error
      setFavoritedHostels(prev => {
        const next = new Set(prev)
        if (isFav) {
          next.add(id) // It was fav, we tried to remove, so add back
        } else {
          next.delete(id) // It wasn't fav, we tried to add, so remove
        }
        return next
      })

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Failed to update favorite:', errorMessage)

      if (errorMessage === 'Authentication required') {
        alert('Please log in to save favorites')
      } else if (errorMessage === 'Active subscription required') {
        alert('An active subscription is required to save favorites')
      } else {
        alert('Failed to update favorite: ' + errorMessage)
      }
    }
  }

  if (initialHostels.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2 className={styles.emptyTitle}>No hostels found</h2>
        <p className={styles.emptySubtitle}>
          Try adjusting your filters to see more results
        </p>
      </div>
    )
  }

  return (
    <div className={styles.listContainer}>
      {initialHostels.map((hostel) => (
        <HostelCard
          key={hostel.id}
          hostel={hostel}
          isFavorited={favoritedHostels.has(hostel.id)}
          onToggleFavorite={toggleSave}
          compareMode={compareMode}
          isSelected={selectedHostels.has(hostel.id)}
          onToggleSelection={onToggleSelection}
          hasSubscription={hasSubscription}
        />
      ))}
      <div style={{ height: '100px' }} />
    </div>
  )
}
