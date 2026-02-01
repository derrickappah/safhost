import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/middleware'
import { getUsers, getBannedUsers, getUserRoles } from '@/lib/admin/users'
import UsersList from './UsersList'
import AdminPageHeader from '../AdminPageHeader'
import styles from './page.module.css'

// Admin pages must be dynamic to ensure session isolation
export const dynamic = "force-dynamic"

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

  // Get user roles for all users
  const userIds = users.map(u => u.id)
  const rolesResult = await getUserRoles(userIds).catch(() => ({ data: new Map<string, 'user' | 'admin'>(), error: null }))
  const userRoles = rolesResult.data || new Map<string, 'user' | 'admin'>()

  return (
    <div className={styles.container}>
      <AdminPageHeader title="User Management" />
      <div className={styles.content}>
        <UsersList 
          initialUsers={users} 
          initialBannedUsers={bannedUsers}
          initialUserRoles={userRoles}
        />
      </div>
    </div>
  )
}
