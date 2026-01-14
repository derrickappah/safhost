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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [confirmDialogConfig, setConfirmDialogConfig] = useState<{
    title: string
    message: string
    type: 'success' | 'error' | 'info' | 'confirm'
    onConfirm?: () => void
    confirmText?: string
    cancelText?: string
  } | null>(null)

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

  const showDialog = (config: {
    title: string
    message: string
    type: 'success' | 'error' | 'info' | 'confirm'
    onConfirm?: () => void
    confirmText?: string
    cancelText?: string
  }) => {
    setConfirmDialogConfig(config)
    setShowConfirmDialog(true)
  }

  const closeDialog = () => {
    setShowConfirmDialog(false)
    setConfirmDialogConfig(null)
  }

  const handleConfirm = () => {
    if (confirmDialogConfig?.onConfirm) {
      confirmDialogConfig.onConfirm()
    }
    closeDialog()
  }

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      showDialog({
        title: 'Rating Required',
        message: 'Please select a rating',
        type: 'error'
      })
      return
    }

    // Validate comment requirement for ratings less than 2
    if (reviewRating < 2 && (!reviewComment || reviewComment.trim() === '')) {
      showDialog({
        title: 'Comment Required',
        message: 'A review comment is required for ratings below 2 stars',
        type: 'error'
      })
      return
    }

    setSubmittingReview(true)
    
    try {
      if (userReview) {
        const { data, error } = await updateReview(userReview.id, reviewRating, reviewComment)
        if (error) {
          showDialog({
            title: 'Update Failed',
            message: 'Failed to update review: ' + error,
            type: 'error'
          })
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
          showDialog({
            title: 'Success',
            message: 'Review updated successfully!',
            type: 'success'
          })
        }
      } else {
        const { data, error } = await createReview({
          hostelId,
          rating: reviewRating,
          comment: reviewComment || undefined
        })
        if (error) {
          if (error.includes('subscription')) {
            showDialog({
              title: 'Subscription Required',
              message: 'An active subscription is required to leave reviews',
              type: 'error'
            })
          } else if (error.includes('Authentication')) {
            showDialog({
              title: 'Authentication Required',
              message: 'Please log in to leave reviews',
              type: 'error',
              onConfirm: () => {
                router.push('/auth/login?redirect=' + encodeURIComponent(`/hostel/${hostelId}`))
              }
            })
          } else {
            showDialog({
              title: 'Submission Failed',
              message: 'Failed to submit review: ' + error,
              type: 'error'
            })
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
          showDialog({
            title: 'Success',
            message: 'Review submitted successfully!',
            type: 'success'
          })
        }
      }
    } catch (error) {
      showDialog({
        title: 'Error',
        message: 'An error occurred: ' + (error instanceof Error ? error.message : 'Unknown error'),
        type: 'error'
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleDeleteReview = (reviewId: string) => {
    showDialog({
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review? This action cannot be undone.',
      type: 'confirm',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const { error } = await deleteReview(reviewId)
        if (!error) {
          setReviews(reviews.filter(r => r.id !== reviewId))
          if (userReview?.id === reviewId) {
            setUserReview(null)
          }
          onReviewUpdate()
          showDialog({
            title: 'Success',
            message: 'Review deleted successfully',
            type: 'success'
          })
        } else {
          showDialog({
            title: 'Delete Failed',
            message: 'Failed to delete review: ' + error,
            type: 'error'
          })
        }
      }
    })
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
                  {review.user?.avatar_url ? (
                    <img
                      src={review.user.avatar_url}
                      alt={review.user?.email?.split('@')[0] || 'User'}
                      className={styles.reviewAvatarImage}
                    />
                  ) : (
                    <span className={styles.reviewAvatarText}>
                      {(review.user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  )}
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
                <label className={styles.commentLabel}>
                  Your Review {reviewRating > 0 && reviewRating < 2 ? '(Required)' : '(Optional)'}
                </label>
                <textarea
                  className={styles.commentTextarea}
                  placeholder={reviewRating > 0 && reviewRating < 2 ? "Please provide a comment explaining your low rating..." : "Share your experience with this hostel..."}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={5}
                  maxLength={500}
                  required={reviewRating > 0 && reviewRating < 2}
                />
                {reviewRating > 0 && reviewRating < 2 && (!reviewComment || reviewComment.trim() === '') && (
                  <span style={{ color: '#ef4444', fontSize: '14px', marginTop: '4px', display: 'block' }}>
                    A comment is required for ratings below 2 stars
                  </span>
                )}
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
                disabled={submittingReview || reviewRating === 0 || (reviewRating < 2 && (!reviewComment || reviewComment.trim() === ''))}
              >
                {submittingReview ? 'Submitting...' : userReview ? 'Update Review' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && confirmDialogConfig && (
        <div className={styles.confirmDialogOverlay} onClick={closeDialog}>
          <div className={styles.confirmDialog} onClick={(e) => e.stopPropagation()}>
            <div className={styles.confirmDialogHeader}>
              <h3 className={styles.confirmDialogTitle}>{confirmDialogConfig.title}</h3>
              <button
                className={styles.confirmDialogClose}
                onClick={closeDialog}
                aria-label="Close dialog"
              >
                <IoClose size={20} />
              </button>
            </div>
            <div className={styles.confirmDialogContent}>
              <p className={styles.confirmDialogMessage}>{confirmDialogConfig.message}</p>
            </div>
            <div className={styles.confirmDialogFooter}>
              {confirmDialogConfig.type === 'confirm' && (
                <button
                  className={styles.confirmDialogCancelButton}
                  onClick={closeDialog}
                >
                  {confirmDialogConfig.cancelText || 'Cancel'}
                </button>
              )}
              <button
                className={`${styles.confirmDialogButton} ${
                  confirmDialogConfig.type === 'error' 
                    ? styles.confirmDialogButtonError 
                    : confirmDialogConfig.type === 'success'
                    ? styles.confirmDialogButtonSuccess
                    : styles.confirmDialogButtonPrimary
                }`}
                onClick={handleConfirm}
              >
                {confirmDialogConfig.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
