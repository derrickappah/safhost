'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { IoArrowBack, IoCheckmarkCircle, IoTrashOutline } from 'react-icons/io5'
import { getCurrentUser } from '@/lib/auth/client'
import { isAdmin } from '@/lib/auth/middleware'
import { getSchoolById } from '@/lib/actions/schools'
import { updateSchool, deleteSchool } from '@/lib/admin/schools'
import styles from '../new/page.module.css'

export default function EditSchoolPage() {
  const router = useRouter()
  const params = useParams()
  const schoolId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
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
    async function loadData() {
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
      
      // Load school data
      const { data: schoolData, error: schoolError } = await getSchoolById(schoolId)
      if (schoolError || !schoolData) {
        setError(schoolError || 'School not found')
        setLoading(false)
        return
      }

      // Populate form with existing data
      setFormData({
        name: schoolData.name || '',
        location: schoolData.location || '',
        latitude: schoolData.latitude ? String(schoolData.latitude) : '',
        longitude: schoolData.longitude ? String(schoolData.longitude) : '',
      })
      
      setLoading(false)
    }
    loadData()
  }, [schoolId, router])

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

    const { data, error: updateError } = await updateSchool(schoolId, {
      name: formData.name,
      location: formData.location,
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
    })

    if (updateError) {
      setError(updateError)
      setSaving(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/schools')
      }, 1500)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this school? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    setError('')

    const { error: deleteError } = await deleteSchool(schoolId)

    if (deleteError) {
      setError(deleteError)
      setDeleting(false)
    } else {
      router.push('/admin/schools')
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
        <h1 className={styles.headerTitle}>Edit School</h1>
        <button
          className={styles.deleteButton}
          onClick={handleDelete}
          disabled={deleting}
          title="Delete school"
        >
          <IoTrashOutline size={24} color={deleting ? "#94a3b8" : "#ef4444"} />
        </button>
      </header>

      {success && (
        <div className={styles.successMessage}>
          <IoCheckmarkCircle size={20} color="#22c55e" />
          <span>School updated successfully! Redirecting...</span>
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
            disabled={saving || deleting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={saving || deleting}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
