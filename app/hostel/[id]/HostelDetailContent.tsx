'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { IoLocation, IoStar, IoWalk, IoCar, IoWifi, IoWater, IoShieldCheckmark, IoFlash, IoRestaurant, IoShirt, IoSnow, IoBarbell, IoBook, IoPeople, IoCall, IoAlertCircle, IoFlagOutline, IoMale, IoFemale, IoArrowBack, IoShareOutline, IoHeart, IoHeartOutline, IoChevronForward } from 'react-icons/io5'
import { type Hostel } from '@/lib/actions/hostels'
import { type Review } from '@/lib/actions/reviews'
import { trackHostelView } from '@/lib/actions/views'
import { logContactClick } from '@/lib/actions/contacts'
import { flagHostelAvailability } from '@/lib/actions/availability'
import { calculateWalkingTime, calculateDrivingTime, formatTime } from '@/lib/location/detect'
import ImageCarousel from './ImageCarousel'
import ReviewsSection from './ReviewsSection'
import SimilarHostels from './SimilarHostels'
import ContactModal from './ContactModal'
import ReportModal from '@/components/ReportModal'
import styles from './page.module.css'

const amenityIcons: Record<string, any> = {
  "Wi-Fi": IoWifi,
  "Water": IoWater,
  "Security": IoShieldCheckmark,
  "Electricity": IoFlash,
  "Kitchen": IoRestaurant,
  "Laundry": IoShirt,
  "AC": IoSnow,
  "Air Conditioning": IoSnow,
  "Gym": IoBarbell,
  "Fitness": IoBarbell,
  "Parking": IoCar,
  "Study Room": IoBook,
  "Study": IoBook,
  "Common Area": IoPeople,
  "Common Space": IoPeople,
}

interface HostelDetailContentProps {
  hostel: Hostel
  initialReviews: Review[]
  initialUserReview: Review | null
  initialIsFavorited: boolean
  initialSimilarHostels: Hostel[]
  currentUser: any
  hasAccess: boolean
}

