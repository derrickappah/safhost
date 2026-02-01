import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/middleware'
import { getPayments, type PaymentFilter } from '@/lib/admin/payments'
import PaymentsList from './PaymentsList'
import AdminPageHeader from '../AdminPageHeader'
import styles from './page.module.css'

// Admin pages must be dynamic to ensure session isolation
export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{
    filter?: string
  }>
}

export default async function AdminPaymentsPage({ searchParams }: PageProps) {
  // Check admin access
  const admin = await isAdmin()
  if (!admin) {
    redirect('/')
  }

  const params = await searchParams
  const filter = (params.filter as PaymentFilter) || 'all'

  // Load payments
  const paymentsResult = await getPayments(filter).catch(() => ({ data: [], error: null }))
  const payments = paymentsResult.data || []

  return (
    <div className={styles.container}>
      <AdminPageHeader title="Payments" />
      <div className={styles.content}>
        <PaymentsList initialPayments={payments} initialFilter={filter} />
      </div>
    </div>
  )
}
