'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5'
import { getCurrentUser } from '@/lib/auth/client'
import { isAdmin } from '@/lib/auth/middleware'
import { createSchool } from '@/lib/admin/schools'
import styles from './page.module.css'

export default function NewSchoolPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
  })

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
      
      setLoading(false)
    }
    checkAccess()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    // Validate required fields
    if (!formData.name || !formData.location) {
      setError('Please fill in all required fields')
      setSaving(false)
      return
    }

    const { data, error: createError } = await createSchool({
      name: formData.name,
      location: formData.location,
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
    })

    if (createError) {
      setError(createError)
      setSaving(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/schools')
      }, 1500)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <h1 className={styles.headerTitle}>Add New School</h1>
        <div style={{ width: '40px' }} />
      </header>

      {success && (
        <div className={styles.successMessage}>
          <IoCheckmarkCircle size={20} color="#22c55e" />
          <span>School created successfully! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>School Information</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              School Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter school name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Location <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter school location (e.g., Accra, Kumasi)"
              required
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Latitude</label>
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="0.00000000"
                step="0.00000001"
              />
              <p className={styles.helpText}>
                Optional: Geographic latitude coordinate
              </p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Longitude</label>
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="0.00000000"
                step="0.00000001"
              />
              <p className={styles.helpText}>
                Optional: Geographic longitude coordinate
              </p>
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelButton}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create School'}
          </button>
        </div>
      </form>
    </div>
  )
}
