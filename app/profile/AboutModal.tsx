'use client'

import { IoPerson, IoCloseCircle } from 'react-icons/io5'
import styles from './page.module.css'

interface AboutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>About</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <IoCloseCircle size={24} color="#64748b" />
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div className={styles.avatar} style={{ margin: '0 auto 16px', width: '64px', height: '64px' }}>
              <IoPerson size={32} color="#2563eb" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>
              Hostel Student Finder
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>Version 1.0.0</p>
          </div>
          <div style={{ marginTop: '24px' }}>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: '0 0 12px 0' }}>
              Find verified hostels near your school campus. Connect with hostel managers, save favorites, and make informed decisions about your accommodation.
            </p>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '16px 0 0 0' }}>
              © 2025 Hostel Student Finder. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
