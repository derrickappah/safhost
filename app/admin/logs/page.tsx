'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoSearch, IoFilter, IoEyeOutline, IoCallOutline } from 'react-icons/io5'
import styles from './page.module.css'
import { getCurrentUser } from '@/lib/auth/client'
import { getViewLogs, getContactLogs, LogFilters } from '@/lib/admin/logs'
import Loader from '@/components/Loader'

export default function AdminLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [type, setType] = useState<'view' | 'contact' | 'all'>('all')
  const [userId, setUserId] = useState('')
  const [hostelId, setHostelId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [search, setSearch] = useState('')

  const loadLogs = async () => {
    setLoading(true)
    const filters: LogFilters = {
      type: type === 'all' ? undefined : type,
      userId: userId || undefined,
      hostelId: hostelId || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      search: search || undefined,
      limit: 50,
      offset: (page - 1) * 50
    }
    
    let result
    if (type === 'view' || (type === 'all' && logs.length === 0)) {
      result = await getViewLogs(filters)
    } else if (type === 'contact') {
      result = await getContactLogs(filters)
    } else {
      // For 'all', we'll show views by default, but could combine both
      result = await getViewLogs(filters)
    }
    
    if (result.error) {
      console.error('Error loading logs:', result.error)
    } else {
      if (result.data) {
        setLogs(result.data)
        setTotal(result.total || 0)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    async function checkAccess() {
      const { data: userData } = await getCurrentUser()
      if (!userData?.user) {
        router.push('/auth/login')
        return
      }
      loadLogs()
    }
    checkAccess()
  }, [router])

  useEffect(() => {
    setPage(1)
    loadLogs()
  }, [type, userId, hostelId, startDate, endDate, search])

  useEffect(() => {
    loadLogs()
  }, [page])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <h1 className={styles.headerTitle}>View & Contact Logs</h1>
        <button 
          className={styles.filterButton}
          onClick={() => setShowFilters(!showFilters)}
        >
          <IoFilter size={20} color={showFilters ? "#2563eb" : "#64748b"} />
        </button>
      </header>

      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <IoSearch size={18} color="#94a3b8" className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by user email or hostel name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Log Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className={styles.filterSelect}
            >
              <option value="all">All</option>
              <option value="view">Views</option>
              <option value="contact">Contacts</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>User ID</label>
            <input
              type="text"
              placeholder="Filter by user ID..."
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Hostel ID</label>
            <input
              type="text"
              placeholder="Filter by hostel ID..."
              value={hostelId}
              onChange={(e) => setHostelId(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={styles.filterInput}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={styles.filterInput}
            />
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className={styles.loadingState} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
          <Loader />
        </div>
      ) : logs.length === 0 ? (
        <div className={styles.emptyState}>
          <h2 className={styles.emptyTitle}>No logs found</h2>
          <p className={styles.emptySubtitle}>
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <>
          <div className={styles.resultsHeader}>
            <span className={styles.resultsCount}>{total} log{total !== 1 ? 's' : ''} found</span>
          </div>
          <>
            {/* Desktop Table View */}
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Date & Time</th>
                    <th>User</th>
                    <th>Hostel</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        {type === 'contact' || log.created_at ? (
                          <span className={styles.typeBadge} style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                            <IoCallOutline size={14} />
                            Contact
                          </span>
                        ) : (
                          <span className={styles.typeBadge} style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                            <IoEyeOutline size={14} />
                            View
                          </span>
                        )}
                      </td>
                      <td>
                        {new Date(log.viewed_at || log.created_at).toLocaleString()}
                      </td>
                      <td>
                        {log.user?.email || log.user_id || 'Anonymous'}
                        {log.subscription_id && (
                          <span className={styles.subscriptionTag}>Subscription</span>
                        )}
                      </td>
                      <td>
                        {log.hostel?.name || 'Unknown'}
                        {log.hostel_id && (
                          <span className={styles.hostelId}>
                            {log.hostel_id.substring(0, 8)}...
                          </span>
                        )}
                      </td>
                      <td>
                        <div className={styles.detailsCell}>
                          {log.user_id && (
                            <div className={styles.detailItem}>
                              <strong>User ID:</strong> {log.user_id.substring(0, 8)}...
                            </div>
                          )}
                          {log.subscription_id && (
                            <div className={styles.detailItem}>
                              <strong>Subscription ID:</strong> {log.subscription_id.substring(0, 8)}...
                            </div>
                          )}
                          {log.hostel_id && (
                            <div className={styles.detailItem}>
                              <strong>Hostel ID:</strong> {log.hostel_id.substring(0, 8)}...
                            </div>
                          )}
                        </div>
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
                      {type === 'contact' || log.created_at ? (
                        <span className={styles.typeBadge} style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                          <IoCallOutline size={14} />
                          Contact
                        </span>
                      ) : (
                        <span className={styles.typeBadge} style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                          <IoEyeOutline size={14} />
                          View
                        </span>
                      )}
                    </div>
                    <div className={styles.mobileCardDate}>
                      {new Date(log.viewed_at || log.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className={styles.mobileCardContent}>
                    <div className={styles.mobileCardRow}>
                      <span className={styles.mobileCardLabel}>User:</span>
                      <span className={styles.mobileCardValue}>
                        {log.user?.email || log.user_id || 'Anonymous'}
                        {log.subscription_id && (
                          <span className={styles.subscriptionTag}>Subscription</span>
                        )}
                      </span>
                    </div>
                    <div className={styles.mobileCardRow}>
                      <span className={styles.mobileCardLabel}>Hostel:</span>
                      <span className={styles.mobileCardValue}>
                        {log.hostel?.name || 'Unknown'}
                        {log.hostel_id && (
                          <span className={styles.hostelId}>
                            {' '}({log.hostel_id.substring(0, 8)}...)
                          </span>
                        )}
                      </span>
                    </div>
                    <div className={styles.detailsCell}>
                      {log.user_id && (
                        <div className={styles.detailItem}>
                          <strong>User ID:</strong> {log.user_id.substring(0, 8)}...
                        </div>
                      )}
                      {log.subscription_id && (
                        <div className={styles.detailItem}>
                          <strong>Subscription ID:</strong> {log.subscription_id.substring(0, 8)}...
                        </div>
                      )}
                      {log.hostel_id && (
                        <div className={styles.detailItem}>
                          <strong>Hostel ID:</strong> {log.hostel_id.substring(0, 8)}...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>

          {/* Pagination */}
          {total > 50 && (
            <div className={styles.pagination}>
              <button
                className={styles.paginationButton}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </button>
              <span className={styles.paginationInfo}>
                Page {page} of {Math.ceil(total / 50)}
              </span>
              <button
                className={styles.paginationButton}
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / 50)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
