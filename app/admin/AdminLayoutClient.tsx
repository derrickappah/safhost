'use client'

import { usePathname } from 'next/navigation'
import MobileHeader from './MobileHeader'
import styles from './layout.module.css'

interface AdminLayoutClientProps {
  children: React.ReactNode
}

export default function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const pathname = usePathname()
  
  // Check if current path is a sub-page (e.g. /admin/hostels/new, /admin/hostels/123)
  const pathSegments = pathname.split('/').filter(Boolean)
  const isSubpage = pathSegments.length > 2

  return (
    <>
      {!isSubpage && <MobileHeader />}
      <main className={`${styles.main} ${isSubpage ? styles.mainSubpage : ''}`}>
        {children}
      </main>
    </>
  )
}
