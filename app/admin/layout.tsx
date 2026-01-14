import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/middleware'
import Link from 'next/link'
import Image from 'next/image'
import MobileNav from './MobileNav'
import MobileHeader from './MobileHeader'
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
      {/* Desktop Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Image 
            src="/20260101_2143_SafHostel Logo_simple_compose_01kdxr7e9gfrvrqba7hb1811ghjhvh.png" 
            alt="SafHostel Logo" 
            width={140}
            height={40}
            className={styles.logoImage}
          />
          <p className={styles.logoSubtext}>Admin Panel</p>
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
          <Link href="/admin/reviews" className={styles.navLink}>
            Reviews
          </Link>
          <Link href="/admin/users" className={styles.navLink}>
            Users
          </Link>
          <Link href="/admin/audit" className={styles.navLink}>
            Audit Log
          </Link>
          <Link href="/admin/logs" className={styles.navLink}>
            View & Contact Logs
          </Link>
          <Link href="/admin/settings" className={styles.navLink}>
            Settings
          </Link>
        </nav>
      </aside>
      
      {/* Mobile Header & Navigation */}
      <MobileHeader />
      
      <main className={styles.main}>
        {children}
      </main>
    </div>
  )
}
