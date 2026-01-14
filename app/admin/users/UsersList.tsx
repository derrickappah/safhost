'use client'

import { useState } from 'react'
import { IoBan, IoCheckmarkCircle, IoShieldCheckmark, IoPerson } from 'react-icons/io5'
import { banUser, unbanUser } from '@/lib/admin/userActions'
import { updateUserRole } from '@/lib/admin/roles'
import styles from './page.module.css'

interface User {
  id: string
  email: string
  created_at: string
  user_metadata?: {
    name?: string
    role?: string
  }
}

interface UsersListProps {
  initialUsers: User[]
  initialBannedUsers: Set<string>
  initialUserRoles: Map<string, 'user' | 'admin'>
}

export default function UsersList({ initialUsers, initialBannedUsers, initialUserRoles }: UsersListProps) {
  const [users] = useState(initialUsers)
  const [bannedUsers, setBannedUsers] = useState(initialBannedUsers)
  const [userRoles, setUserRoles] = useState(initialUserRoles)
  const [updatingRoles, setUpdatingRoles] = useState<Set<string>>(new Set())

  const handleBanUser = async (userId: string) => {
    const reason = prompt('Enter ban reason (optional):')
    if (reason !== null) {
      const { error } = await banUser(userId, reason)
      if (error) {
        alert('Failed to ban user: ' + error)
      } else {
        setBannedUsers(prev => new Set(prev).add(userId))
      }
    }
  }

  const handleUnbanUser = async (userId: string) => {
    const { error } = await unbanUser(userId)
    if (error) {
      alert('Failed to unban user: ' + error)
    } else {
      setBannedUsers(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    if (!confirm(`Are you sure you want to ${newRole === 'admin' ? 'promote' : 'demote'} this user to ${newRole}?`)) {
      return
    }

    setUpdatingRoles(prev => new Set(prev).add(userId))
    
    try {
      const { error } = await updateUserRole(userId, newRole)
      if (error) {
        alert('Failed to update user role: ' + error)
      } else {
        setUserRoles(prev => {
          const next = new Map(prev)
          next.set(userId, newRole)
          return next
        })
      }
    } catch (error) {
      alert('Failed to update user role: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setUpdatingRoles(prev => {
        const next = new Set(prev)
        next.delete(userId)
        return next
      })
    }
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className={styles.table}>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Created</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isBanned = bannedUsers.has(user.id)
              const role = userRoles.get(user.id) || 'user'
              const isUpdating = updatingRoles.has(user.id)
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={role === 'admin' ? styles.adminBadge : styles.userBadge}>
                        {role === 'admin' ? (
                          <>
                            <IoShieldCheckmark size={14} />
                            Admin
                          </>
                        ) : (
                          <>
                            <IoPerson size={14} />
                            User
                          </>
                        )}
                      </span>
                      {!isUpdating && (
                        <button
                          className={styles.roleButton}
                          onClick={() => handleRoleChange(user.id, role === 'admin' ? 'user' : 'admin')}
                          title={role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                        >
                          {role === 'admin' ? 'Demote' : 'Promote'}
                        </button>
                      )}
                      {isUpdating && (
                        <span style={{ fontSize: '12px', color: '#64748b' }}>Updating...</span>
                      )}
                    </div>
                  </td>
                  <td>
                    {isBanned ? (
                      <span className={styles.bannedBadge}>Banned</span>
                    ) : (
                      <span className={styles.activeBadge}>Active</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                          onClick={() => handleBanUser(user.id)}
                        >
                          <IoBan size={18} color="#ef4444" />
                          Ban
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className={styles.mobileCardList}>
        {users.map((user) => {
          const isBanned = bannedUsers.has(user.id)
          const role = userRoles.get(user.id) || 'user'
          const isUpdating = updatingRoles.has(user.id)
          return (
            <div key={user.id} className={styles.mobileCard}>
              <div className={styles.mobileCardHeader}>
                <div>
                  <div className={styles.mobileCardTitle}>{user.email}</div>
                  {user.user_metadata?.name && (
                    <div className={styles.mobileCardSubtitle}>{user.user_metadata.name}</div>
                  )}
                </div>
                <div className={styles.mobileCardBadges}>
                  {isBanned ? (
                    <span className={styles.bannedBadge}>Banned</span>
                  ) : (
                    <span className={styles.activeBadge}>Active</span>
                  )}
                </div>
              </div>
              <div className={styles.mobileCardContent}>
                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Created:</span>
                  <span className={styles.mobileCardValue}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.mobileCardRow}>
                  <span className={styles.mobileCardLabel}>Role:</span>
                  <span className={role === 'admin' ? styles.adminBadge : styles.userBadge}>
                    {role === 'admin' ? (
                      <>
                        <IoShieldCheckmark size={14} />
                        Admin
                      </>
                    ) : (
                      <>
                        <IoPerson size={14} />
                        User
                      </>
                    )}
                  </span>
                </div>
              </div>
              <div className={styles.mobileCardActions}>
                {!isUpdating && (
                  <button
                    className={styles.roleButton}
                    onClick={() => handleRoleChange(user.id, role === 'admin' ? 'user' : 'admin')}
                  >
                    {role === 'admin' ? 'Demote' : 'Promote'}
                  </button>
                )}
                {isUpdating && (
                  <span className={styles.updatingText}>Updating...</span>
                )}
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
                    onClick={() => handleBanUser(user.id)}
                  >
                    <IoBan size={18} color="#ef4444" />
                    Ban
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
