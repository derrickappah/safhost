'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack } from 'react-icons/io5'
import { getCurrentUser } from '@/lib/auth/client'
import { createClient } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/auth/middleware'
import styles from './page.module.css'

export default function AdminPaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all')

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
      
      loadPayments()
    }
    checkAccess()
  }, [router, filter])

  const loadPayments = async () => {
    const supabase = createClient()
    let query = supabase
      .from('payments')
      .select('*, subscription:subscriptions(user_id, email, phone)')
      .order('created_at', { ascending: false })
      .limit(200)
    
    if (filter !== 'all') {
      query = query.eq('status', filter)
    }
    
    const { data, error } = await query
    
    if (data) {
      setPayments(data)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading payments...</div>
      </div>
    )
  }

  const totalRevenue = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0) / 100

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <h1 className={styles.headerTitle}>Payments</h1>
        <div style={{ width: '40px' }} />
      </header>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Revenue</div>
          <div className={styles.statValue}>GHS {totalRevenue.toFixed(2)}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Payments</div>
          <div className={styles.statValue}>{payments.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Successful</div>
          <div className={styles.statValue} style={{ color: '#22c55e' }}>
            {payments.filter(p => p.status === 'success').length}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Failed</div>
          <div className={styles.statValue} style={{ color: '#ef4444' }}>
            {payments.filter(p => p.status === 'failed').length}
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        {(['all', 'success', 'failed', 'pending'] as const).map((status) => (
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
        {payments.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No payments found</p>
          </div>
        ) : (
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Reference</th>
                  <th>Provider</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      {new Date(payment.created_at).toLocaleString()}
                    </td>
                    <td>
                      {payment.subscription?.email || payment.subscription?.phone || 'N/A'}
                    </td>
                    <td>
                      <strong>GHS {(Number(payment.amount) / 100).toFixed(2)}</strong>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`status${payment.status}`]}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td>
                      <code style={{ fontSize: '12px', color: '#64748b' }}>
                        {payment.provider_ref || '-'}
                      </code>
                    </td>
                    <td>
                      {payment.provider || 'paystack'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
