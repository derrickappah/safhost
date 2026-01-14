'use client'

import styles from './page.module.css'

interface AuditLog {
  id: string
  created_at: string
  action_type: string
  resource_type: string
  resource_id: string | null
  details: Record<string, any>
  admin?: {
    email: string
  }
}

interface AuditLogsListProps {
  logs: AuditLog[]
}

export default function AuditLogsList({ logs }: AuditLogsListProps) {
  return (
    <>
      {/* Desktop Table View */}
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
                    <span style={{ color: '#94a3b8' }}>No details</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileCardList}>
        {logs.map((log) => (
          <div key={log.id} className={styles.mobileCard}>
            <div className={styles.mobileCardHeader}>
              <div>
                <div className={styles.mobileCardTitle}>
                  {log.action_type.replace(/_/g, ' ')}
                </div>
                <div className={styles.mobileCardSubtitle}>
                  {new Date(log.created_at).toLocaleString()}
                </div>
              </div>
            </div>
            <div className={styles.mobileCardContent}>
              <div className={styles.mobileCardRow}>
                <span className={styles.mobileCardLabel}>Admin:</span>
                <span className={styles.mobileCardValue}>
                  {log.admin?.email || 'Unknown'}
                </span>
              </div>
              <div className={styles.mobileCardRow}>
                <span className={styles.mobileCardLabel}>Resource:</span>
                <span className={styles.mobileCardValue}>
                  {log.resource_type}
                  {log.resource_id && (
                    <span className={styles.resourceId}>
                      {' '}({log.resource_id.substring(0, 8)}...)
                    </span>
                  )}
                </span>
              </div>
              {log.details && Object.keys(log.details).length > 0 && (
                <details className={styles.details}>
                  <summary className={styles.detailsSummary}>View Details</summary>
                  <pre className={styles.detailsContent}>
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
