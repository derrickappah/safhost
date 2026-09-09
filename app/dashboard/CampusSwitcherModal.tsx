'use client'

import { useState, useMemo, useEffect } from 'react'
import { IoClose, IoSchoolOutline, IoCheckmarkCircle, IoSearchOutline } from 'react-icons/io5'
import type { School } from '@/lib/actions/schools'
import styles from './page.module.css'

interface CampusSwitcherModalProps {
  isOpen: boolean
  onClose: () => void
  schools: School[]
  selectedSchoolId: string | null
  onSelectSchool: (schoolId: string) => Promise<void> | void
}

export default function CampusSwitcherModal({
  isOpen,
  onClose,
  schools,
  selectedSchoolId,
  onSelectSchool,
}: CampusSwitcherModalProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // Filter schools by name or location
  const filteredSchools = useMemo(() => {
    if (!searchQuery.trim()) return schools
    const q = searchQuery.toLowerCase().trim()
    return schools.filter(
      (school) =>
        school.name.toLowerCase().includes(q) ||
        (school.location && school.location.toLowerCase().includes(q))
    )
  }, [schools, searchQuery])

  if (!isOpen) return null

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="campus-switcher-title"
    >
      <div
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 id="campus-switcher-title" className={styles.modalTitle}>
              Select Campus
            </h2>
            <p className={styles.modalSubtitle}>
              Choose your university to find nearby hostels
            </p>
          </div>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Quick Search */}
        <div className={styles.modalSearchWrapper}>
          <IoSearchOutline size={18} className={styles.modalSearchIcon} />
          <input
            type="text"
            className={styles.modalSearchInput}
            placeholder="Search campus or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Campus List */}
        <div className={styles.schoolList}>
          {filteredSchools.length === 0 ? (
            <div className={styles.emptySearch}>
              No campuses found matching &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            filteredSchools.map((school) => {
              const isSelected = selectedSchoolId === school.id
              return (
                <button
                  key={school.id}
                  type="button"
                  className={`${styles.schoolOption} ${
                    isSelected ? styles.schoolOptionSelected : ''
                  }`}
                  onClick={() => onSelectSchool(school.id)}
                  aria-selected={isSelected}
                >
                  <div className={styles.schoolOptionIcon}>
                    <IoSchoolOutline size={20} />
                  </div>
                  <div className={styles.schoolOptionInfo}>
                    <div className={styles.schoolOptionName}>{school.name}</div>
                    {school.location && (
                      <div className={styles.schoolOptionLocation}>
                        {school.location}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <IoCheckmarkCircle
                      size={20}
                      className={styles.schoolSelectedCheck}
                    />
                  )}
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
