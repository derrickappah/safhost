'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import { IoArrowBack, IoShareOutline, IoHeart, IoHeartOutline, IoLocation, IoStar, IoWalk, IoWifi, IoWater, IoShieldCheckmark, IoFlash, IoRestaurant, IoShirt, IoCall, IoAlertCircle, IoLogoWhatsapp, IoChatbubbleOutline, IoCopyOutline, IoSnow, IoFitness, IoSquareOutline, IoBook, IoPeople, IoCar } from 'react-icons/io5'
import styles from './page.module.css'
import { getHostelById, type Hostel } from '@/lib/actions/hostels'
import { getHostelReviews, getUserReview, createReview, updateReview, deleteReview, type Review } from '@/lib/actions/reviews'
import { isFavorited, addFavorite, removeFavorite } from '@/lib/actions/favorites'
import { checkSubscriptionAccess } from '@/lib/auth/subscription'
import { trackHostelView } from '@/lib/actions/views'
import { logContactClick } from '@/lib/actions/contacts'
import { flagHostelAvailability } from '@/lib/actions/availability'
import { getCurrentUser } from '@/lib/auth/client'
import ReportModal from '@/components/ReportModal'
import { IoFlagOutline, IoCreateOutline, IoTrashOutline, IoClose } from 'react-icons/io5'
import { calculateWalkingTime, calculateDrivingTime, formatTime } from '@/lib/location/detect'

const amenityIcons: Record<string, any> = {
  "Wi-Fi": IoWifi,
  "Water": IoWater,
  "Security": IoShieldCheckmark,
  "Electricity": IoFlash,
  "Kitchen": IoRestaurant,
  "Laundry": IoShirt,
  "AC": IoSnow,
  "Air Conditioning": IoSnow,
  "Gym": IoFitness,
  "Fitness": IoFitness,
  "Parking": IoSquareOutline,
  "Study Room": IoBook,
  "Study": IoBook,
  "Common Area": IoPeople,
  "Common Space": IoPeople,
}

