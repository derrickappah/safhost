import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/middleware'
import { getAdminReviews, type ReviewFilter } from '@/lib/admin/reviews'
import ReviewsList from './ReviewsList'
import AdminPageHeader from '../AdminPageHeader'
import styles from './page.module.css'

// Admin pages must be dynamic to ensure session isolation
export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    filter?: string
  }>
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  // Check admin access
  const admin = await isAdmin()
  if (!admin) {
    redirect('/')
  }

  const params = await searchParams
  const filter = (params.filter as ReviewFilter) || 'pending'

  // Load reviews
  const reviewsResult = await getAdminReviews(filter).catch(() => ({ data: [], error: null }))
  const reviews = reviewsResult.data || []

  return (
    <div className={styles.container}>
      <AdminPageHeader title="Review Moderation" />
      <ReviewsList initialReviews={reviews} initialFilter={filter} />
    </div>
  )
}
