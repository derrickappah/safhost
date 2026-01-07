'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoStar, IoCreateOutline, IoTrashOutline, IoClose } from 'react-icons/io5'
import { type Review } from '@/lib/actions/reviews'
import { createReview, updateReview, deleteReview, getHostelReviews } from '@/lib/actions/reviews'
import styles from './page.module.css'

interface ReviewsSectionProps {
  initialReviews: Review[]
  hostelId: string
  userReview: Review | null
  currentUser: any
  onReviewUpdate: () => void
}

export default function ReviewsSection({ 
  initialReviews, 
  hostelId, 
  userReview: initialUserReview,
  currentUser,
  onReviewUpdate
}: ReviewsSectionProps) {
  const router = useRouter()
  const [reviews, setReviews] = useState(initialReviews)
  const [userReview, setUserReview] = useState(initialUserReview)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewRating, setReviewRating] = useState(userReview?.rating || 0)
  const [reviewComment, setReviewComment] = useState(userReview?.comment || '')
  const [submittingReview, setSubmittingReview] = useState(false)

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
        const { data, error } = await updateReview(userReview.id, reviewRating, reviewComment)
        if (error) {
          alert('Failed to update review: ' + error)
        } else {
          const { data: reviewsData } = await getHostelReviews(hostelId)
          if (reviewsData) {
            setReviews(reviewsData)
          }
          if (data) {
            setUserReview(data)
          }
          handleCloseReviewModal()
          onReviewUpdate()
          alert('Review updated successfully!')
        }
      } else {
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
          const { data: reviewsData } = await getHostelReviews(hostelId)
          if (reviewsData) {
            setReviews(reviewsData)
          }
          if (data) {
            setUserReview(data)
          }
          handleCloseReviewModal()
          onReviewUpdate()
          alert('Review submitted successfully!')
        }
      }
    } catch (error) {
      alert('An error occurred: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      const { error } = await deleteReview(reviewId)
      if (!error) {
        setReviews(reviews.filter(r => r.id !== reviewId))
        if (userReview?.id === reviewId) {
          setUserReview(null)
        }
        onReviewUpdate()
      } else {
        alert('Failed to delete review: ' + error)
      }
    }
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Reviews</h2>
        {currentUser && (
          <button
            className={styles.writeReviewButton}
            onClick={handleOpenReviewModal}
            title={userReview ? 'Edit Review' : 'Write Review'}
            aria-label={userReview ? 'Edit Review' : 'Write Review'}
          >
            <IoCreateOutline size={20} />
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
                <div className={styles.reviewUserInfo}>
                  <h4 className={styles.reviewName}>
                    {review.user?.email?.split('@')[0] || 'Anonymous'}
                  </h4>
                  <span className={styles.reviewDate}>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className={styles.reviewActions}>
                <div className={styles.reviewRating}>
                  {[...Array(5)].map((_, i) => (
                    <IoStar
                      key={i}
                      size={16}
                      color={i < review.rating ? "#fbbf24" : "#e2e8f0"}
                      fill={i < review.rating ? "#fbbf24" : "none"}
                    />
                  ))}
                </div>
                {currentUser && userReview?.id === review.id && (
                  <button
                    className={styles.reviewDeleteButton}
                    onClick={() => handleDeleteReview(review.id)}
                    title="Delete review"
                  >
                    <IoTrashOutline size={16} color="#ef4444" />
                  </button>
                )}
              </div>
            </div>
            {review.comment && (
              <p className={styles.reviewComment}>{review.comment}</p>
            )}
          </div>
        ))
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
                    >
                      <IoStar
                        size={32}
                        color={star <= reviewRating ? "#fbbf24" : "#e2e8f0"}
                        style={{ cursor: 'pointer' }}
                      />
                    </button>
                  ))}
                </div>
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
    </section>
  )
}
