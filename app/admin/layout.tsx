import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/middleware'
import Link from 'next/link'
import styles from './layout.module.css'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/')
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h1 className={styles.logo}>Admin Panel</h1>
        </div>
        <nav className={styles.nav}>
          <Link href="/admin/dashboard" className={styles.navLink}>
            Dashboard
          </Link>
          <Link href="/admin/hostels" className={styles.navLink}>
            Hostels
          </Link>
          <Link href="/admin/schools" className={styles.navLink}>
            Schools
          </Link>
          <Link href="/admin/subscriptions" className={styles.navLink}>
            Subscriptions
          </Link>
          <Link href="/admin/payments" className={styles.navLink}>
            Payments
          </Link>
          <Link href="/admin/promo-codes" className={styles.navLink}>
            Promo Codes
          </Link>
          <Link href="/admin/reports" className={styles.navLink}>
            Reports
          </Link>
          <Link href="/admin/users" className={styles.navLink}>
            Users
          </Link>
          <Link href="/admin/audit" className={styles.navLink}>
            Audit Log
          </Link>
        </nav>
      </aside>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
