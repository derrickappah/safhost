'use client'

import Link from 'next/link'
import styles from './page.module.css'

interface Hostel {
  id: string
  name: string
  price_min: number
  rating: number
  is_active: boolean
}

interface HostelsListProps {
  hostels: Hostel[]
}

export default function HostelsList({ hostels }: HostelsListProps) {
  if (hostels.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>No hostels found</p>
        <Link href="/admin/hostels/new" className={styles.addButton}>
          Add First Hostel
        </Link>
      </div>
    )
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHeader}>
            <tr>
              <th className={styles.tableHeaderCell}>Name</th>
              <th className={styles.tableHeaderCell}>Price</th>
              <th className={styles.tableHeaderCell}>Rating</th>
              <th className={styles.tableHeaderCell}>Status</th>
              <th className={styles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hostels.map((hostel) => (
              <tr key={hostel.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{hostel.name}</td>
                <td className={styles.tableCell}>GHS {hostel.price_min}</td>
                <td className={styles.tableCell}>{Number(hostel.rating).toFixed(1)}</td>
                <td className={styles.tableCell}>
                  <span className={`${styles.statusBadge} ${hostel.is_active ? styles.statusActive : styles.statusInactive}`}>
                    {hostel.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className={styles.tableCell}>
                  <Link href={`/admin/hostels/${hostel.id}`} className={styles.editLink}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileCardList}>
        {hostels.map((hostel) => (
          <div key={hostel.id} className={styles.mobileCard}>
            <div className={styles.mobileCardHeader}>
              <h3 className={styles.mobileCardTitle}>{hostel.name}</h3>
              <span className={`${styles.statusBadge} ${hostel.is_active ? styles.statusActive : styles.statusInactive}`}>
                {hostel.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className={styles.mobileCardContent}>
              <div className={styles.mobileCardRow}>
                <span className={styles.mobileCardLabel}>Price:</span>
                <span className={styles.mobileCardValue}>GHS {hostel.price_min}</span>
              </div>
              <div className={styles.mobileCardRow}>
                <span className={styles.mobileCardLabel}>Rating:</span>
                <span className={styles.mobileCardValue}>{Number(hostel.rating).toFixed(1)}</span>
              </div>
            </div>
            <div className={styles.mobileCardActions}>
              <Link href={`/admin/hostels/${hostel.id}`} className={styles.editLink}>
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
