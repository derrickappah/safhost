'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { IoArrowBack, IoCheckmarkCircle, IoTrashOutline } from 'react-icons/io5'
import { getCurrentUser } from '@/lib/auth/client'
import { isAdmin } from '@/lib/auth/middleware'
import { getSchools } from '@/lib/actions/schools'
import { getHostelById } from '@/lib/actions/hostels'
import { updateHostel, deleteHostel } from '@/lib/admin/hostels'
import styles from '../new/page.module.css'

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

export default function EditHostelPage() {
  const router = useRouter()
  const params = useParams()
  const hostelId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
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
    landlord_name: '',
    landlord_phone: '',
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
      
      // Load schools
      const { data: schoolsData } = await getSchools()
      if (schoolsData) {
        setSchools(schoolsData)
      }
      
      // Load hostel data
      const { data: hostelData, error: hostelError } = await getHostelById(hostelId)
      if (hostelError || !hostelData) {
        setError(hostelError || 'Hostel not found')
        setLoading(false)
        return
      }

      // Populate form with existing data
      setFormData({
        school_id: hostelData.school_id || '',
        name: hostelData.name || '',
        description: hostelData.description || '',
        price_min: String(hostelData.price_min || ''),
        price_max: hostelData.price_max ? String(hostelData.price_max) : '',
        address: hostelData.address || '',
        landlord_name: hostelData.landlord_name || '',
        landlord_phone: hostelData.landlord_phone || '',
        latitude: hostelData.latitude ? String(hostelData.latitude) : '',
        longitude: hostelData.longitude ? String(hostelData.longitude) : '',
        distance: hostelData.distance ? String(hostelData.distance) : '',
        gender_restriction: hostelData.gender_restriction || '',
        is_available: hostelData.is_available !== undefined ? hostelData.is_available : true,
        featured: hostelData.featured || false,
        amenities: Array.isArray(hostelData.amenities) ? hostelData.amenities : [],
        categories: Array.isArray(hostelData.categories) ? hostelData.categories : [],
      })

      // Populate images
      if (Array.isArray(hostelData.images) && hostelData.images.length > 0) {
        setImages(hostelData.images)
      }

      // Populate room types
      if (Array.isArray(hostelData.room_types) && hostelData.room_types.length > 0) {
        setRoomTypes(
          hostelData.room_types.map((rt: any) => ({
            type: rt.type || '',
            price: String(rt.price || ''),
            available: String(rt.available || '')
          }))
        )
      }
      
      setLoading(false)
    }
    loadData()
  }, [hostelId, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
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
    if (!formData.school_id || !formData.name || !formData.price_min || !formData.address || !formData.landlord_name || !formData.landlord_phone) {
      setError('Please fill in all required fields')
      setSaving(false)
      return
    }

    // Validate room types - filter out empty entries
    const validRoomTypes = getValidRoomTypes()

    console.log('Original room types from form:', roomTypes)
    console.log('Valid room types after filtering:', validRoomTypes)

    const { data, error: updateError } = await updateHostel(hostelId, {
      school_id: formData.school_id,
      name: formData.name,
      description: formData.description || undefined,
      price_min: Number(formData.price_min),
      price_max: formData.price_max ? Number(formData.price_max) : undefined,
      address: formData.address,
      landlord_name: formData.landlord_name,
      landlord_phone: formData.landlord_phone,
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

    if (updateError) {
      setError(updateError)
      setSaving(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/admin/hostels')
      }, 1500)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this hostel? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    setError('')

    const { error: deleteError } = await deleteHostel(hostelId)

    if (deleteError) {
      setError(deleteError)
      setDeleting(false)
    } else {
      router.push('/admin/hostels')
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
        <h1 className={styles.headerTitle}>Edit Hostel</h1>
        <div style={{ width: '40px' }} />
      </header>

      {success && (
        <div className={styles.successMessage}>
          <IoCheckmarkCircle size={20} color="#22c55e" />
          <span>Hostel updated successfully! Redirecting...</span>
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
          <h2 className={styles.sectionTitle}>Landlord Information</h2>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Landlord Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="landlord_name"
                value={formData.landlord_name}
                onChange={handleInputChange}
                className={styles.input}
                placeholder="Enter landlord name"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Landlord Phone <span className={styles.required}>*</span>
              </label>
              <input
                type="tel"
                name="landlord_phone"
                value={formData.landlord_phone}
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
            onClick={handleDelete}
            className={styles.removeButton}
            disabled={deleting || saving}
            style={{ marginRight: 'auto' }}
          >
            <IoTrashOutline size={18} style={{ marginRight: '8px', display: 'inline' }} />
            {deleting ? 'Deleting...' : 'Delete Hostel'}
          </button>
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
