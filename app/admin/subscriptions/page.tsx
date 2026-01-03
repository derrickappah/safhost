'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoAdd, IoTrashOutline, IoCashOutline } from 'react-icons/io5'
import { getCurrentUser } from '@/lib/auth/client'
import { createClient } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/auth/middleware'
import { processRefund, manuallyRemoveSubscription } from '@/lib/admin/refunds'
import styles from './page.module.css'

export default function AdminSubscriptionsPage() {
  const router = useRouter()
  const [subscriptions, setSubscriptions] = useState<any[]>([])
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
      
      loadSubscriptions()
    }
    checkAccess()
  }, [router])

  const loadSubscriptions = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*, payments(id, amount, status)')
      .order('created_at', { ascending: false })
      .limit(100)
    
    if (data) {
      setSubscriptions(data)
    }
    setLoading(false)
  }

  const handleRefund = async (subscriptionId: string) => {
    const reason = prompt('Enter refund reason (optional):')
    if (reason !== null) {
      const { error } = await processRefund(subscriptionId, reason)
      if (error) {
        alert('Refund failed: ' + error)
      } else {
        alert('Refund processed. Subscription cancelled and access removed.')
        await loadSubscriptions()
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
      await loadSubscriptions()
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading subscriptions...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <h1 className={styles.headerTitle}>Subscriptions</h1>
        <div style={{ width: '40px' }} />
      </header>

      <div className={styles.content}>
        {subscriptions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No subscriptions found</p>
          </div>
        ) : (
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>Email/Phone</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Expires</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const hasPayment = (sub.payments as any[])?.some((p: any) => p.status === 'success')
                  return (
                    <tr key={sub.id}>
                      <td>
                        {sub.email || sub.phone || 'N/A'}
                      </td>
                      <td>
                        {sub.plan_type}
                      </td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles[`status${sub.status}`]}`}>
                          {sub.status}
                        </span>
                      </td>
                      <td>
                        {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          {hasPayment && sub.status === 'active' && (
                            <button
                              className={styles.refundButton}
                              onClick={() => handleRefund(sub.id)}
                              title="Refund and cancel"
                            >
                              <IoCashOutline size={18} color="#ef4444" />
                            </button>
                          )}
                          <button
                            className={styles.removeButton}
                            onClick={() => handleRemove(sub.id)}
                            title="Remove subscription"
                          >
                            <IoTrashOutline size={18} color="#64748b" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
