'use client'

import { useState } from 'react'
import styles from './page.module.css'

interface Payment {
  id: string
  amount: number
  status: string
  created_at: string
  provider_ref: string | null
  subscription?: {
    user_id: string
    email: string
    phone: string
  }
}

interface PaymentsListProps {
  initialPayments: Payment[]
  initialFilter: 'all' | 'success' | 'failed' | 'pending'
}

export default function PaymentsList({ initialPayments, initialFilter }: PaymentsListProps) {
  const [payments] = useState(initialPayments)
  const [filter, setFilter] = useState(initialFilter)

  const totalRevenue = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0) / 100

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter)
    // Reload page with new filter
    const params = new URLSearchParams()
    if (newFilter !== 'all') {
      params.set('filter', newFilter)
    }
    window.location.href = `/admin/payments?${params.toString()}`
  }

  const filteredPayments = filter === 'all' 
    ? payments 
    : payments.filter(p => p.status === filter)

  return (
    <>
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
        {(['all', 'success', 'failed', 'pending'] as const).map((f) => (
          <button
            key={f}
            className={`${styles.filterButton} ${filter === f ? styles.filterButtonActive : ''}`}
            onClick={() => handleFilterChange(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Reference</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment) => (
              <tr key={payment.id}>
                <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                <td>GHS {(Number(payment.amount) / 100).toFixed(2)}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: payment.status === 'success' ? '#dcfce7' : '#fee2e2',
                    color: payment.status === 'success' ? '#166534' : '#991b1b',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {payment.status}
                  </span>
                </td>
                <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  {payment.provider_ref || '-'}
                </td>
                <td style={{ fontSize: '12px' }}>
                  {payment.subscription?.email || payment.subscription?.user_id?.substring(0, 8) || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
