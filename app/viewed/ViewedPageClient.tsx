'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { IoSearch, IoLocation, IoStar, IoCalendarOutline } from 'react-icons/io5'
import styles from './page.module.css'
import { getViewedHistory, ViewedHistoryFilters } from '@/lib/actions/views'
import { useFilter } from './FilterContext'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'

interface ViewedPageClientProps {
  initialHostels: any[]
  initialTotal: number
}

export default function ViewedPageClient({ initialHostels, initialTotal }: ViewedPageClientProps) {
  const { navigate, handleMouseEnter, handleTouchStart } = useInstantNavigation()
  const { showFilters } = useFilter()
  const [hostels, setHostels] = useState(initialHostels)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(initialTotal)
  const [page, setPage] = useState(1)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [location, setLocation] = useState('')
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'name_asc' | 'name_desc' | 'price_asc' | 'price_desc'>('date_desc')

  const loadData = useCallback(async () => {
    setLoading(true)
    const filters: ViewedHistoryFilters = {
      search: searchQuery || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      location: location || undefined,
      sortBy,
      limit: 20,
      offset: (page - 1) * 20
    }
    
    const { data, total: totalCount, error } = await getViewedHistory(filters)
    if (error) {
      console.error('Error loading viewed history:', error)
    } else {
      if (data) {
        setHostels(data)
        setTotal(totalCount || 0)
      }
    }
    setLoading(false)
  }, [searchQuery, startDate, endDate, location, sortBy, page])

  useEffect(() => {
    setPage(1)
  }, [searchQuery, startDate, endDate, location, sortBy])

  useEffect(() => {
    loadData()
  }, [loadData])

  return (
    <div className={styles.container}>
      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <IoSearch size={18} color="#94a3b8" className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by name or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <IoCalendarOutline size={16} />
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <IoCalendarOutline size={16} />
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>
              <IoLocation size={16} />
              Location
            </label>
            <input
              type="text"
              placeholder="Filter by location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="name_asc">Name (A-Z)</option>
              <option value="name_desc">Name (Z-A)</option>
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
            </select>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className={styles.loadingState}>
          <p>Loading...</p>
        </div>
      ) : hostels.length === 0 ? (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>No viewed hostels</h2>
          <p className={styles.emptySubtitle}>
            Hostels you view will appear here
          </p>
          <button
            className={styles.browseButton}
            onClick={() => router.push('/hostels')}
          >
            Browse Hostels
          </button>
        </div>
      ) : (
        <>
          <div className={styles.resultsHeader}>
            <span className={styles.resultsCount}>{total} hostel{total !== 1 ? 's' : ''} viewed</span>
          </div>
          <div className={styles.listContainer}>
            {hostels.map((hostel) => {
              const mainImage = hostel.images && hostel.images.length > 0 
                ? hostel.images[0] 
                : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'
              
              const hostelUrl = `/hostel/${hostel.id}`
              return (
                <div
                  key={hostel.id}
                  className={styles.hostelCard}
                  onClick={() => navigate(hostelUrl)}
                  onMouseEnter={() => handleMouseEnter(hostelUrl)}
                  onTouchStart={() => handleTouchStart(hostelUrl)}
                >
                  <div className={styles.hostelImageContainer}>
                    <Image
                      src={mainImage}
                      alt={hostel.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      className={styles.hostelImage}
                      quality={90}
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <h3 className={styles.hostelName}>{hostel.name}</h3>
                    </div>
                    <div className={styles.cardMeta}>
                      <div className={styles.ratingBadge}>
                        <IoStar size={12} color="#fbbf24" />
                        <span className={styles.ratingText}>{Number(hostel.rating || 0).toFixed(1)}</span>
                      </div>
                      {hostel.school && (
                        <div className={styles.locationText}>
                          <IoLocation size={12} color="#64748b" />
                          <span>{hostel.school.location || hostel.address}</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.viewedInfo}>
                      <span className={styles.viewedDate}>
                        Viewed {new Date(hostel.viewed_at).toLocaleDateString()}
                      </span>
                      {(hostel.view_count ?? 0) > 1 && (
                        <span className={styles.viewCount}>
                          {hostel.view_count} times
                        </span>
                      )}
                    </div>
                    <div className={styles.cardFooter}>
                      <span className={styles.priceText}>
                        GHS {hostel.price_min || 0}/sem
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className={styles.paginationInfo}>
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button
                className={styles.paginationButton}
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 20)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      <div style={{ height: '100px' }} />
    </div>
  )
}
