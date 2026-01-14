import Link from 'next/link'
import { getSchools } from '@/lib/actions/schools'
import SchoolsList from './SchoolsList'
import styles from './page.module.css'

// Revalidate every 60 seconds
export const revalidate = 60

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