export default function HostelDetailContent({
  hostel,
  initialReviews,
  initialUserReview,
  initialIsFavorited,
  initialSimilarHostels,
  currentUser,
  hasAccess
}: HostelDetailContentProps) {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isSaved, setIsSaved] = useState(initialIsFavorited)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportTarget, setReportTarget] = useState<'hostel' | string>('hostel')
  const [showStickyHeader, setShowStickyHeader] = useState(false)

  // Track view on mount (non-blocking)
  useEffect(() => {
    trackHostelView(hostel.id).catch(err => {
      console.error('Error tracking view:', err)
    })
  }, [hostel.id])

  // Handle sticky header on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      // Show sticky header when scrolled past a reasonable threshold
      // Use 200px as a good threshold that works across devices
      setShowStickyHeader(scrollTop > 200)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSave = async () => {
    if (!hasAccess) {
      router.push('/auth/login?redirect=' + encodeURIComponent(`/hostel/${hostel.id}`))
      return
    }
    
    const previousState = isSaved
    
    // Optimistic update
    setIsSaved(!isSaved)
    
    // API call
    try {
      if (previousState) {
        const { removeFavorite } = await import('@/lib/actions/favorites')
        const { error } = await removeFavorite(hostel.id)
        if (error) {
          // Rollback
          setIsSaved(previousState)
          console.error('Failed to remove favorite:', error)
          alert('Failed to remove from favorites: ' + error)
        }
      } else {
        const { addFavorite } = await import('@/lib/actions/favorites')
        const { error } = await addFavorite(hostel.id)
        if (error) {
          // Rollback
          setIsSaved(previousState)
          console.error('Failed to add favorite:', error)
          if (error.includes('check constraint')) {
            alert('Failed to add to favorites. Please try again.')
          } else if (error === 'Authentication required') {
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
      setIsSaved(previousState)
      alert('An unexpected error occurred')
    }
  }

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${hostel.name} on SafHost`,
          text: `Check out ${hostel.name}! From GHS ${hostel.price_min}/sem`,
          url: url,
        })
      } catch (error) {
        // User cancelled or error occurred, ignore
        if ((error as Error).name !== 'AbortError') {
          console.log(error)
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
      } catch (error) {
        console.error('Failed to copy link:', error)
        alert('Failed to share. Please copy the URL manually.')
      }
    }
  }

  const handleContact = async () => {
    if (!hasAccess) {
      router.push('/auth/login?redirect=' + encodeURIComponent(`/hostel/${hostel.id}`))
      return
    }
    
    const { error } = await logContactClick(hostel.id)
    if (error) {
      console.error('Failed to log contact:', error)
    }
    setShowContactModal(true)
  }

  const handleLocationClick = () => {
    if (hostel.latitude && hostel.longitude) {
      router.push(`/hostels/map?hostel=${hostel.id}&mode=directions`)
    } else {
      router.push(`/hostels/map?hostel=${hostel.id}`)
    }
  }

  const handleReport = (type: 'hostel' | string) => {
    setReportTarget(type)
    setShowReportModal(true)
  }

  const handleReviewUpdate = () => {
    // Refresh hostel data to update rating
    window.location.reload()
  }

  const images = hostel.images && hostel.images.length > 0 
    ? hostel.images 
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']
  
  let roomTypes: any[] = []
  if (hostel.room_types) {
    if (Array.isArray(hostel.room_types)) {
      roomTypes = hostel.room_types
    } else if (typeof hostel.room_types === 'string') {
      try {
        roomTypes = JSON.parse(hostel.room_types)
      } catch (e) {
        console.error('Error parsing room_types:', e)
        roomTypes = []
      }
    }
  }

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`
    if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`
    return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`
  }

  return (
    <div className={styles.container}>
      {/* Sticky Header */}
      <div className={`${styles.stickyHeader} ${showStickyHeader ? styles.stickyHeaderVisible : ''}`}>
        <button
          className={styles.stickyBackButton}
          onClick={() => router.back()}
          aria-label="Go back"
        >
          <IoArrowBack size={22} color="#1e293b" />
        </button>
        <div className={styles.stickyHeaderActions}>
          <button
            className={styles.stickyActionButton}
            onClick={handleShare}
            aria-label="Share hostel"
          >
            <IoShareOutline size={20} color="#1e293b" />
          </button>
          <button
            className={styles.stickyActionButton}
            onClick={handleSave}
            aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
          >
            {isSaved ? (
              <IoHeart size={20} color="#ef4444" />
            ) : (
              <IoHeartOutline size={20} color="#1e293b" />
            )}
          </button>
        </div>
      </div>

      <div className={styles.scrollContent}>
        {/* Image Carousel */}
        <ImageCarousel
          images={images}
          hostelName={hostel.name}
          isFavorited={isSaved}
          onToggleFavorite={handleSave}
          onShare={handleShare}
        />

        {/* Content */}
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.hostelHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerTop}>
                <h1 className={styles.hostelName}>
                  {hostel.name}
                  <span className={styles.inlineRating}>
                    <IoStar size={18} color="#fbbf24" />
                    {Number(hostel.rating).toFixed(1)}
                    <span className={styles.inlineReviewCount}>({hostel.review_count})</span>
                  </span>
                </h1>
                <button
                  className={styles.reportButton}
                  onClick={() => handleReport('hostel')}
                  title="Report this hostel"
                >
                  <IoFlagOutline size={18} color="#64748b" />
                </button>
              </div>
              <button 
                className={styles.locationLink}
                onClick={handleLocationClick}
                title="View on map"
              >
                <div className={styles.locationInfo}>
                  <IoLocation size={18} className={styles.locationIcon} />
                  <span className={styles.locationText}>{hostel.address}</span>
                </div>
                <span className={styles.mapLabel}>View Map</span>
              </button>
              <div className={styles.metaInfo}>
                {(hostel.view_count ?? 0) > 0 && (
                  <span className={styles.viewCount}>
                    {hostel.view_count} {hostel.view_count === 1 ? 'view' : 'views'}
                  </span>
                )}
                {hostel.updated_at && (
                  <span className={styles.lastUpdated}>
                    • Updated {getRelativeTime(hostel.updated_at)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Distance & Price */}
          <div className={styles.priceDistanceSection}>
            {hostel.distance && (
              <div className={styles.distanceInfo}>
                <div className={styles.distanceBadge}>
                  <IoWalk size={14} color="#64748b" />
                  <div className={styles.distanceTextContent}>
                    <span className={styles.distanceTextMain}>
                      {formatTime(calculateWalkingTime(hostel.distance))} walk
                    </span>
                    <span className={styles.distanceTextSub}>from {hostel.school?.name || 'campus'}</span>
                  </div>
                </div>
                <div className={styles.distanceBadge}>
                  <IoCar size={14} color="#64748b" />
                  <div className={styles.distanceTextContent}>
                    <span className={styles.distanceTextMain}>
                      {formatTime(calculateDrivingTime(hostel.distance))} drive
                    </span>
                    <span className={styles.distanceTextSub}>{hostel.distance}km from {hostel.school?.name || 'campus'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Amenities */}
          {hostel.amenities && hostel.amenities.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Amenities</h2>
              <div className={styles.amenitiesGrid}>
                {hostel.amenities.map((amenity, index) => {
                  const Icon = amenityIcons[amenity] || IoStar
                  return (
                    <div key={index} className={styles.amenityItem}>
                      <div className={styles.amenityIcon}>
                        <Icon size={16} color="#2563eb" />
                      </div>
                      <span className={styles.amenityName}>{amenity}</span>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Room Types */}
          {roomTypes.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Room Types</h2>
              {roomTypes.map((room: any, index: number) => (
                <div key={index} className={styles.roomCard}>
                  <div className={styles.roomInfo}>
                    <h3 className={styles.roomType}>{room.type}</h3>
                    {room.available !== undefined && (
                      <span className={styles.roomAvailable}>
                        {room.available} rooms available
                      </span>
                    )}
                  </div>
                  <span className={styles.roomPrice}>GHS {room.price}/sem</span>
                </div>
              ))}
            </section>
          )}

          {/* About Section */}
          {(hostel.description || hostel.gender_restriction) && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>About</h2>
              
              {hostel.gender_restriction && (
                <div className={styles.genderRestrictionSection} style={{ marginBottom: hostel.description ? '20px' : '0' }}>
                  {hostel.gender_restriction === 'male' && (
                    <div className={`${styles.genderBadge} ${styles.genderBadgeMale}`}>
                      <IoMale size={16} color="#ffffff" />
                      <span className={styles.genderText}>Male Only</span>
                    </div>
                  )}
                  {hostel.gender_restriction === 'female' && (
                    <div className={`${styles.genderBadge} ${styles.genderBadgeFemale}`}>
                      <IoFemale size={16} color="#ffffff" />
                      <span className={styles.genderText}>Female Only</span>
                    </div>
                  )}
                  {hostel.gender_restriction === 'mixed' && (
                    <div className={`${styles.genderBadge} ${styles.genderBadgeMixed}`}>
                      <IoPeople size={16} color="#ffffff" />
                      <span className={styles.genderText}>Mixed Gender</span>
                    </div>
                  )}
                </div>
              )}

              {hostel.description && (
                <p className={styles.description}>{hostel.description}</p>
              )}
            </section>
          )}

          {/* Contact Information */}
          {hasAccess && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              <div className={styles.contactCard}>
                <div className={styles.contactCardHeader}>
                  <div>
                    <h3 className={styles.contactCardName}>{hostel.hostel_manager_name}</h3>
                    <p className={styles.contactCardLabel}>Hostel Manager</p>
                  </div>
                </div>
                <button
                  className={styles.contactCardButton}
                  onClick={handleContact}
                >
                  <IoCall size={18} />
                  <span>Contact Hostel Manager</span>
                </button>
              </div>
            </section>
          )}

          {/* Reviews */}
          <ReviewsSection
            initialReviews={initialReviews}
            hostelId={hostel.id}
            userReview={initialUserReview}
            currentUser={currentUser}
            onReviewUpdate={handleReviewUpdate}
          />

          {/* Similar Hostels */}
          <SimilarHostels similarHostels={initialSimilarHostels} />

          {/* Availability Flagging */}
          {hasAccess && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Report Availability</h2>
              </div>
              <button
                className={styles.flagButton}
                onClick={async () => {
                  if (confirm('Report this hostel as no longer available? This will be reviewed by admin.')) {
                    const { error } = await flagHostelAvailability(hostel.id, 'General', 0)
                    if (error) {
                      alert('Failed to report: ' + error)
                    } else {
                      alert('Report submitted. Admin will review and update the listing.')
                    }
                  }
                }}
              >
                <IoAlertCircle size={20} color="#f97316" />
                <span>Room Taken / Not Available</span>
              </button>
            </section>
          )}

          <div style={{ height: '40px' }} />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className={styles.bottomCTA}>
        <div className={styles.ctaPrice}>
          <span className={styles.ctaPriceLabel}>From</span>
          <span className={styles.ctaPriceValue}>GHS {hostel.price_min}/sem</span>
        </div>
        <button
          className={styles.contactButton}
          onClick={handleContact}
          title="Contact Hostel Manager"
          aria-label="Contact Hostel Manager"
        >
          <IoCall size={22} color="#fff" />
        </button>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        hostelId={reportTarget === 'hostel' ? hostel.id : undefined}
        reviewId={reportTarget !== 'hostel' ? reportTarget : undefined}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        hostelManagerName={hostel.hostel_manager_name}
        phone={hostel.hostel_manager_phone}
      />
    </div>
  )
}
