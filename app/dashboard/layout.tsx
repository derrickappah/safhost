'use client'

import styles from './layout.module.css'
import DashboardLayoutHeader from './DashboardLayoutHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={styles.container}>
      <DashboardLayoutHeader />
      <div className={styles.content}>{children}</div>
    </div>
  )
}
