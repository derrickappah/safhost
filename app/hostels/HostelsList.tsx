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
  const [hostels, setHostels] = useState(initialHostels)
  const [favoritedHostels, setFavoritedHostels] = useState<Set<string>>(initialFavorited || new Set())

  // Update hostels and favorited when props change (e.g., when filters/sort change)
  useEffect(() => {
    setHostels(initialHostels)
  }, [initialHostels])

  useEffect(() => {
    if (initialFavorited) {
      setFavoritedHostels(initialFavorited)
    }
  }, [initialFavorited])

  const toggleSave = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const isFav = favoritedHostels.has(id)
    const previousState = favoritedHostels.has(id)

    // Optimistic update
    if (isFav) {
      setFavoritedHostels(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } else {
      setFavoritedHostels(prev => new Set(prev).add(id))
    }

    // API call
    try {
      if (isFav) {
        const { error } = await removeFavorite(id)
        if (error) {
          // Rollback
          setFavoritedHostels(prev => {
            const next = new Set(prev)
            if (previousState) next.add(id)
            else next.delete(id)
            return next
          })
          console.error('Failed to remove favorite:', error)
          alert('Failed to remove from favorites: ' + error)
        }
      } else {
        const { error } = await addFavorite(id)
        if (error) {
          // Rollback
          setFavoritedHostels(prev => {
            const next = new Set(prev)
            if (previousState) next.add(id)
            else next.delete(id)
            return next
          })
          console.error('Failed to add favorite:', error)
          if (error === 'Authentication required') {
            alert('Please log in to save favorites')
          } else if (error === 'Active subscription required') {
            alert('An active subscription is required to save favorites')
          } else {
            alert('Failed to add to favorites: ' + error)
          }
        }
      }
    } catch (error) {
      // Rollback on unexpected errors
      setFavoritedHostels(prev => {
        const next = new Set(prev)
        if (previousState) next.add(id)
        else next.delete(id)
        return next
      })
      alert('An unexpected error occurred')
    }
  }

  if (hostels.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>No hostels found. Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <div className={styles.listContainer}>
      {hostels.map((hostel) => (
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
