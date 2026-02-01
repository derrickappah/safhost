import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import styles from './page.module.css'

// Advertisement page must be dynamic to ensure authentication checks are performed per-request
export const dynamic = 'force-dynamic'

export default async function AdvertisementPage() {
  // Check authentication
  const user = await getUser()
  if (!user) {
    redirect('/auth/login?redirect=/advertisement')
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📢</div>
          <h2 className={styles.emptyTitle}>Advertisements</h2>
          <p className={styles.emptyText}>
            Check back soon for featured advertisements and special offers.
          </p>
        </div>
      </div>
    </div>
  )
}
