'use client'

import { useState } from 'react'
import { IoCloseCircle } from 'react-icons/io5'
import { updateProfile, getProfile } from '@/lib/actions/profile'
import styles from './page.module.css'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  initialName: string
  initialEmail: string
  profile: any
  selectedSchool: string | null
  onUpdate: (updatedProfile?: any) => void
}

export default function EditProfileModal({
  isOpen,
  onClose,
  initialName,
  initialEmail,
  profile,
  selectedSchool,
  onUpdate
}: EditProfileModalProps) {
  const [editName, setEditName] = useState(initialName)
  const [editEmail, setEditEmail] = useState(initialEmail)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Edit Profile</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <IoCloseCircle size={24} color="#64748b" />
          </button>
        </div>
        <form
          className={styles.modalForm}
          onSubmit={async (e) => {
            e.preventDefault()
            setEditing(true)
            setError(null)
            try {
              const { error: updateError } = await updateProfile(editName, editEmail, profile?.phone, selectedSchool)
              if (updateError) {
                setError(updateError)
              } else {
                // Fetch updated profile to pass back
                const { data: updatedProfile } = await getProfile()
                onUpdate(updatedProfile || undefined)
                onClose()
              }
            } catch (err) {
              setError(err instanceof Error ? err.message : 'An unexpected error occurred')
            } finally {
              setEditing(false)
            }
          }}
        >
          {error && <div className={styles.errorBanner}>{error}</div>}

          <div className={styles.formGroup}>
            <label>Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Your name"
              disabled={editing}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={editing}
              required
            />
          </div>
          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={editing}
            >
              Cancel
            </button>
            <button type="submit" className={styles.saveButton} disabled={editing}>
              {editing ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
