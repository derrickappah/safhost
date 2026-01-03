'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack } from 'react-icons/io5'
import styles from './page.module.css'
import { getCurrentUser } from '@/lib/auth/client'
import { getAuditLogs } from '@/lib/admin/audit'
import { isAdmin } from '@/lib/auth/middleware'

export default function AdminAuditPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAccess() {
      const { data: userData } = await getCurrentUser()
      if (!userData?.user) {
        router.push('/auth/login')
        return
      }
      
      const admin = await isAdmin()
      if (!admin) {
        router.push('/')
        return
      }
      
      loadLogs()
    }
    checkAccess()
  }, [router])

  const loadLogs = async () => {
    const { data, error } = await getAuditLogs(200)
    if (data) {
      setLogs(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading audit logs...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <h1 className={styles.headerTitle}>Audit Log</h1>
        <div style={{ width: '40px' }} />
      </header>

      <div className={styles.content}>
        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td>
                    {log.admin?.email || 'Unknown'}
                  </td>
                  <td>
                    <span className={styles.actionBadge}>
                      {log.action_type.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td>
                    {log.resource_type}
                    {log.resource_id && (
                      <span className={styles.resourceId}>
                        {log.resource_id.substring(0, 8)}...
                      </span>
                    )}
                  </td>
                  <td>
                    {log.details && Object.keys(log.details).length > 0 ? (
                      <details className={styles.details}>
                        <summary>View Details</summary>
                        <pre className={styles.detailsContent}>
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
