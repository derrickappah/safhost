'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoBan, IoCheckmarkCircle } from 'react-icons/io5'
import styles from './page.module.css'
import { getCurrentUser } from '@/lib/auth/client'
import { createClient } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/auth/middleware'

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bannedUsers, setBannedUsers] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function checkAccess() {
      const { data: userData } = await getCurrentUser()
      if (!userData?.user) {
        router.push('/auth/login')
        return
      }
      
      const admin = await isAdmin()
      if (!admin) {
        router.push('/')
        return
      }
      
      loadUsers()
      loadBannedUsers()
    }
    checkAccess()
  }, [router])

  const loadUsers = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.auth.admin.listUsers()
    
    if (data) {
      setUsers(data.users)
    }
    setLoading(false)
  }

  const loadBannedUsers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('banned_users')
      .select('user_id')
      .eq('is_active', true)
    
    if (data) {
      setBannedUsers(new Set(data.map(b => b.user_id)))
    }
  }

  const handleBanUser = async (userId: string, reason: string) => {
    if (!confirm(`Are you sure you want to ban this user? Reason: ${reason || 'No reason provided'}`)) return
    
    const supabase = createClient()
    const { data: userData } = await getCurrentUser()
    
    // Check if already banned
    const { data: existing } = await supabase
      .from('banned_users')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()
    
    if (existing) {
      alert('User is already banned')
      return
    }
    
    const { error } = await supabase
      .from('banned_users')
      .insert({
        user_id: userId,
        reason: reason || null,
        banned_by: userData?.user?.id,
      })
    
    if (!error) {
      setBannedUsers(prev => new Set(prev).add(userId))
      await logAuditAction('ban_user', 'user', userId, { reason })
    }
  }

  const handleUnbanUser = async (userId: string) => {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('banned_users')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true)
    
    if (!error) {
      setBannedUsers(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
      await logAuditAction('unban_user', 'user', userId, {})
    }
  }

  const logAuditAction = async (action: string, resourceType: string, resourceId: string, details: any) => {
    const supabase = createClient()
    const { data: userData } = await getCurrentUser()
    
    await supabase
      .from('audit_logs')
      .insert({
        admin_id: userData?.user?.id,
        action_type: action,
        resource_type: resourceType,
        resource_id: resourceId,
        details,
      })
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading users...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <h1 className={styles.headerTitle}>User Management</h1>
        <div style={{ width: '40px' }} />
      </header>

      <div className={styles.content}>
        <div className={styles.table}>
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isBanned = bannedUsers.has(user.id)
                return (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.email}</div>
                        {user.user_metadata?.name && (
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {user.user_metadata.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      {isBanned ? (
                        <span className={styles.bannedBadge}>Banned</span>
                      ) : (
                        <span className={styles.activeBadge}>Active</span>
                      )}
                    </td>
                    <td>
                      {isBanned ? (
                        <button
                          className={styles.unbanButton}
                          onClick={() => handleUnbanUser(user.id)}
                        >
                          <IoCheckmarkCircle size={18} color="#22c55e" />
                          Unban
                        </button>
                      ) : (
                        <button
                          className={styles.banButton}
                          onClick={() => {
                            const reason = prompt('Enter ban reason (optional):')
                            if (reason !== null) {
                              handleBanUser(user.id, reason)
                            }
                          }}
                        >
                          <IoBan size={18} color="#ef4444" />
                          Ban
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
