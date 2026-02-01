import Link from 'next/link'
import { getSchools } from '@/lib/actions/schools'
import SchoolsList from './SchoolsList'
import styles from './page.module.css'

// Admin pages must be dynamic to ensure session isolation
export const dynamic = "force-dynamic"

export default async function AdminSchoolsPage() {
  const { data: schools } = await getSchools()

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Schools</h1>
        <Link href="/admin/schools/new" className={styles.addButton}>
          Add School
        </Link>
      </div>
      
      <SchoolsList schools={schools || []} />
    </div>
  )
}
