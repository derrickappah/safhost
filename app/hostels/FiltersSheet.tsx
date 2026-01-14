'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'
import { IoOptionsOutline, IoMan, IoWoman, IoPeople, IoWifi, IoWater, IoShieldCheckmark, IoFlash, IoRestaurant, IoBarbell, IoShirt, IoSnow, IoCar, IoBook } from 'react-icons/io5'
import styles from './page.module.css'

const amenityIcons: Record<string, any> = {
  "Wi-Fi": IoWifi,
  "Water": IoWater,
  "Security": IoShieldCheckmark,
  "Electricity": IoFlash,
  "AC": IoSnow,
  "Air Conditioning": IoSnow,
  "Kitchen": IoRestaurant,
  "Gym": IoBarbell,
  "Fitness": IoBarbell,
  "Laundry": IoShirt,
  "Parking": IoCar,
  "Study Room": IoBook,
  "Study": IoBook,
  "Common Area": IoPeople,
  "Common Space": IoPeople,
}

interface FiltersSheetProps {
  isOpen: boolean
  onClose: () => void
  initialFilters: {
    minPrice: number
    maxPrice: number
    distance: number
    amenities: string[]
    roomTypes: string[]
    genderRestriction: string
    isAvailable: boolean | undefined
  }
}

export default function FiltersSheet({ isOpen, onClose, initialFilters }: FiltersSheetProps) {
  const { navigate } = useInstantNavigation()
  const searchParams = useSearchParams()
  const [priceRange, setPriceRange] = useState([initialFilters.minPrice, initialFilters.maxPrice])
  const [distanceRange, setDistanceRange] = useState(initialFilters.distance)
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(initialFilters.amenities)
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>(initialFilters.roomTypes)
  const [genderRestriction, setGenderRestriction] = useState<string>(initialFilters.genderRestriction)
  const [isAvailable, setIsAvailable] = useState<boolean | undefined>(initialFilters.isAvailable)

  // Sync state with initialFilters when the sheet opens to load current URL params
  useEffect(() => {
    if (isOpen) {
      setPriceRange([initialFilters.minPrice, initialFilters.maxPrice])
      setDistanceRange(initialFilters.distance)
      setSelectedAmenities(initialFilters.amenities)
      setSelectedRoomTypes(initialFilters.roomTypes)
      setGenderRestriction(initialFilters.genderRestriction)
      setIsAvailable(initialFilters.isAvailable)
    }
  }, [isOpen]) // Only sync when sheet opens, initialFilters are passed as props from server

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    )
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString())
    else params.delete('minPrice')
    
    if (priceRange[1] < 1000) params.set('maxPrice', priceRange[1].toString())
    else params.delete('maxPrice')
    
    if (distanceRange < 10) params.set('distance', distanceRange.toString())
    else params.delete('distance')
    
    if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','))
    else params.delete('amenities')
    
    if (selectedRoomTypes.length > 0) params.set('roomTypes', selectedRoomTypes.join(','))
    else params.delete('roomTypes')
    
    if (genderRestriction) params.set('gender', genderRestriction)
    else params.delete('gender')
    
    if (isAvailable !== undefined) params.set('available', isAvailable.toString())
    else params.delete('available')
    
    navigate(`/hostels?${params.toString()}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />
      <div className={styles.filterSheet}>
        <div className={styles.sheetHeader}>
          <h2 className={styles.sheetTitle}>Filters</h2>
          <button 
            className={styles.clearButton} 
            onClick={() => {
              setPriceRange([0, 1000])
              setDistanceRange(10)
              setSelectedAmenities([])
              setSelectedRoomTypes([])
              setGenderRestriction('')
              setIsAvailable(undefined)
            }}
          >
            Clear All
          </button>
        </div>

        <div className={styles.sheetContent}>
          {/* Price Range */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>Price Range (GHS)</label>
            <div className={styles.priceInputs}>
              <div className={styles.priceInput}>
                <span className={styles.priceInputLabel}>Min Price</span>
                <input
                  type="number"
                  className={styles.priceInputField}
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  min="0"
                  max="1000"
                />
              </div>
              <div className={styles.priceInput}>
                <span className={styles.priceInputLabel}>Max Price</span>
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
            <label className={styles.filterLabel}>Distance from School</label>
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
                <IoMan size={24} color={genderRestriction === 'male' ? "#2563eb" : "#64748b"} />
                <span>Male Only</span>
              </button>
              <button
                className={`${styles.genderOption} ${genderRestriction === 'female' ? styles.genderOptionActive : ''}`}
                onClick={() => setGenderRestriction(genderRestriction === 'female' ? '' : 'female')}
              >
                <IoWoman size={24} color={genderRestriction === 'female' ? "#2563eb" : "#64748b"} />
                <span>Female Only</span>
              </button>
              <button
                className={`${styles.genderOption} ${genderRestriction === 'mixed' ? styles.genderOptionActive : ''}`}
                onClick={() => setGenderRestriction(genderRestriction === 'mixed' ? '' : 'mixed')}
              >
                <IoPeople size={24} color={genderRestriction === 'mixed' ? "#2563eb" : "#64748b"} />
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
                const isActive = selectedAmenities.includes(amenity)
                return (
                  <button
                    key={amenity}
                    className={`${styles.amenityOption} ${isActive ? styles.amenityOptionActive : ''}`}
                    onClick={() => toggleAmenity(amenity)}
                  >
                    <Icon
                      size={20}
                      color={isActive ? "#2563eb" : "#64748b"}
                    />
                    <span className={`${styles.amenityOptionText} ${isActive ? styles.amenityOptionTextActive : ''}`}>
                      {amenity}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className={styles.footerActions}>
          <button className={styles.applyButton} onClick={applyFilters}>
            <span className={styles.applyButtonText}>Apply Filters</span>
          </button>
        </div>
      </div>
    </>
  )
}
