'use client'

import { useState } from 'react'
import { IoCheckmarkCircle, IoCloseCircle, IoTime } from 'react-icons/io5'
import { updateReportStatus } from '@/lib/admin/reports'
import styles from './page.module.css'

interface Report {
  id: string
  report_type: string
  description: string | null
  status: string
  created_at: string
  admin_response: string | null
  hostel?: { id: string; name: string }
  review?: { id: string; comment: string }
}

interface ReportsListProps {
  initialReports: Report[]
  initialFilter: 'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'
}

export default function ReportsList({ initialReports, initialFilter }: ReportsListProps) {
  const [reports, setReports] = useState(initialReports)
  const [filter, setFilter] = useState(initialFilter)

  const handleStatusChange = async (reportId: string, newStatus: string, adminResponse?: string) => {
    const { error } = await updateReportStatus(reportId, newStatus, adminResponse)
    if (error) {
      alert('Failed to update report: ' + error)
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
    window.location.href = `/admin/reports?${params.toString()}`
  }

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.status === filter)

  return (
    <>
      <div className={styles.filters}>
        {(['all', 'pending', 'reviewed', 'resolved', 'dismissed'] as const).map((status) => (
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
        {filteredReports.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No reports found</p>
          </div>
        ) : (
          <div className={styles.reportsList}>
            {filteredReports.map((report) => (
              <div key={report.id} className={styles.reportCard}>
                <div className={styles.reportHeader}>
                  <div>
                    <h3 className={styles.reportTitle}>
                      {report.hostel ? `Hostel: ${report.hostel.name}` : `Review Report`}
                    </h3>
                    <div className={styles.reportMeta}>
                      <span className={styles.reportType}>{report.report_type}</span>
                      <span className={styles.reportDate}>
                        {new Date(report.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[`status${report.status}`]}`}>
                    {report.status}
                  </span>
                </div>
                
                {report.description && (
                  <p className={styles.reportDescription}>{report.description}</p>
                )}
                
                {report.admin_response && (
                  <div className={styles.adminResponse}>
                    <strong>Admin Response:</strong> {report.admin_response}
                  </div>
                )}
                
                <div className={styles.reportActions}>
                  {report.status === 'pending' && (
                    <>
                      <button
                        className={styles.resolveButton}
                        onClick={() => handleStatusChange(report.id, 'resolved')}
                      >
                        <IoCheckmarkCircle size={18} color="#22c55e" />
                        Resolve
                      </button>
                      <button
                        className={styles.dismissButton}
                        onClick={() => handleStatusChange(report.id, 'dismissed')}
                      >
                        <IoCloseCircle size={18} color="#ef4444" />
                        Dismiss
                      </button>
                    </>
                  )}
                  {report.status !== 'pending' && (
                    <button
                      className={styles.reviewButton}
                      onClick={() => handleStatusChange(report.id, 'reviewed')}
                    >
                      <IoTime size={18} color="#64748b" />
                      Mark as Reviewed
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
