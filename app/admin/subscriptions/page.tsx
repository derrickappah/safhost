import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/middleware'
import { getSubscriptions } from '@/lib/admin/subscriptions'
import SubscriptionsList from './SubscriptionsList'
import AdminPageHeader from '../AdminPageHeader'
import styles from './page.module.css'

// Revalidate every 60 seconds
export const revalidate = 60

export default async function AdminSubscriptionsPage() {
  // Check admin access
  const admin = await isAdmin()
  if (!admin) {
    redirect('/')
  }

  // Load subscriptions
  const subscriptionsResult = await getSubscriptions().catch(() => ({ data: [], error: null }))
  const subscriptions = subscriptionsResult.data || []

  return (
    <div className={styles.container}>
      <AdminPageHeader title="Subscriptions" />
      <div className={styles.content}>
        <SubscriptionsList initialSubscriptions={subscriptions} />
      </div>
    </div>
  )
}
