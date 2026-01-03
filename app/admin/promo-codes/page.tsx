'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoArrowBack, IoAdd, IoTrashOutline, IoCreateOutline, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5'
import styles from './page.module.css'
import { getCurrentUser } from '@/lib/auth/client'
import { createClient } from '@/lib/supabase/client'
import { isAdmin } from '@/lib/auth/middleware'

export default function AdminPromoCodesPage() {
  const router = useRouter()
  const [promoCodes, setPromoCodes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCode, setEditingCode] = useState<any>(null)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    maxUses: '',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: '',
    isActive: true,
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
      
      loadPromoCodes()
    }
    checkAccess()
  }, [router])

  const loadPromoCodes = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setPromoCodes(data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    
    const promoData: any = {
      code: formData.code.toUpperCase(),
      description: formData.description || null,
      discount_type: formData.discountType,
      discount_value: Number(formData.discountValue),
      max_uses: formData.maxUses ? Number(formData.maxUses) : null,
      valid_from: new Date(formData.validFrom).toISOString(),
      valid_until: formData.validUntil ? new Date(formData.validUntil).toISOString() : null,
      is_active: formData.isActive,
    }
    
    if (editingCode) {
      const { error } = await supabase
        .from('promo_codes')
        .update(promoData)
        .eq('id', editingCode.id)
      
      if (!error) {
        await loadPromoCodes()
        setShowForm(false)
        setEditingCode(null)
        resetForm()
      }
    } else {
      const { error } = await supabase
        .from('promo_codes')
        .insert(promoData)
      
      if (!error) {
        await loadPromoCodes()
        setShowForm(false)
        resetForm()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo code?')) return
    
    const supabase = createClient()
    const { error } = await supabase
      .from('promo_codes')
      .delete()
      .eq('id', id)
    
    if (!error) {
      await loadPromoCodes()
    }
  }

  const handleEdit = (code: any) => {
    setEditingCode(code)
    setFormData({
      code: code.code,
      description: code.description || '',
      discountType: code.discount_type,
      discountValue: String(code.discount_value),
      maxUses: code.max_uses ? String(code.max_uses) : '',
      validFrom: new Date(code.valid_from).toISOString().split('T')[0],
      validUntil: code.valid_until ? new Date(code.valid_until).toISOString().split('T')[0] : '',
      isActive: code.is_active,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      maxUses: '',
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: '',
      isActive: true,
    })
    setEditingCode(null)
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
        <h1 className={styles.headerTitle}>Promo Codes</h1>
        <button className={styles.addButton} onClick={() => {
          resetForm()
          setShowForm(true)
        }}>
          <IoAdd size={24} color="#2563eb" />
        </button>
      </header>

      {showForm && (
        <div className={styles.formModal}>
          <div className={styles.formContent}>
            <div className={styles.formHeader}>
              <h2>{editingCode ? 'Edit' : 'Create'} Promo Code</h2>
              <button className={styles.closeButton} onClick={() => {
                setShowForm(false)
                resetForm()
              }}>
                <IoCloseCircle size={24} color="#64748b" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  required
                  placeholder="SUMMER2024"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Discount Type *</label>
                <select
                  value={formData.discountType}
                  onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (GHS)</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Discount Value *</label>
                <input
                  type="number"
                  value={formData.discountValue}
                  onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  required
                  min="0"
                  step={formData.discountType === 'percentage' ? '1' : '0.01'}
                  placeholder={formData.discountType === 'percentage' ? '10' : '5.00'}
                />
                <span className={styles.hint}>
                  {formData.discountType === 'percentage' ? 'Enter percentage (e.g., 10 for 10%)' : 'Enter amount in GHS'}
                </span>
              </div>
              <div className={styles.formGroup}>
                <label>Max Uses</label>
                <input
                  type="number"
                  value={formData.maxUses}
                  onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                  min="1"
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Valid From *</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Valid Until</label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    placeholder="Leave empty for no expiry"
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  {editingCode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.content}>
        {promoCodes.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No promo codes yet</p>
            <button className={styles.addButton} onClick={() => {
              resetForm()
              setShowForm(true)
            }}>
              <IoAdd size={20} color="#fff" />
              <span>Create First Promo Code</span>
            </button>
          </div>
        ) : (
          <div className={styles.table}>
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Value</th>
                  <th>Used</th>
                  <th>Status</th>
                  <th>Valid Until</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {promoCodes.map((code) => (
                  <tr key={code.id}>
                    <td>
                      <div className={styles.codeCell}>
                        <strong>{code.code}</strong>
                        {code.description && (
                          <span className={styles.description}>{code.description}</span>
                        )}
                      </div>
                    </td>
                    <td>{code.discount_type === 'percentage' ? 'Percentage' : 'Fixed'}</td>
                    <td>
                      {code.discount_type === 'percentage' 
                        ? `${code.discount_value}%`
                        : `GHS ${code.discount_value}`
                      }
                    </td>
                    <td>
                      {code.used_count} / {code.max_uses || '∞'}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${code.is_active ? styles.statusActive : styles.statusInactive}`}>
                        {code.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      {code.valid_until 
                        ? new Date(code.valid_until).toLocaleDateString()
                        : 'No expiry'
                      }
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.editButton}
                          onClick={() => handleEdit(code)}
                        >
                          <IoCreateOutline size={18} color="#2563eb" />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => handleDelete(code.id)}
                        >
                          <IoTrashOutline size={18} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
