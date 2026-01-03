'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoPerson, IoCardOutline, IoSchoolOutline, IoNotificationsOutline, IoHelpCircleOutline, IoInformationCircleOutline, IoCreateOutline, IoDiamond, IoChevronForward, IoLogOutOutline } from 'react-icons/io5'
import styles from './page.module.css'
import { getCurrentUser } from '@/lib/auth/client'
import { createClient } from '@/lib/supabase/client'
import { getActiveSubscription } from '@/lib/actions/subscriptions'
import { getFavorites } from '@/lib/actions/favorites'
import { updateProfile, getPaymentHistory, getProfile } from '@/lib/actions/profile'
import { getSchools } from '@/lib/actions/schools'
import { IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5'

export default function ProfilePage() {
  const router = useRouter()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [favoritesCount, setFavoritesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editing, setEditing] = useState(false)
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null)
  const [schools, setSchools] = useState<any[]>([])
  const [showSchoolModal, setShowSchoolModal] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [showAboutModal, setShowAboutModal] = useState(false)

  useEffect(() => {
    async function loadData() {
      const { data, error } = await getCurrentUser()
      if (error || !data?.user) {
        router.push(`/auth/login?redirect=${encodeURIComponent('/profile')}`)
        return
      }
      
      setUser(data.user)
      setCheckingAuth(false)
      
      // Load subscription
      const { data: subData } = await getActiveSubscription()
      if (subData) {
        setSubscription(subData)
      }
      
      // Load favorites count
      const { data: favoritesData } = await getFavorites()
      if (favoritesData) {
        setFavoritesCount(favoritesData.length)
      }
      
      // Load payment history
      const { data: paymentsData } = await getPaymentHistory()
      if (paymentsData) {
        setPaymentHistory(paymentsData)
      }
      
      // Load selected school
      const savedSchool = localStorage.getItem('selectedSchool')
      if (savedSchool) {
        setSelectedSchool(savedSchool)
      }
      
      // Load schools for selection
      const { data: schoolsData } = await getSchools()
      if (schoolsData) {
        setSchools(schoolsData)
      }
      
      setLoading(false)
    }
    loadData()
  }, [router])

  const handleSignOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const getUserName = () => {
    if (profile?.full_name) return profile.full_name
    if (user?.user_metadata?.name) return user.user_metadata.name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const getUserEmail = () => {
    return user?.email || 'No email'
  }

  const getUserPhone = () => {
    if (profile?.phone) return profile.phone
    return user?.user_metadata?.phone || 'No phone number'
  }

  const getSubscriptionDaysLeft = () => {
    if (!subscription?.expires_at) return null
    const expiresAt = new Date(subscription.expires_at)
    const now = new Date()
    const diffTime = expiresAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const getSubscriptionProgress = () => {
    if (!subscription?.expires_at) return 0
    const expiresAt = new Date(subscription.expires_at)
    const created = new Date(subscription.created_at)
    const now = new Date()
    const total = expiresAt.getTime() - created.getTime()
    const elapsed = now.getTime() - created.getTime()
    return Math.min(100, Math.max(0, (elapsed / total) * 100))
  }

  const handleMenuItemClick = (itemId: string) => {
    switch (itemId) {
      case 'subscription':
        router.push('/subscribe')
        break
      case 'school':
        setShowSchoolModal(true)
        break
      case 'notifications':
        router.push('/notifications')
        break
      case 'help':
        router.push('/help')
        break
      case 'about':
        setShowAboutModal(true)
        break
      default:
        break
    }
  }

  const menuItems = [
    {
      id: "subscription",
      icon: IoCardOutline,
      title: "Subscription",
      subtitle: subscription 
        ? `${subscription.status === 'active' ? 'Active' : subscription.status} • ${getSubscriptionDaysLeft() || 0} days left`
        : "No active subscription",
      color: subscription?.status === 'active' ? "#22c55e" : "#64748b",
    },
    {
      id: "school",
      icon: IoSchoolOutline,
      title: "My School",
      subtitle: selectedSchool 
        ? schools.find(s => s.id === selectedSchool)?.name || "Not selected"
        : "Not selected",
      color: "#2563eb",
    },
    {
      id: "notifications",
      icon: IoNotificationsOutline,
      title: "Notifications",
      subtitle: "Push notifications enabled",
      color: "#f59e0b",
    },
    {
      id: "help",
      icon: IoHelpCircleOutline,
      title: "Help & Support",
      subtitle: "FAQs, Contact us",
      color: "#8b5cf6",
    },
    {
      id: "about",
      icon: IoInformationCircleOutline,
      title: "About",
      subtitle: "Version 1.0.0",
      color: "#64748b",
    },
  ]

  if (checkingAuth || loading) {
    return (
      <div className={styles.container}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          fontSize: '16px',
          color: 'var(--color-text-secondary)'
        }}>
          Loading...
        </div>
      </div>
    )
  }

  const daysLeft = getSubscriptionDaysLeft()
  const progress = getSubscriptionProgress()

  return (
    <div className={styles.container}>
      <div className={styles.scrollContent}>
        {/* Header */}
        <header className={styles.header}>
          <h1 className={styles.headerTitle}>Profile</h1>
        </header>

        {/* User Card */}
        <div className={styles.userCard}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              <IoPerson size={32} color="#94a3b8" />
            </div>
            <span className={styles.statusDot} />
          </div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{getUserName()}</h2>
            <p className={styles.userEmail}>{getUserEmail()}</p>
            {user?.user_metadata?.phone && (
              <p className={styles.userEmail} style={{ fontSize: '12px', marginTop: '4px' }}>
                {getUserPhone()}
              </p>
            )}
          </div>
          <button 
            className={styles.editButton}
            onClick={() => {
              setEditName(getUserName())
              setEditEmail(getUserEmail())
              setShowEditModal(true)
            }}
          >
            <IoCreateOutline size={20} color="#2563eb" />
          </button>
        </div>

        {/* Subscription Banner */}
        {subscription && subscription.status === 'active' ? (
          <button 
            className={styles.subscriptionBanner}
            onClick={() => router.push('/subscribe')}
          >
            <div className={styles.bannerContent}>
              <div className={styles.bannerIcon}>
                <IoDiamond size={24} color="#fff" />
              </div>
              <div className={styles.bannerText}>
                <h3 className={styles.bannerTitle}>Premium Active</h3>
                <p className={styles.bannerSubtitle}>
                  {daysLeft !== null ? `${daysLeft} days remaining` : 'Active subscription'}
                </p>
              </div>
            </div>
            <div className={styles.bannerProgress}>
              <div 
                className={styles.bannerProgressFill} 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </button>
        ) : (
          <button 
            className={styles.subscriptionBanner}
            onClick={() => router.push('/subscribe')}
            style={{ backgroundColor: '#64748b15' }}
          >
            <div className={styles.bannerContent}>
              <div className={styles.bannerIcon} style={{ backgroundColor: '#64748b' }}>
                <IoDiamond size={24} color="#fff" />
              </div>
              <div className={styles.bannerText}>
                <h3 className={styles.bannerTitle}>No Active Subscription</h3>
                <p className={styles.bannerSubtitle}>Subscribe to unlock all features</p>
              </div>
            </div>
          </button>
        )}

        {/* Stats */}
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{favoritesCount}</span>
            <span className={styles.statLabel}>Saved</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>-</span>
            <span className={styles.statLabel}>Viewed</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statValue}>-</span>
            <span className={styles.statLabel}>Contacted</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className={styles.menuContainer}>
          {menuItems.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`${styles.menuItem} ${index === menuItems.length - 1 ? styles.menuItemLast : ''}`}
                onClick={() => handleMenuItemClick(item.id)}
              >
                <div className={styles.menuIcon} style={{ backgroundColor: `${item.color}15` }}>
                  <Icon size={22} color={item.color} />
                </div>
                <div className={styles.menuContent}>
                  <h3 className={styles.menuTitle}>{item.title}</h3>
                  <p className={styles.menuSubtitle}>{item.subtitle}</p>
                </div>
                <IoChevronForward size={20} color="#cbd5e1" />
              </button>
            )
          })}
        </div>

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Payment History</h2>
            <div className={styles.paymentList}>
              {paymentHistory.map((payment) => (
                <div key={payment.id} className={styles.paymentItem}>
                  <div className={styles.paymentInfo}>
                    <div className={styles.paymentDate}>
                      {new Date(payment.created_at).toLocaleDateString()}
                    </div>
                    <div className={styles.paymentAmount}>
                      GHS {(Number(payment.amount) / 100).toFixed(2)}
                    </div>
                  </div>
                  <span className={`${styles.paymentStatus} ${styles[`status${payment.status}`]}`}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Sign Out */}
        <button className={styles.signOutButton} onClick={handleSignOut}>
          <IoLogOutOutline size={20} color="#ef4444" />
          <span className={styles.signOutText}>Sign Out</span>
        </button>

        <div style={{ height: '100px' }} />
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Profile</h2>
              <button className={styles.modalClose} onClick={() => setShowEditModal(false)}>
                <IoCloseCircle size={24} color="#64748b" />
              </button>
            </div>
            <form
              className={styles.modalForm}
              onSubmit={async (e) => {
                e.preventDefault()
                setEditing(true)
                const { error } = await updateProfile(editName, editEmail, profile?.phone, selectedSchool)
                if (error) {
                  alert('Failed to update profile: ' + error)
                } else {
                  setShowEditModal(false)
                  // Reload user data
                  const { data } = await getCurrentUser()
                  if (data?.user) {
                    setUser(data.user)
                  }
                }
                setEditing(false)
              }}
            >
              <div className={styles.formGroup}>
                <label>Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowEditModal(false)}
                  disabled={editing}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveButton} disabled={editing}>
                  {editing ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* School Selection Modal */}
      {showSchoolModal && (
        <div className={styles.modalOverlay} onClick={() => setShowSchoolModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Select School</h2>
              <button className={styles.modalClose} onClick={() => setShowSchoolModal(false)}>
                <IoCloseCircle size={24} color="#64748b" />
              </button>
            </div>
            <div className={styles.schoolList}>
              {schools.map((school) => (
                <button
                  key={school.id}
                  className={`${styles.schoolOption} ${selectedSchool === school.id ? styles.schoolOptionSelected : ''}`}
                  onClick={async () => {
                    setSelectedSchool(school.id)
                    localStorage.setItem('selectedSchool', school.id)
                    // Update profile with selected school
                    await updateProfile(profile?.full_name, user?.email, profile?.phone, school.id)
                    // Reload profile
                    const { data: profileData } = await getProfile()
                    if (profileData) {
                      setProfile(profileData)
                    }
                    setShowSchoolModal(false)
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
      )}

      {/* About Modal */}
      {showAboutModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAboutModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>About</h2>
              <button className={styles.modalClose} onClick={() => setShowAboutModal(false)}>
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
                  Find verified hostels near your school campus. Connect with landlords, save favorites, and make informed decisions about your accommodation.
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '16px 0 0 0' }}>
                  © 2025 Hostel Student Finder. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
