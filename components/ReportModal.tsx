'use client'

import { useState } from 'react'
import { IoClose, IoAlertCircle, IoShieldOutline, IoInformationCircleOutline, IoWarningOutline, IoEllipsisHorizontalCircleOutline } from 'react-icons/io5'
import { createReport } from '@/lib/actions/reports'
import styles from './ReportModal.module.css'

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  hostelId?: string
  reviewId?: string
  onReported?: () => void
}

export default function ReportModal({
  isOpen,
  onClose,
  hostelId,
  reviewId,
  onReported,
}: ReportModalProps) {
  const [reportType, setReportType] = useState<'inappropriate' | 'spam' | 'fake' | 'other'>('inappropriate')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: reportError } = await createReport({
      hostelId,
      reviewId,
      reportType,
      description: description || undefined,
    })

    if (reportError) {
      setError(reportError)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      setSuccess(false)
      onClose()
      if (onReported) {
        onReported()
      }
      // Reset form
      setReportType('inappropriate')
      setDescription('')
    }, 2000)
    setLoading(false)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <IoAlertCircle size={24} color="#ef4444" />
          </div>
          <h2 className={styles.title}>Report Content</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <IoClose size={24} color="#64748b" />
          </button>
        </div>

        {success ? (
          <div className={styles.successMessage}>
            <p>Thank you! Your report has been submitted.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.section}>
              <label className={styles.label}>Report Type</label>
              <div className={styles.options}>
                {[
                  { value: 'inappropriate', label: 'Inappropriate Content', icon: IoShieldOutline },
                  { value: 'spam', label: 'Spam', icon: IoInformationCircleOutline },
                  { value: 'fake', label: 'Fake Listing', icon: IoWarningOutline },
                  { value: 'other', label: 'Other', icon: IoEllipsisHorizontalCircleOutline },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`${styles.option} ${reportType === option.value ? styles.optionActive : ''}`}
                      onClick={() => setReportType(option.value as any)}
                    >
                      <Icon className={styles.optionIcon} size={20} />
                      <span className={styles.optionLabel}>{option.label}</span>
                      <div className={styles.radio} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.section}>
              <label className={styles.label}>Description (Optional)</label>
              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please provide more details..."
                rows={4}
              />
            </div>

            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
