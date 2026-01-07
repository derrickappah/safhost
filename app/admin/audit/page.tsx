import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/middleware'
import { getAuditLogs } from '@/lib/admin/audit'
import AuditLogsList from './AuditLogsList'
import AdminPageHeader from '../AdminPageHeader'
import styles from './page.module.css'

// Revalidate every 60 seconds
export const revalidate = 60

export default async function AdminAuditPage() {
  // Check admin access
  const admin = await isAdmin()
  if (!admin) {
    redirect('/')
  }

  // Load audit logs
  const logsResult = await getAuditLogs(200).catch(() => ({ data: [], error: null }))
  const logs = logsResult.data || []

  return (
    <div className={styles.container}>
      <AdminPageHeader title="Audit Log" />
      <div className={styles.content}>
        <AuditLogsList logs={logs} />
      </div>
    </div>
  )
}
