'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoCloudUploadOutline, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5'
import styles from './page.module.css'
import { getCurrentUser } from '@/lib/auth/client'
import { isAdmin } from '@/lib/auth/middleware'
import { bulkUploadHostels } from '@/lib/admin/bulk-upload'

export default function BulkUploadPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: number; errors: string[] } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    setUploading(true)
    setResult(null)
    
    const { data, error } = await bulkUploadHostels(file)
    
    if (error) {
      setResult({ success: 0, errors: [error] })
    } else if (data) {
      setResult(data)
    }
    
    setUploading(false)
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          <IoArrowBack size={24} color="#1e293b" />
        </button>
        <h1 className={styles.headerTitle}>Bulk Upload Hostels</h1>
        <div style={{ width: '40px' }} />
      </header>

      <div className={styles.content}>
        <div className={styles.instructions}>
          <h2>Upload Instructions</h2>
          <ol>
            <li>Download the template CSV file (if available)</li>
            <li>Fill in hostel data: name, school_id, price_min, address, landlord_name, landlord_phone, etc.</li>
            <li>Upload the CSV file</li>
            <li>Review any duplicate warnings or errors</li>
          </ol>
          <p className={styles.note}>
            <strong>Note:</strong> The system will detect duplicates based on name and address. 
            You can choose to skip or update existing hostels.
          </p>
        </div>

        <div className={styles.uploadSection}>
          <div className={styles.uploadArea}>
            <input
              type="file"
              id="file-input"
              accept=".csv,.xlsx"
              onChange={handleFileChange}
              className={styles.fileInput}
            />
            <label htmlFor="file-input" className={styles.uploadLabel}>
              <IoCloudUploadOutline size={48} color="#2563eb" />
              <span className={styles.uploadText}>
                {file ? file.name : 'Choose CSV or Excel file'}
              </span>
              <span className={styles.uploadHint}>Click to select file</span>
            </label>
          </div>

          {file && (
            <button
              className={styles.uploadButton}
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Hostels'}
            </button>
          )}

          {result && (
            <div className={styles.result}>
              <div className={styles.resultHeader}>
                <IoCheckmarkCircle size={24} color="#22c55e" />
                <h3>Upload Complete</h3>
              </div>
              <div className={styles.resultStats}>
                <div className={styles.statItem}>
                  <span className={styles.statValue}>{result.success}</span>
                  <span className={styles.statLabel}>Hostels Added</span>
                </div>
                {result.errors.length > 0 && (
                  <div className={styles.statItem}>
                    <span className={styles.statValue} style={{ color: '#ef4444' }}>
                      {result.errors.length}
                    </span>
                    <span className={styles.statLabel}>Errors</span>
                  </div>
                )}
              </div>
              {result.errors.length > 0 && (
                <div className={styles.errors}>
                  <h4>Errors:</h4>
                  <ul>
                    {result.errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
