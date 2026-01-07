import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/middleware'
import { getReports, type ReportFilter } from '@/lib/admin/reports'
import ReportsList from './ReportsList'
import AdminPageHeader from '../AdminPageHeader'
import styles from './page.module.css'

// Revalidate every 60 seconds
export const revalidate = 60

interface PageProps {
  searchParams: Promise<{
    filter?: string
  }>
}

export default async function AdminReportsPage({ searchParams }: PageProps) {
  // Check admin access
  const admin = await isAdmin()
  if (!admin) {
    redirect('/')
  }

  const params = await searchParams
  const filter = (params.filter as ReportFilter) || 'all'

  // Load reports
  const reportsResult = await getReports(filter).catch(() => ({ data: [], error: null }))
  const reports = reportsResult.data || []

  return (
    <div className={styles.container}>
      <AdminPageHeader title="Reports" />
      <ReportsList initialReports={reports} initialFilter={filter} />
    </div>
  )
}
