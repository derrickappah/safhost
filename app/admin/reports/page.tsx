'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoCheckmarkCircle, IoCloseCircle, IoTime } from 'react-icons/io5'
import styles from './page.module.css'
import { getCurrentUser } from '@/lib/auth/client'
import { createClient } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/auth/middleware'

export default function AdminReportsPage() {
  const router = useRouter()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'>('all')

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
      
      loadReports()
    }
    checkAccess()
  }, [router, filter])

  const loadReports = async () => {
    const supabase = createClient()
    let query = supabase
      .from('reports')
      .select(`
        *,
        hostel:hostels(id, name),
        review:reviews(id, comment),
        user:users(email)
      `)
      .order('created_at', { ascending: false })
    
    if (filter !== 'all') {
      query = query.eq('status', filter)
    }
    
    const { data, error } = await query
    
    if (data) {
      setReports(data)
    }
    setLoading(false)
  }

  const handleStatusChange = async (reportId: string, newStatus: string, adminResponse?: string) => {
    const supabase = createClient()
    const { data: userData } = await getCurrentUser()
    
    const updateData: any = {
      status: newStatus,
      admin_id: userData?.user?.id,
    }
    
    if (adminResponse) {
      updateData.admin_response = adminResponse
    }
    
    const { error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', reportId)
    
    if (!error) {
      await loadReports()
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading reports...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <h1 className={styles.headerTitle}>Reports</h1>
        <div style={{ width: '40px' }} />
      </header>

      <div className={styles.filters}>
        {(['all', 'pending', 'reviewed', 'resolved', 'dismissed'] as const).map((status) => (
          <button
            key={status}
            className={`${styles.filterButton} ${filter === status ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        {reports.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No reports found</p>
          </div>
        ) : (
          <div className={styles.reportsList}>
            {reports.map((report) => (
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
    </div>
  )
}
