'use client'

import { useState } from 'react'
import { IoCheckmarkCircle, IoCloseCircle, IoStar } from 'react-icons/io5'
import { updateReviewStatus } from '@/lib/admin/reviews'
import styles from './page.module.css'

interface Review {
  id: string
  hostel_id: string
  user_id: string | null
  rating: number
  comment: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  hostel?: { id: string; name: string }
  user?: { email: string }
}

interface ReviewsListProps {
  initialReviews: Review[]
  initialFilter: 'all' | 'pending' | 'approved' | 'rejected'
}

export default function ReviewsList({ initialReviews, initialFilter }: ReviewsListProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [filter, setFilter] = useState(initialFilter)

  const handleStatusChange = async (reviewId: string, status: 'approved' | 'rejected') => {
    const { error } = await updateReviewStatus(reviewId, status)
    if (error) {
      alert('Failed to update review: ' + error)
    } else {
      // Reload page to get updated data
      window.location.reload()
    }
  }

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter)
    const params = new URLSearchParams()
    if (newFilter !== 'all') {
      params.set('filter', newFilter)
    }
    window.location.href = `/admin/reviews?${params.toString()}`
  }

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.status === filter)

  return (
    <>
      <div className={styles.filters}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            className={`${styles.filterButton} ${filter === status ? styles.filterButtonActive : ''}`}
            onClick={() => handleFilterChange(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {filteredReviews.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No reviews found</p>
          </div>
        ) : (
          <div className={styles.reviewsList}>
            {filteredReviews.map((review) => (
              <div key={review.id} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div>
                    <h3 className={styles.reviewTitle}>
                      {review.hostel?.name || 'Unknown Hostel'}
                    </h3>
                    <div className={styles.reviewMeta}>
                      <div className={styles.reviewRating}>
                        {[...Array(5)].map((_, i) => (
                          <IoStar
                            key={i}
                            size={16}
                            color={i < review.rating ? "#fbbf24" : "#e2e8f0"}
                            fill={i < review.rating ? "#fbbf24" : "none"}
                          />
                        ))}
                        <span className={styles.ratingText}>{review.rating}/5</span>
                      </div>
                      {review.user?.email && (
                        <span className={styles.reviewUser}>
                          by {review.user.email.split('@')[0]}
                        </span>
                      )}
                      <span className={styles.reviewDate}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[`status${review.status}`]}`}>
                    {review.status}
                  </span>
                </div>
                
                {review.comment && (
                  <p className={styles.reviewComment}>{review.comment}</p>
                )}
                
                <div className={styles.reviewActions}>
                  {review.status === 'pending' && (
                    <>
                      <button
                        className={styles.approveButton}
                        onClick={() => handleStatusChange(review.id, 'approved')}
                      >
                        <IoCheckmarkCircle size={18} color="#22c55e" />
                        Approve
                      </button>
                      <button
                        className={styles.rejectButton}
                        onClick={() => handleStatusChange(review.id, 'rejected')}
                      >
                        <IoCloseCircle size={18} color="#ef4444" />
                        Reject
                      </button>
                    </>
                  )}
                  {review.status === 'rejected' && (
                    <button
                      className={styles.approveButton}
                      onClick={() => handleStatusChange(review.id, 'approved')}
                    >
                      <IoCheckmarkCircle size={18} color="#22c55e" />
                      Approve
                    </button>
                  )}
                  {review.status === 'approved' && (
                    <button
                      className={styles.rejectButton}
                      onClick={() => handleStatusChange(review.id, 'rejected')}
                    >
                      <IoCloseCircle size={18} color="#ef4444" />
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
