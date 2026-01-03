'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { IoMapOutline, IoSearch, IoCloseCircle, IoOptionsOutline, IoChevronDown, IoLocation, IoStar, IoHeart, IoHeartOutline, IoWifi, IoWater, IoShieldCheckmark, IoSnow, IoRestaurant, IoFitness, IoMan, IoWoman, IoPeople, IoCheckbox, IoCheckboxOutline, IoGitCompare, IoFlash, IoShirt, IoSquareOutline, IoBook, IoWalk, IoCar } from 'react-icons/io5'
import styles from './page.module.css'
import { getHostels, type Hostel } from '@/lib/actions/hostels'
import { isFavorited, addFavorite, removeFavorite } from '@/lib/actions/favorites'
import SearchAutocomplete from '@/components/SearchAutocomplete'
import { calculateWalkingTime, calculateDrivingTime, formatTime } from '@/lib/location/detect'

const amenityIcons: Record<string, any> = {
  "Wi-Fi": IoWifi,
  "Water": IoWater,
  "Security": IoShieldCheckmark,
  "Electricity": IoFlash,
  "AC": IoSnow,
  "Air Conditioning": IoSnow,
  "Kitchen": IoRestaurant,
  "Gym": IoFitness,
  "Fitness": IoFitness,
  "Laundry": IoShirt,
  "Parking": IoSquareOutline,
  "Study Room": IoBook,
  "Study": IoBook,
  "Common Area": IoPeople,
  "Common Space": IoPeople,
}

function HostelsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const schoolId = searchParams.get('school')
  
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [favoritedHostels, setFavoritedHostels] = useState<Set<string>>(new Set())
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [distanceRange, setDistanceRange] = useState(10)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([])
  const [genderRestriction, setGenderRestriction] = useState<string>('')
  const [isAvailable, setIsAvailable] = useState<boolean | undefined>(undefined)
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'distance' | 'rating' | 'newest' | 'popular'>('newest')
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set())
  const sortMenuRef = useRef<HTMLDivElement>(null)

  const loadHostels = useCallback(async () => {
    setLoading(true)
    const filters: any = {
      search: searchQuery || undefined,
      minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
      maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
      maxDistance: distanceRange < 10 ? distanceRange : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      roomTypes: selectedRoomTypes.length > 0 ? selectedRoomTypes : undefined,
      genderRestriction: genderRestriction || undefined,
      isAvailable: isAvailable,
      sortBy: sortBy,
    }
    
    if (schoolId) {
      filters.schoolId = schoolId
    }
    
    const { data, error } = await getHostels(filters)
    if (data) {
      setHostels(data)
      
      // Check favorites
      const favoriteChecks = await Promise.all(
        data.map(hostel => isFavorited(hostel.id))
      )
      const favorited = new Set<string>()
      data.forEach((hostel, index) => {
        if (favoriteChecks[index]) {
          favorited.add(hostel.id)
        }
      })
      setFavoritedHostels(favorited)
    }
    setLoading(false)
  }, [searchQuery, priceRange, distanceRange, selectedAmenities, selectedRoomTypes, genderRestriction, isAvailable, sortBy, schoolId])

  useEffect(() => {
    loadHostels()
  }, [loadHostels])

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false)
      }
    }

    if (showSortMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSortMenu])

  const toggleSave = async (id: string) => {
    const isFav = favoritedHostels.has(id)
    
    if (isFav) {
      const { error } = await removeFavorite(id)
      if (error) {
        console.error('Failed to remove favorite:', error)
        alert('Failed to remove from favorites: ' + error)
      } else {
        setFavoritedHostels(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    } else {
      const { error } = await addFavorite(id)
      if (error) {
        console.error('Failed to add favorite:', error)
        if (error === 'Authentication required') {
          alert('Please log in to save favorites')
        } else if (error === 'Active subscription required') {
          alert('An active subscription is required to save favorites')
        } else {
          alert('Failed to add to favorites: ' + error)
        }
      } else {
        setFavoritedHostels(prev => new Set(prev).add(id))
      }
    }
  }

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    )
  }

  const applyFilters = () => {
    setShowFilters(false)
    loadHostels()
  }

  const toggleCompareMode = () => {
    setCompareMode(!compareMode)
    if (compareMode) {
      setSelectedForCompare(new Set())
    }
  }

  const toggleCompareSelection = (hostelId: string) => {
    if (selectedForCompare.has(hostelId)) {
      setSelectedForCompare(prev => {
        const next = new Set(prev)
        next.delete(hostelId)
        return next
      })
    } else {
      if (selectedForCompare.size < 4) {
        setSelectedForCompare(prev => new Set(prev).add(hostelId))
      } else {
        alert('You can compare up to 4 hostels at a time')
      }
    }
  }

  const handleCompare = () => {
    if (selectedForCompare.size >= 2) {
      router.push(`/compare?ids=${Array.from(selectedForCompare).join(',')}`)
    } else {
      alert('Please select at least 2 hostels to compare')
    }
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Find Hostels</h1>
        <button 
          className={styles.mapButton}
          onClick={() => {
            const params = new URLSearchParams()
            if (schoolId) params.set('school', schoolId)
            router.push(`/hostels/map?${params.toString()}`)
          }}
        >
          <IoMapOutline size={20} color="#2563eb" />
          <span className={styles.mapButtonText}>Map</span>
        </button>
      </header>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <SearchAutocomplete
          placeholder="Search hostels or schools..."
          onSelect={(result) => {
            if (result.type === 'hostel') {
              router.push(`/hostel/${result.id}`)
            } else {
              router.push(`/hostels?school=${result.id}`)
            }
          }}
        />
        <button className={styles.filterButton} onClick={() => setShowFilters(true)}>
          <IoOptionsOutline size={20} color="#1e293b" />
        </button>
      </div>

      {/* Results Count */}
      <div className={styles.resultsHeader}>
        <span className={styles.resultsCount}>
          {loading ? 'Loading...' : `${hostels.length} hostels found`}
        </span>
        <div className={styles.sortContainer} ref={sortMenuRef}>
          <button 
            className={styles.sortButton}
            onClick={() => setShowSortMenu(!showSortMenu)}
          >
            <span className={styles.sortText}>
              {sortBy === 'price_asc' ? 'Price: Low to High' :
               sortBy === 'price_desc' ? 'Price: High to Low' :
               sortBy === 'distance' ? 'Distance' :
               sortBy === 'rating' ? 'Rating' :
               sortBy === 'popular' ? 'Most Popular' :
               'Newest'}
            </span>
            <IoChevronDown size={16} color="#64748b" />
          </button>
          {showSortMenu && (
            <div className={styles.sortMenu}>
              <button
                className={`${styles.sortOption} ${sortBy === 'newest' ? styles.sortOptionActive : ''}`}
                onClick={() => {
                  setSortBy('newest')
                  setShowSortMenu(false)
                }}
              >
                Newest
              </button>
              <button
                className={`${styles.sortOption} ${sortBy === 'price_asc' ? styles.sortOptionActive : ''}`}
                onClick={() => {
                  setSortBy('price_asc')
                  setShowSortMenu(false)
                }}
              >
                Price: Low to High
              </button>
              <button
                className={`${styles.sortOption} ${sortBy === 'price_desc' ? styles.sortOptionActive : ''}`}
                onClick={() => {
                  setSortBy('price_desc')
                  setShowSortMenu(false)
                }}
              >
                Price: High to Low
              </button>
              <button
                className={`${styles.sortOption} ${sortBy === 'distance' ? styles.sortOptionActive : ''}`}
                onClick={() => {
                  setSortBy('distance')
                  setShowSortMenu(false)
                }}
              >
                Distance
              </button>
              <button
                className={`${styles.sortOption} ${sortBy === 'rating' ? styles.sortOptionActive : ''}`}
                onClick={() => {
                  setSortBy('rating')
                  setShowSortMenu(false)
                }}
              >
                Rating
              </button>
              <button
                className={`${styles.sortOption} ${sortBy === 'popular' ? styles.sortOptionActive : ''}`}
                onClick={() => {
                  setSortBy('popular')
                  setShowSortMenu(false)
                }}
              >
                Most Popular
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hostel List */}
      <div className={styles.listContainer}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading hostels...</div>
        ) : hostels.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>No hostels found. Try adjusting your filters.</p>
          </div>
        ) : (
          hostels.map((hostel) => {
            const AmenityIcon = amenityIcons[hostel.amenities?.[0] || ''] || IoStar
            const isFav = favoritedHostels.has(hostel.id)
            const mainImage = hostel.images && hostel.images.length > 0 
              ? hostel.images[0] 
              : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'
            
            return (
              <div
                key={hostel.id}
                className={styles.hostelCard}
                onClick={() => router.push(`/hostel/${hostel.id}`)}
                style={{ cursor: 'pointer' }}
              >
                {/* Image */}
                <div className={styles.imageContainer}>
                  {compareMode && (
                    <button
                      className={styles.compareCheckbox}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCompareSelection(hostel.id)
                      }}
                    >
                      {selectedForCompare.has(hostel.id) ? (
                        <IoCheckbox size={24} color="#2563eb" />
                      ) : (
                        <IoCheckboxOutline size={24} color="#fff" />
                      )}
                    </button>
                  )}
                  <Image
                    src={mainImage}
                    alt={hostel.name}
                    width={400}
                    height={180}
                    className={styles.hostelImage}
                  />
                  <button
                    className={styles.saveButton}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSave(hostel.id)
                    }}
                  >
                    {isFav ? (
                      <IoHeart size={20} color="#ef4444" />
                    ) : (
                      <IoHeartOutline size={20} color="#fff" />
                    )}
                  </button>
                </div>

                {/* Content */}
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.hostelName}>{hostel.name}</h3>
                    <div className={styles.ratingBadge}>
                      <IoStar size={12} color="#fbbf24" />
                      <span className={styles.ratingText}>{Number(hostel.rating).toFixed(1)}</span>
                      <span className={styles.reviewCount}>({hostel.review_count})</span>
                    </div>
                  </div>

                  <div className={styles.cardMeta}>
                    <span className={styles.priceText}>
                      From <strong className={styles.priceAmount}>GHS {hostel.price_min}</strong>/mo
                    </span>
                  </div>
                  
                  {hostel.distance && (
                    <div className={styles.distanceInfo}>
                      <div className={styles.distanceBadge}>
                        <IoWalk size={12} color="#6b7280" />
                        <span className={styles.distanceText}>
                          {formatTime(calculateWalkingTime(hostel.distance))} walk
                        </span>
                      </div>
                      <div className={styles.distanceBadge} style={{ marginLeft: '8px' }}>
                        <IoCar size={12} color="#6b7280" />
                        <span className={styles.distanceText}>
                          {formatTime(calculateDrivingTime(hostel.distance))} drive
                        </span>
                      </div>
                    </div>
                  )}

                  <div className={styles.amenitiesRow}>
                    {hostel.amenities?.slice(0, 4).map((amenity, idx) => {
                      const Icon = amenityIcons[amenity] || IoStar
                      return (
                        <div key={idx} className={styles.amenityTag}>
                          <Icon size={12} color="#64748b" />
                          <span className={styles.amenityText}>{amenity}</span>
                        </div>
                      )
                    })}
                    {hostel.amenities && hostel.amenities.length > 4 && (
                      <div className={styles.moreTag}>
                        <span className={styles.moreText}>+{hostel.amenities.length - 4}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div style={{ height: '100px' }} />
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <>
          <div className={styles.modalOverlay} onClick={() => setShowFilters(false)} />
          <div className={styles.filterSheet}>
            <div className={styles.sheetHandle} />
            <h2 className={styles.sheetTitle}>Filters</h2>

            {/* Price Range */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Price Range (GHS)</label>
              <div className={styles.priceInputs}>
                <div className={styles.priceInput}>
                  <span className={styles.priceInputLabel}>Min</span>
                  <input
                    type="number"
                    className={styles.priceInputField}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    min="0"
                    max="1000"
                  />
                </div>
                <div className={styles.priceDivider} />
                <div className={styles.priceInput}>
                  <span className={styles.priceInputLabel}>Max</span>
                  <input
                    type="number"
                    className={styles.priceInputField}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    min="0"
                    max="1000"
                  />
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="1000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className={styles.rangeSlider}
              />
            </div>

            {/* Distance Range */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Distance from School (km)</label>
              <div className={styles.distanceSliderContainer}>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={distanceRange}
                  onChange={(e) => setDistanceRange(Number(e.target.value))}
                  className={styles.rangeSlider}
                />
                <div className={styles.distanceValue}>Up to {distanceRange}km</div>
              </div>
            </div>

            {/* Room Types */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Room Types</label>
              <div className={styles.amenitiesGrid}>
                {['Single Room', 'Double Room', 'Self-Contained', 'Shared Room'].map((roomType) => (
                  <button
                    key={roomType}
                    className={`${styles.amenityOption} ${selectedRoomTypes.includes(roomType) ? styles.amenityOptionActive : ''}`}
                    onClick={() => {
                      setSelectedRoomTypes((prev) =>
                        prev.includes(roomType)
                          ? prev.filter((t) => t !== roomType)
                          : [...prev, roomType]
                      )
                    }}
                  >
                    <span className={`${styles.amenityOptionText} ${selectedRoomTypes.includes(roomType) ? styles.amenityOptionTextActive : ''}`}>
                      {roomType}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Restrictions */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Gender</label>
              <div className={styles.genderOptions}>
                <button
                  className={`${styles.genderOption} ${genderRestriction === 'male' ? styles.genderOptionActive : ''}`}
                  onClick={() => setGenderRestriction(genderRestriction === 'male' ? '' : 'male')}
                >
                  <IoMan size={20} color={genderRestriction === 'male' ? "#2563eb" : "#64748b"} />
                  <span>Male Only</span>
                </button>
                <button
                  className={`${styles.genderOption} ${genderRestriction === 'female' ? styles.genderOptionActive : ''}`}
                  onClick={() => setGenderRestriction(genderRestriction === 'female' ? '' : 'female')}
                >
                  <IoWoman size={20} color={genderRestriction === 'female' ? "#2563eb" : "#64748b"} />
                  <span>Female Only</span>
                </button>
                <button
                  className={`${styles.genderOption} ${genderRestriction === 'mixed' ? styles.genderOptionActive : ''}`}
                  onClick={() => setGenderRestriction(genderRestriction === 'mixed' ? '' : 'mixed')}
                >
                  <IoPeople size={20} color={genderRestriction === 'mixed' ? "#2563eb" : "#64748b"} />
                  <span>Mixed</span>
                </button>
              </div>
            </div>

            {/* Availability */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Availability</label>
              <div className={styles.availabilityOptions}>
                <button
                  className={`${styles.availabilityOption} ${isAvailable === true ? styles.availabilityOptionActive : ''}`}
                  onClick={() => setIsAvailable(isAvailable === true ? undefined : true)}
                >
                  <span>Available Now</span>
                </button>
                <button
                  className={`${styles.availabilityOption} ${isAvailable === false ? styles.availabilityOptionActive : ''}`}
                  onClick={() => setIsAvailable(isAvailable === false ? undefined : false)}
                >
                  <span>Not Available</span>
                </button>
              </div>
            </div>

            {/* Amenities */}
            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Amenities</label>
              <div className={styles.amenitiesGrid}>
                {Object.keys(amenityIcons).map((amenity) => {
                  const Icon = amenityIcons[amenity]
                  return (
                    <button
                      key={amenity}
                      className={`${styles.amenityOption} ${selectedAmenities.includes(amenity) ? styles.amenityOptionActive : ''}`}
                      onClick={() => toggleAmenity(amenity)}
                    >
                      <Icon
                        size={18}
                        color={selectedAmenities.includes(amenity) ? "#2563eb" : "#64748b"}
                      />
                      <span className={`${styles.amenityOptionText} ${selectedAmenities.includes(amenity) ? styles.amenityOptionTextActive : ''}`}>
                        {amenity}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Apply Button */}
            <button className={styles.applyButton} onClick={applyFilters}>
              <span className={styles.applyButtonText}>Apply Filters</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function HostelsPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </div>
    }>
      <HostelsPageContent />
    </Suspense>
  )
}
