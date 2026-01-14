'use client'

import Link from 'next/link'
import styles from './page.module.css'

interface School {
  id: string
  name: string
  location: string
}

interface SchoolsListProps {
  schools: School[]
}

export default function SchoolsList({ schools }: SchoolsListProps) {
  if (schools.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateText}>No schools found</p>
        <Link href="/admin/schools/new" className={styles.addButton}>
          Add First School
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
              <th className={styles.tableHeaderCell}>Location</th>
              <th className={styles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.id} className={styles.tableRow}>
                <td className={styles.tableCell}>{school.name}</td>
                <td className={styles.tableCellMuted}>{school.location}</td>
                <td className={styles.tableCell}>
                  <Link href={`/admin/schools/${school.id}`} className={styles.editLink}>
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
        {schools.map((school) => (
          <div key={school.id} className={styles.mobileCard}>
            <div className={styles.mobileCardHeader}>
              <h3 className={styles.mobileCardTitle}>{school.name}</h3>
              <div className={styles.mobileCardLocation}>{school.location}</div>
            </div>
            <div className={styles.mobileCardActions}>
              <Link href={`/admin/schools/${school.id}`} className={styles.editLink}>
                Edit
              </Link>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
