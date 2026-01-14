import Link from 'next/link'
import { getAllHostels } from '@/lib/admin/hostels'
import HostelsList from './HostelsList'
import styles from './page.module.css'

// Revalidate every 60 seconds
export const revalidate = 60

export default async function AdminHostelsPage() {
  const { data: hostels } = await getAllHostels(100)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Hostels</h1>
        <div className={styles.actions}>
          <Link href="/admin/hostels/bulk-upload" className={styles.bulkUploadButton}>
            Bulk Upload
          </Link>
          <Link href="/admin/hostels/new" className={styles.addButton}>
            Add Hostel
          </Link>
        </div>
      </div>
      
      <HostelsList hostels={hostels || []} />
    </div>
  )
}
