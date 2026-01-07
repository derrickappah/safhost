import { notFound } from 'next/navigation'
import { getHostelById, getSimilarHostels } from '@/lib/actions/hostels'
import { getHostelReviews, getUserReview } from '@/lib/actions/reviews'
import { isFavorited } from '@/lib/actions/favorites'
import { checkSubscriptionAccess } from '@/lib/auth/subscription'
import { requireSubscription } from '@/lib/access/guard'
import { getUser } from '@/lib/auth'
import HostelDetailContent from './HostelDetailContent'
import styles from './page.module.css'

// Enable ISR with on-demand revalidation
export const revalidate = 300 // Revalidate every 5 minutes

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function HostelDetailPage({ params }: PageProps) {
  // Require active subscription
  await requireSubscription()
  
  const { id: hostelId } = await params

  // Load critical data in parallel
  const [
    hostelResult,
    accessResult,
    userResult
  ] = await Promise.all([
    getHostelById(hostelId).catch(() => ({ data: null, error: null })),
    checkSubscriptionAccess().catch(() => ({ hasAccess: false })),
    getUser().catch(() => null)
  ])

  if (!hostelResult.data) {
    notFound()
  }

  const hostel = hostelResult.data
  const hasAccess = accessResult.hasAccess
  const currentUser = userResult

  // Load secondary data in parallel (can be streamed)
  const [
    reviewsResult,
    userReviewResult,
    favoritedResult,
    similarResult
  ] = await Promise.all([
    getHostelReviews(hostelId).catch(() => ({ data: [], error: null })),
    currentUser ? getUserReview(hostelId).catch(() => ({ data: null, error: null })) : Promise.resolve({ data: null, error: null }),
    currentUser ? isFavorited(hostelId).catch(() => false) : Promise.resolve(false),
    getSimilarHostels(hostelId, 6).catch(() => ({ data: [], error: null }))
  ])

  const reviews = reviewsResult.data || []
  const userReview = userReviewResult.data
  const favorited = favoritedResult
  const similarHostels = similarResult.data || []

  return (
    <div className={styles.container}>
      <HostelDetailContent
        hostel={hostel}
        initialReviews={reviews}
        initialUserReview={userReview}
        initialIsFavorited={favorited}
        initialSimilarHostels={similarHostels}
        currentUser={currentUser}
        hasAccess={hasAccess}
      />
    </div>
  )
}
