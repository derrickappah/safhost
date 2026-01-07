'use client'

import { useState } from 'react'
import { IoBan, IoCheckmarkCircle } from 'react-icons/io5'
import { banUser, unbanUser } from '@/lib/admin/userActions'
import styles from './page.module.css'

interface User {
  id: string
  email: string
  created_at: string
  user_metadata?: {
    name?: string
  }
}

interface UsersListProps {
  initialUsers: User[]
  initialBannedUsers: Set<string>
}

export default function UsersList({ initialUsers, initialBannedUsers }: UsersListProps) {
  const [users] = useState(initialUsers)
  const [bannedUsers, setBannedUsers] = useState(initialBannedUsers)

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

  return (
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
                      onClick={() => handleBanUser(user.id)}
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
  )
}
