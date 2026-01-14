'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5'
import { getCurrentUser } from '@/lib/auth/client'
import { isAdmin } from '@/lib/auth/middleware'
import { getSchools } from '@/lib/actions/schools'
import { createHostel } from '@/lib/admin/hostels'
import { updateSchool } from '@/lib/admin/schools'
import styles from './page.module.css'
import Loader from '@/components/Loader'

const commonAmenities = [
  'Wi-Fi',
  'Water',
  'Security',
  'AC',
  'Kitchen',
  'Gym',
  'Parking',
  'Laundry',
  'Study Room',
  'Common Area'
]

export default function NewHostelPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [schools, setSchools] = useState<any[]>([])

  // Form state
  const [formData, setFormData] = useState({
    school_id: '',
    name: '',
    description: '',
    price_min: '',
    price_max: '',
    address: '',
    hostel_manager_name: '',
    hostel_manager_phone: '',
    latitude: '',
    longitude: '',
    distance: '',
    gender_restriction: '',
    is_available: true,
    featured: false,
    amenities: [] as string[],
    categories: [] as string[],
  })

  const [roomTypes, setRoomTypes] = useState<Array<{
    type: string
    price: string
    available: string
  }>>([{ type: '', price: '', available: '' }])

  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [schoolLogo, setSchoolLogo] = useState('')

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
      
      // Load schools
      const { data: schoolsData } = await getSchools()
      if (schoolsData) {
        setSchools(schoolsData)
      }
      
      setLoading(false)
    }
    checkAccess()
  }, [router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
      
      // Update local school logo if school changes
      if (name === 'school_id') {
        const selectedSchool = schools.find(s => s.id === value)
        setSchoolLogo(selectedSchool?.logo_url || '')
      }
    }
  }

  const handleSchoolLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !formData.school_id) return

    setUploadingLogo(true)
    setError('')

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('folder', 'schools')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      setSchoolLogo(result.url)
      
      // Immediately update school in DB
      await updateSchool(formData.school_id, { logo_url: result.url })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload school logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleAmenityToggle = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const addRoomType = () => {
    setRoomTypes([...roomTypes, { type: '', price: '', available: '' }])
  }

  // Remove empty room types before validation
  const getValidRoomTypes = () => {
    return roomTypes
      .filter(rt => {
        const hasType = rt.type && rt.type.trim().length > 0
        const hasPrice = rt.price && !isNaN(Number(rt.price)) && Number(rt.price) > 0
        const hasAvailable = rt.available && !isNaN(Number(rt.available)) && Number(rt.available) >= 0
        return hasType && hasPrice && hasAvailable
      })
      .map(rt => ({
        type: rt.type.trim(),
        price: Number(rt.price),
        available: Number(rt.available)
      }))
  }

  const removeRoomType = (index: number) => {
    setRoomTypes(roomTypes.filter((_, i) => i !== index))
  }

  const updateRoomType = (index: number, field: string, value: string) => {
    const updated = [...roomTypes]
    updated[index] = { ...updated[index], [field]: value }
    setRoomTypes(updated)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError('')

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'hostels')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Upload failed')
        }

        const result = await response.json()
        return result.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...uploadedUrls])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images')
    } finally {
      setUploading(false)
      // Reset input
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    // Validate required fields
    if (!formData.school_id || !formData.name || !formData.price_min || !formData.address || !formData.hostel_manager_name || !formData.hostel_manager_phone) {
      setError('Please fill in all required fields')
      setSaving(false)
      return
    }

    // Validate room types - filter out empty entries
    const validRoomTypes = getValidRoomTypes()

    console.log('Original room types from form:', roomTypes)
    console.log('Valid room types after filtering:', validRoomTypes)
    console.log('Submitting hostel with room types:', validRoomTypes)
    
    const { data, error: createError } = await createHostel({
      school_id: formData.school_id,
      name: formData.name,
      description: formData.description || undefined,
      price_min: Number(formData.price_min),
      price_max: formData.price_max ? Number(formData.price_max) : undefined,
      address: formData.address,
      hostel_manager_name: formData.hostel_manager_name,
      hostel_manager_phone: formData.hostel_manager_phone,
      latitude: formData.latitude ? Number(formData.latitude) : undefined,
      longitude: formData.longitude ? Number(formData.longitude) : undefined,
      distance: formData.distance ? Number(formData.distance) : undefined,
      gender_restriction: (formData.gender_restriction && ['male', 'female', 'mixed'].includes(formData.gender_restriction)) 
        ? (formData.gender_restriction as 'male' | 'female' | 'mixed')
        : undefined,
      is_available: formData.is_available,
      featured: formData.featured,
      amenities: formData.amenities,
      categories: formData.categories,
      images: images.length > 0 ? images : undefined,
      room_types: validRoomTypes,
    })

    if (createError) {
      console.error('Error creating hostel:', createError)
      setError(createError)
      setSaving(false)
    } else {
      console.log('Hostel created successfully:', data)
      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/hostels')
      }, 1500)
    }
  }

  if (loading) {
    return (
      <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Loader />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <h1 className={styles.headerTitle}>Add New Hostel</h1>
        <div style={{ width: '40px' }} />
      </header>

      {success && (
        <div className={styles.successMessage}>
          <IoCheckmarkCircle size={20} color="#22c55e" />
          <span>Hostel created successfully! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Images</h2>
          
          <div className={styles.imageUploadArea}>
            <input
              type="file"
              id="image-upload"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              className={styles.imageInput}
              disabled={uploading}
            />
            <label htmlFor="image-upload" className={styles.imageUploadLabel}>
              {uploading ? 'Uploading...' : 'Choose Images'}
            </label>
            <p className={styles.imageHint}>You can upload multiple images (JPEG, PNG, WebP, max 5MB each)</p>
          </div>

          {images.length > 0 && (
            <div className={styles.imageGrid}>
              {images.map((url, index) => (
                <div key={index} className={styles.imagePreview}>
                  <img src={url} alt={`Hostel image ${index + 1}`} />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className={styles.removeImageButton}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              School <span className={styles.required}>*</span>
            </label>
            <select
              name="school_id"
              value={formData.school_id}
              onChange={handleInputChange}
              className={styles.input}
              required
            >
              <option value="">Select a school</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name} - {school.location}
                </option>
              ))}
            </select>
          </div>

          {formData.school_id && (
            <div className={styles.formGroup} style={{ border: '1px dashed #e2e8f0', padding: '12px', borderRadius: '8px', marginTop: '8px' }}>
              <label className={styles.label} style={{ fontSize: '12px', color: '#64748b' }}>School Logo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                {schoolLogo ? (
                  <img 
                    src={schoolLogo} 
                    alt="School logo" 
                    style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e2e8f0' }} 
                  />
                ) : (
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>No Logo</span>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <input
                    type="file"
                    id="school-logo-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleSchoolLogoUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingLogo}
                  />
                  <label 
                    htmlFor="school-logo-upload" 
                    style={{ 
                      display: 'inline-block',
                      padding: '6px 12px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#1e293b'
                    }}
                  >
                    {uploadingLogo ? 'Uploading...' : schoolLogo ? 'Change School Logo' : 'Upload School Logo'}
                  </label>
                  <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Updating this logo will affect all hostels for this school</p>
                </div>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Hostel Name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter hostel name"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={styles.textarea}
              placeholder="Enter hostel description"
              rows={4}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Minimum Price (GHS) <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="price_min"
                value={formData.price_min}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Maximum Price (GHS)</label>
              <input
                type="number"
                name="price_max"
                value={formData.price_max}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Location</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Address <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter full address"
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
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Distance (km)</label>
              <input
                type="number"
                name="distance"
                value={formData.distance}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="0.0"
                step="0.1"
                min="0"
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Hostel Manager Information</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Hostel Manager Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="hostel_manager_name"
                value={formData.hostel_manager_name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter hostel manager name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Hostel Manager Phone <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                name="hostel_manager_phone"
                value={formData.hostel_manager_phone}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Room Types</h2>
          
          {roomTypes.map((roomType, index) => (
            <div key={index} className={styles.roomTypeRow}>
              <input
                type="text"
                placeholder="Room type (e.g., Single Room)"
                value={roomType.type}
                onChange={(e) => updateRoomType(index, 'type', e.target.value)}
                className={styles.input}
              />
              <input
                type="number"
                placeholder="Price (GHS)"
                value={roomType.price}
                onChange={(e) => updateRoomType(index, 'price', e.target.value)}
                className={styles.input}
                step="0.01"
                min="0"
              />
              <input
                type="number"
                placeholder="Available"
                value={roomType.available}
                onChange={(e) => updateRoomType(index, 'available', e.target.value)}
                className={styles.input}
                min="0"
              />
              {roomTypes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRoomType(index)}
                  className={styles.removeButton}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={addRoomType}
            className={styles.addButton}
          >
            + Add Room Type
          </button>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Additional Information</h2>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>Gender Restriction</label>
            <select
              name="gender_restriction"
              value={formData.gender_restriction}
              onChange={handleInputChange}
              className={styles.input}
            >
              <option value="">No restriction</option>
              <option value="male">Male only</option>
              <option value="female">Female only</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Amenities</label>
            <div className={styles.amenitiesGrid}>
              {commonAmenities.map(amenity => (
                <label key={amenity} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleInputChange}
              />
              <span>Available</span>
            </label>

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
              />
              <span>Featured</span>
            </label>
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
            {saving ? 'Creating...' : 'Create Hostel'}
          </button>
        </div>
      </form>
    </div>
  )
}