export default function HostelDetailPage() {
  const router = useRouter()
  const params = useParams()
  const hostelId = params.id as string
  
  const [hostel, setHostel] = useState<Hostel | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [currentImage, setCurrentImage] = useState(0)
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportTarget, setReportTarget] = useState<'hostel' | string>('hostel')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  useEffect(() => {
    async function loadData() {
      // Check access
      const access = await checkSubscriptionAccess()
      setHasAccess(access.hasAccess)
      
      // Get current user
      const { data: userData } = await getCurrentUser()
      if (userData?.user) {
        setCurrentUser(userData.user)
      }
      
      // Load hostel
      const { data: hostelData, error } = await getHostelById(hostelId)
      if (hostelData) {
        setHostel(hostelData)
        
        // Check if favorited
        const favorited = await isFavorited(hostelId)
        setIsSaved(favorited)
        
        // Load reviews
        const { data: reviewsData } = await getHostelReviews(hostelId)
        if (reviewsData) {
          setReviews(reviewsData)
        }
        
        // Load user's review if logged in
        if (userData?.user) {
          const { data: userReviewData } = await getUserReview(hostelId)
          if (userReviewData) {
            setUserReview(userReviewData)
            setReviewRating(userReviewData.rating)
            setReviewComment(userReviewData.comment || '')
          }
        }
      }
      setLoading(false)
    }
    loadData()
  }, [hostelId])

  const handleSave = async () => {
    if (!hasAccess) {
      router.push('/auth/login?redirect=' + encodeURIComponent(`/hostel/${hostelId}`))
      return
    }
    
    if (isSaved) {
      const { error } = await removeFavorite(hostelId)
      if (error) {
        console.error('Failed to remove favorite:', error)
        alert('Failed to remove from favorites: ' + error)
      } else {
        setIsSaved(false)
      }
    } else {
      const { error } = await addFavorite(hostelId)
      if (error) {
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
      } else {
        setIsSaved(true)
      }
    }
  }

  const handleShare = async () => {
    if (navigator.share && hostel) {
      try {
        await navigator.share({
          title: `${hostel.name} on HostelFinder`,
          text: `Check out ${hostel.name}! From GHS ${hostel.price_min}/month`,
        })
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleContact = async () => {
    if (!hasAccess) {
      router.push('/auth/login?redirect=' + encodeURIComponent(`/hostel/${hostelId}`))
      return
    }
    
    if (hostel) {
      // Log contact click
      await logContactClick(hostelId)
      setShowContactModal(true)
    }
  }

  const handleCall = () => {
    if (hostel) {
      window.location.href = `tel:${hostel.landlord_phone}`
    }
  }

  const handleWhatsApp = () => {
    if (hostel) {
      // Remove any non-numeric characters except + for WhatsApp
      const phoneNumber = hostel.landlord_phone.replace(/[^\d+]/g, '')
      // If phone doesn't start with +, assume it's a local number and add country code
      const whatsappNumber = phoneNumber.startsWith('+') ? phoneNumber : `+233${phoneNumber.replace(/^0/, '')}`
      window.open(`https://wa.me/${whatsappNumber}`, '_blank')
    }
  }

  const handleSMS = () => {
    if (hostel) {
      window.location.href = `sms:${hostel.landlord_phone}`
    }
  }

  const handleCopyPhone = async () => {
    if (hostel) {
      try {
        await navigator.clipboard.writeText(hostel.landlord_phone)
        setCopiedPhone(true)
        setTimeout(() => setCopiedPhone(false), 2000)
      } catch (err) {
        console.error('Failed to copy:', err)
      }
    }
  }

  const handleLocationClick = () => {
    if (!hostel) return
    
    // If coordinates exist, open in Google Maps
    if (hostel.latitude && hostel.longitude) {
      // Open in Google Maps (works on both web and mobile)
      const googleMapsUrl = `https://www.google.com/maps?q=${hostel.latitude},${hostel.longitude}`
      window.open(googleMapsUrl, '_blank')
    } else if (hostel.address) {
      // Fallback: open with address search
      const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hostel.address)}`
      window.open(googleMapsUrl, '_blank')
    } else {
      // Last resort: navigate to map page
      router.push(`/hostels/map?hostel=${hostelId}`)
    }
  }

  const handleEditReview = (reviewId: string) => {
    setEditingReview(reviewId)
    // In a real app, you'd show an edit form
    // For now, we'll just allow deletion
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      const { error } = await deleteReview(reviewId)
      if (!error) {
        setReviews(reviews.filter(r => r.id !== reviewId))
      } else {
        alert('Failed to delete review: ' + error)
      }
    }
  }

  const handleReport = (type: 'hostel' | string) => {
    setReportTarget(type)
    setShowReportModal(true)
  }

  const handleOpenReviewModal = () => {
    if (!currentUser) {
      router.push('/auth/login?redirect=' + encodeURIComponent(`/hostel/${hostelId}`))
      return
    }
    setShowReviewModal(true)
  }

  const handleCloseReviewModal = () => {
    setShowReviewModal(false)
    if (!userReview) {
      setReviewRating(0)
      setReviewComment('')
    }
  }

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      alert('Please select a rating')
      return
    }

    setSubmittingReview(true)
    
    try {
      if (userReview) {
        // Update existing review
        const { data, error } = await updateReview(userReview.id, reviewRating, reviewComment)
        if (error) {
          alert('Failed to update review: ' + error)
        } else {
          // Refresh reviews
          const { data: reviewsData } = await getHostelReviews(hostelId)
          if (reviewsData) {
            setReviews(reviewsData)
          }
          // Update user review
          if (data) {
            setUserReview(data)
          }
          handleCloseReviewModal()
          alert('Review updated successfully!')
        }
      } else {
        // Create new review
        const { data, error } = await createReview({
          hostelId,
          rating: reviewRating,
          comment: reviewComment || undefined
        })
        if (error) {
          if (error.includes('subscription')) {
            alert('An active subscription is required to leave reviews')
          } else if (error.includes('Authentication')) {
            alert('Please log in to leave reviews')
            router.push('/auth/login?redirect=' + encodeURIComponent(`/hostel/${hostelId}`))
          } else {
            alert('Failed to submit review: ' + error)
          }
        } else {
          // Refresh reviews
          const { data: reviewsData } = await getHostelReviews(hostelId)
          if (reviewsData) {
            setReviews(reviewsData)
          }
          // Update user review
          if (data) {
            setUserReview(data)
          }
          // Refresh hostel data to update rating
          const { data: hostelData } = await getHostelById(hostelId)
          if (hostelData) {
            setHostel(hostelData)
          }
          handleCloseReviewModal()
          alert('Review submitted successfully!')
        }
      }
    } catch (error) {
      alert('An error occurred: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSubmittingReview(false)
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

  // Swipe handlers
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe && images.length > 0) {
      setCurrentImage((prev) => (prev < images.length - 1 ? prev + 1 : prev))
    }
    if (isRightSwipe && images.length > 0) {
      setCurrentImage((prev) => (prev > 0 ? prev - 1 : prev))
    }
    
    // Reset touch positions
    setTouchStart(null)
    setTouchEnd(null)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </div>
    )
  }

  if (!hostel) {
    return (
      <div className={styles.container}>
        <div style={{ padding: '40px', textAlign: 'center' }}>Hostel not found</div>
      </div>
    )
  }

  const images = hostel.images && hostel.images.length > 0 
    ? hostel.images 
    : ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800']
  
  // Ensure room_types is properly parsed
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
  
  console.log('Hostel room_types:', hostel.room_types)
  console.log('Parsed roomTypes:', roomTypes)

  return (
    <div className={styles.container}>
      <div className={styles.scrollContent}>
        {/* Image Carousel */}
        <div className={styles.imageContainer}>
          <div 
            className={styles.imageCarousel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {images.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`${hostel.name} ${index + 1}`}
                width={800}
                height={300}
                className={styles.hostelImage}
                style={{ display: currentImage === index ? 'block' : 'none' }}
              />
            ))}
          </div>

          {/* Image Indicators */}
          {images.length > 1 && (
            <div className={styles.imageIndicators}>
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`${styles.indicator} ${currentImage === index ? styles.indicatorActive : ''}`}
                  onClick={() => setCurrentImage(index)}
                />
              ))}
            </div>
          )}

          {/* Back Button */}
          <header className={styles.headerOverlay}>
            <button
              className={styles.backButton}
              onClick={() => router.back()}
            >
              <IoArrowBack size={24} color="#1e293b" />
            </button>
            <div className={styles.headerActions}>
              <button className={styles.actionButton} onClick={handleShare}>
                <IoShareOutline size={22} color="#1e293b" />
              </button>
              <button className={styles.actionButton} onClick={handleSave}>
                {isSaved ? (
                  <IoHeart size={22} color="#ef4444" />
                ) : (
                  <IoHeartOutline size={22} color="#1e293b" />
                )}
              </button>
            </div>
          </header>
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* Header */}
          <div className={styles.hostelHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerTop}>
                <h1 className={styles.hostelName}>{hostel.name}</h1>
                <button
                  className={styles.reportButton}
                  onClick={() => handleReport('hostel')}
                  title="Report this hostel"
                >
                  <IoFlagOutline size={18} color="#64748b" />
                </button>
              </div>
              <button 
                className={`${styles.locationRow} ${styles.locationButton}`}
                onClick={handleLocationClick}
                title="Open in map"
              >
                <IoLocation size={14} color="#64748b" />
                <span className={styles.locationText}>{hostel.address}</span>
              </button>
              {hostel.view_count !== undefined && hostel.view_count > 0 && (
                <div className={styles.viewCount}>
                  {hostel.view_count} {hostel.view_count === 1 ? 'view' : 'views'}
                </div>
              )}
              {hostel.updated_at && (
                <div className={styles.lastUpdated}>
                  Updated {getRelativeTime(hostel.updated_at)}
                </div>
              )}
            </div>
            <div className={styles.ratingBox}>
              <IoStar size={16} color="#fbbf24" />
              <span className={styles.ratingValue}>{Number(hostel.rating).toFixed(1)}</span>
              <span className={styles.reviewCount}>({hostel.review_count})</span>
            </div>
          </div>

          {/* Price & Distance */}
          <div className={styles.priceDistanceSection}>
            <div className={styles.priceBox}>
              <span className={styles.priceLabel}>Starting from</span>
              <span className={styles.priceValue}>
                GHS {hostel.price_min}
                <span className={styles.pricePeriod}>/month</span>
              </span>
            </div>
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
                        <Icon size={20} color="#2563eb" />
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
                  <span className={styles.roomPrice}>GHS {room.price}/mo</span>
                </div>
              ))}
            </section>
          )}

          {/* Description */}
          {hostel.description && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>About</h2>
              <p className={styles.description}>{hostel.description}</p>
            </section>
          )}

          {/* Contact Information */}
          {hasAccess && (
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              <div className={styles.contactCard}>
                <div className={styles.contactCardHeader}>
                  <div>
                    <h3 className={styles.contactCardName}>{hostel.landlord_name}</h3>
                    <p className={styles.contactCardLabel}>Landlord</p>
                  </div>
                </div>
                <div className={styles.contactCardPhone}>
                  <IoCall size={18} color="#2563eb" />
                  <span>{hostel.landlord_phone}</span>
                </div>
                <button
                  className={styles.contactCardButton}
                  onClick={handleContact}
                >
                  <IoCall size={18} />
                  <span>Contact Landlord</span>
                </button>
              </div>
            </section>
          )}

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
                    const { error } = await flagHostelAvailability(hostelId, 'General', 0)
                    if (error) {
                      alert('Failed to report: ' + error)
                    } else {
                      alert('Report submitted. Admin will review and update the listing.')
                    }
                  }
                }}
              >
                <IoAlertCircle size={18} color="#f59e0b" />
                <span>Room Taken / Not Available</span>
              </button>
            </section>
          )}

          {/* Reviews */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Reviews</h2>
              {currentUser && (
                <button
                  className={styles.writeReviewButton}
                  onClick={handleOpenReviewModal}
                >
                  <IoCreateOutline size={18} />
                  <span>{userReview ? 'Edit Review' : 'Write Review'}</span>
                </button>
              )}
            </div>
            {reviews.length === 0 ? (
              <div style={{ padding: '16px 0' }}>
                <p style={{ color: '#64748b', marginBottom: '12px' }}>No reviews yet</p>
                {currentUser && (
                  <button
                    className={styles.writeReviewButtonInline}
                    onClick={handleOpenReviewModal}
                  >
                    Be the first to review
                  </button>
                )}
              </div>
            ) : (
              reviews.slice(0, 5).map((review) => (
                <div key={review.id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewUser}>
                      <div className={styles.reviewAvatar}>
                        <span className={styles.reviewAvatarText}>
                          {(review.user?.email || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className={styles.reviewName}>
                          {review.user?.email?.split('@')[0] || 'Anonymous'}
                        </h4>
                        <span className={styles.reviewDate}>
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <IoStar
                          key={i}
                          size={14}
                          color={i < review.rating ? "#fbbf24" : "#e2e8f0"}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className={styles.reviewComment}>{review.comment}</p>
                  )}
                </div>
              ))
            )}
          </section>

          <div style={{ height: '120px' }} />
        </div>
      </div>

      {/* Bottom CTA */}
      <div className={styles.bottomCTA}>
        <div className={styles.ctaPrice}>
          <span className={styles.ctaPriceLabel}>From</span>
          <span className={styles.ctaPriceValue}>GHS {hostel.price_min}/mo</span>
        </div>
        <button
          className={styles.contactButton}
          onClick={handleContact}
        >
          <IoCall size={20} color="#fff" />
          <span className={styles.contactButtonText}>Contact Landlord</span>
        </button>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        hostelId={reportTarget === 'hostel' ? hostelId : undefined}
        reviewId={reportTarget !== 'hostel' ? reportTarget : undefined}
      />

      {/* Contact Modal */}
      {showContactModal && hostel && (
        <div className={styles.contactModalOverlay} onClick={() => setShowContactModal(false)}>
          <div className={styles.contactModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.contactModalHeader}>
              <h2 className={styles.contactModalTitle}>Contact Landlord</h2>
              <button
                className={styles.contactModalClose}
                onClick={() => setShowContactModal(false)}
              >
                <IoClose size={24} />
              </button>
            </div>
            
            <div className={styles.contactModalContent}>
              <div className={styles.landlordInfo}>
                <h3 className={styles.landlordName}>{hostel.landlord_name}</h3>
                <div className={styles.phoneNumber}>
                  <IoCall size={18} color="#64748b" />
                  <span>{hostel.landlord_phone}</span>
                </div>
              </div>

              <div className={styles.contactOptions}>
                <button
                  className={styles.contactOption}
                  onClick={handleCall}
                >
                  <div className={styles.contactOptionIcon} style={{ backgroundColor: '#10b981' }}>
                    <IoCall size={24} color="#fff" />
                  </div>
                  <div className={styles.contactOptionContent}>
                    <h4 className={styles.contactOptionTitle}>Call</h4>
                    <p className={styles.contactOptionDesc}>Make a phone call</p>
                  </div>
                </button>

                <button
                  className={styles.contactOption}
                  onClick={handleWhatsApp}
                >
                  <div className={styles.contactOptionIcon} style={{ backgroundColor: '#25D366' }}>
                    <IoLogoWhatsapp size={24} color="#fff" />
                  </div>
                  <div className={styles.contactOptionContent}>
                    <h4 className={styles.contactOptionTitle}>WhatsApp</h4>
                    <p className={styles.contactOptionDesc}>Send a message</p>
                  </div>
                </button>

                <button
                  className={styles.contactOption}
                  onClick={handleSMS}
                >
                  <div className={styles.contactOptionIcon} style={{ backgroundColor: '#3b82f6' }}>
                    <IoChatbubbleOutline size={24} color="#fff" />
                  </div>
                  <div className={styles.contactOptionContent}>
                    <h4 className={styles.contactOptionTitle}>SMS</h4>
                    <p className={styles.contactOptionDesc}>Send a text message</p>
                  </div>
                </button>

                <button
                  className={styles.contactOption}
                  onClick={handleCopyPhone}
                >
                  <div className={styles.contactOptionIcon} style={{ backgroundColor: '#64748b' }}>
                    <IoCopyOutline size={24} color="#fff" />
                  </div>
                  <div className={styles.contactOptionContent}>
                    <h4 className={styles.contactOptionTitle}>
                      {copiedPhone ? 'Copied!' : 'Copy Number'}
                    </h4>
                    <p className={styles.contactOptionDesc}>
                      {copiedPhone ? 'Phone number copied to clipboard' : 'Copy to clipboard'}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className={styles.reviewModalOverlay} onClick={handleCloseReviewModal}>
          <div className={styles.reviewModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.reviewModalHeader}>
              <h2 className={styles.reviewModalTitle}>
                {userReview ? 'Edit Your Review' : 'Write a Review'}
              </h2>
              <button
                className={styles.reviewModalClose}
                onClick={handleCloseReviewModal}
              >
                <IoClose size={24} />
              </button>
            </div>
            
            <div className={styles.reviewModalContent}>
              <div className={styles.ratingSelector}>
                <label className={styles.ratingLabel}>Rating</label>
                <div className={styles.starRating}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={styles.starButton}
                      onClick={() => setReviewRating(star)}
                      onMouseEnter={() => {
                        // Visual feedback on hover
                      }}
                    >
                      <IoStar
                        size={32}
                        color={star <= reviewRating ? "#fbbf24" : "#e2e8f0"}
                        style={{ cursor: 'pointer' }}
                      />
                    </button>
                  ))}
                </div>
                {reviewRating > 0 && (
                  <span className={styles.ratingText}>
                    {reviewRating === 1 && 'Poor'}
                    {reviewRating === 2 && 'Fair'}
                    {reviewRating === 3 && 'Good'}
                    {reviewRating === 4 && 'Very Good'}
                    {reviewRating === 5 && 'Excellent'}
                  </span>
                )}
              </div>

              <div className={styles.commentInput}>
                <label className={styles.commentLabel}>Your Review (Optional)</label>
                <textarea
                  className={styles.commentTextarea}
                  placeholder="Share your experience with this hostel..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={5}
                  maxLength={500}
                />
                <span className={styles.commentCounter}>
                  {reviewComment.length}/500
                </span>
              </div>
            </div>

            <div className={styles.reviewModalFooter}>
              <button
                className={styles.reviewCancelButton}
                onClick={handleCloseReviewModal}
                disabled={submittingReview}
              >
                Cancel
              </button>
              <button
                className={styles.reviewSubmitButton}
                onClick={handleSubmitReview}
                disabled={submittingReview || reviewRating === 0}
              >
                {submittingReview ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
