'use client'

import { IoCheckmarkCircle, IoCloseCircle, IoSchoolOutline } from 'react-icons/io5'
import { updateProfile, getProfile } from '@/lib/actions/profile'
import styles from './page.module.css'

interface SchoolSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  schools: any[]
  selectedSchool: string | null
  onSelect: (schoolId: string) => Promise<void>
}

export default function SchoolSelectionModal({
  isOpen,
  onClose,
  schools,
  selectedSchool,
  onSelect
}: SchoolSelectionModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Select School</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <IoCloseCircle size={24} color="#64748b" />
          </button>
        </div>
        <div className={styles.schoolList}>
          {schools.map((school) => (
            <button
              key={school.id}
              className={`${styles.schoolOption} ${selectedSchool === school.id ? styles.schoolOptionSelected : ''}`}
              onClick={async () => {
                await onSelect(school.id)
              }}
            >
              <IoSchoolOutline size={20} color={selectedSchool === school.id ? "#2563eb" : "#64748b"} />
              <div className={styles.schoolOptionInfo}>
                <div className={styles.schoolOptionName}>{school.name}</div>
                <div className={styles.schoolOptionLocation}>{school.location}</div>
              </div>
              {selectedSchool === school.id && (
                <IoCheckmarkCircle size={20} color="#2563eb" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
