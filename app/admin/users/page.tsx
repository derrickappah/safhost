import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/middleware'
import { getUsers, getBannedUsers } from '@/lib/admin/users'
import UsersList from './UsersList'
import AdminPageHeader from '../AdminPageHeader'
import styles from './page.module.css'

// Revalidate every 60 seconds
export const revalidate = 60

export default async function AdminUsersPage() {
  // Check admin access
  const admin = await isAdmin()
  if (!admin) {
    redirect('/')
  }

  // Load users and banned users in parallel
  const [usersResult, bannedResult] = await Promise.all([
    getUsers().catch(() => ({ data: [], error: null })),
    getBannedUsers().catch(() => ({ data: new Set<string>(), error: null }))
  ])

  const users = usersResult.data || []
  const bannedUsers = bannedResult.data || new Set<string>()

  return (
    <div className={styles.container}>
      <AdminPageHeader title="User Management" />
      <div className={styles.content}>
        <UsersList 
          initialUsers={users} 
          initialBannedUsers={bannedUsers}
        />
      </div>
    </div>
  )
}
