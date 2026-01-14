'use client'

import { useState } from 'react'
import { IoTrashOutline, IoCashOutline } from 'react-icons/io5'
import { processRefund, manuallyRemoveSubscription } from '@/lib/admin/refunds'
import styles from './page.module.css'

interface Subscription {
  id: string
  user_id: string
  status: string
  plan_type: string
  expires_at: string | null
  created_at: string
  payments?: Array<{ id: string; amount: number; status: string }>
}

interface SubscriptionsListProps {
  initialSubscriptions: Subscription[]
}

export default function SubscriptionsList({ initialSubscriptions }: SubscriptionsListProps) {
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions)

  const handleRefund = async (subscriptionId: string) => {
    const reason = prompt('Enter refund reason (optional):')
    if (reason !== null) {
      const { error } = await processRefund(subscriptionId, reason)
      if (error) {
        alert('Refund failed: ' + error)
      } else {
        alert('Refund processed. Subscription cancelled and access removed.')
        // Reload subscriptions
        window.location.reload()
      }
    }
  }

  const handleRemove = async (subscriptionId: string) => {
    if (!confirm('Are you sure you want to remove this subscription?')) return
    
    const reason = prompt('Enter reason (optional):')
    const { error } = await manuallyRemoveSubscription(subscriptionId, reason || undefined)
    if (error) {
      alert('Failed to remove subscription: ' + error)
    } else {
      // Reload subscriptions
      window.location.reload()
    }
  }

  if (subscriptions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No subscriptions found</p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Expires</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => {
              const payment = sub.payments?.[0]
              const amount = payment ? Number(payment.amount) / 100 : 0
              
              return (
                <tr key={sub.id}>
                  <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    {sub.user_id.substring(0, 8)}...
                  </td>
                  <td>{sub.plan_type}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${styles[`status${sub.status}`]}`}>
                      {sub.status}
                    </span>
                  </td>
                  <td>
                    {sub.expires_at 
                      ? new Date(sub.expires_at).toLocaleDateString()
                      : 'N/A'
                    }
                  </td>
                  <td>GHS {amount.toFixed(2)}</td>
                  <td>
                    <div className={styles.actions}>
                      {payment?.status === 'success' && sub.status === 'active' && (
                        <button
                          className={styles.refundButton}
                          onClick={() => handleRefund(sub.id)}
                        >
                          <IoCashOutline size={16} />
                          Refund
                        </button>
                      )}
                      <button
                        className={styles.removeButton}
                        onClick={() => handleRemove(sub.id)}
                      >
                        <IoTrashOutline size={16} />
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileCardList}>
        {subscriptions.map((sub) => {
          const payment = sub.payments?.[0]
          const amount = payment ? Number(payment.amount) / 100 : 0
          
          return (
            <div key={sub.id} className={styles.mobileCard}>
              <div className={styles.mobileCardHeader}>
                <div>
                  <div className={styles.mobileCardTitle}>User: {sub.user_id.substring(0, 8)}...</div>
                  <div className={styles.mobileCardSubtitle}>Plan: {sub.plan_type}</div>
                </div>
                <span className={`${styles.statusBadge} ${styles[`status${sub.status}`]}`}>
                  {sub.status}
                </span>
              </div>
              <div className={styles.mobileCardContent}>
                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Expires:</span>
                  <span className={styles.mobileCardValue}>
                    {sub.expires_at 
                      ? new Date(sub.expires_at).toLocaleDateString()
                      : 'N/A'
                    }
                  </span>
                </div>
                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Amount:</span>
                  <span className={styles.mobileCardValueBold}>GHS {amount.toFixed(2)}</span>
                </div>
              </div>
              <div className={styles.mobileCardActions}>
                {payment?.status === 'success' && sub.status === 'active' && (
                  <button
                    className={styles.refundButton}
                    onClick={() => handleRefund(sub.id)}
                  >
                    <IoCashOutline size={16} />
                    Refund
                  </button>
                )}
                <button
                  className={styles.removeButton}
                  onClick={() => handleRemove(sub.id)}
                >
                  <IoTrashOutline size={16} />
                  Remove
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
