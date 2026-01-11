'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoPerson, IoCardOutline, IoSchoolOutline, IoNotificationsOutline, IoHelpCircleOutline, IoInformationCircleOutline, IoCreateOutline, IoDiamond, IoChevronForward, IoLogOutOutline, IoCheckmarkCircle, IoCloseCircle, IoHeart, IoEye, IoCall } from 'react-icons/io5'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, getProfile } from '@/lib/actions/profile'
import { getCurrentUser } from '@/lib/auth/client'
import EditProfileModal from './EditProfileModal'
import SchoolSelectionModal from './SchoolSelectionModal'
import AboutModal from './AboutModal'
import styles from './page.module.css'

interface ProfilePageClientProps {
  user: any
  subscription: any
  favoritesCount: number
  viewedCount: number
  contactedCount: number
  paymentHistory: any[]
  schools: any[]
  profile: any
  selectedSchool: string | null
}

export default function ProfilePageClient({
  user,
  subscription,
  favoritesCount,
  viewedCount,
  contactedCount,
  paymentHistory,
  schools,
  profile: initialProfile,
  selectedSchool: initialSelectedSchool
}: ProfilePageClientProps) {
  const router = useRouter()
  const [profile, setProfile] = useState(initialProfile)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(initialSelectedSchool)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSchoolModal, setShowSchoolModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editing, setEditing] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Load selected school from localStorage on mount
  useEffect(() => {
    const savedSchool = localStorage.getItem('selectedSchool')
    if (savedSchool) {
      setSelectedSchool(savedSchool)
    }
  }, [])

  const handleSignOut = async (e?: React.MouseEvent) => {
    e?.preventDefault()
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      alert('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('File size exceeds 5MB limit')
      return
    }

    setUploadingAvatar(true)

    try {
      // Upload file to API
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'avatars')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || 'Failed to upload avatar')
      }

      // Update profile with new avatar URL
      const { error } = await updateProfile(
        profile?.full_name,
        user?.email,
        profile?.phone,
        profile?.school_id,
        data.url
      )

      if (error) {
        throw new Error(error)
      }

      // Refresh profile data
      const { data: profileData } = await getProfile()
      if (profileData) {
        setProfile(profileData)
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      alert(error instanceof Error ? error.message : 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
      // Reset input so same file can be selected again
      e.target.value = ''
    }
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

  const daysLeft = getSubscriptionDaysLeft()
  const progress = getSubscriptionProgress()

  return (
    <div className={styles.container}>
      <div className={styles.scrollContent}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.avatarWrapper}>
              <label htmlFor="avatar-upload" className={styles.avatarLabel}>
                <div className={styles.avatar}>
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt="Profile" 
                      className={styles.avatarImage}
                    />
                  ) : (
                    <IoPerson size={36} color="#94a3b8" />
                  )}
                  {uploadingAvatar && (
                    <div className={styles.avatarLoading}>
                      <div className={styles.avatarSpinner}></div>
                    </div>
                  )}
                </div>
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className={styles.avatarInput}
                disabled={uploadingAvatar}
              />
              <button 
                className={styles.editAvatarButton}
                onClick={() => {
                  document.getElementById('avatar-upload')?.click()
                }}
                aria-label="Change profile picture"
                disabled={uploadingAvatar}
              >
                <IoCreateOutline size={14} color="#fff" />
              </button>
            </div>
            <h1 className={styles.heroName}>{getUserName()}</h1>
            <p className={styles.heroEmail}>{getUserEmail()}</p>
            {user?.user_metadata?.phone && (
              <p className={styles.heroPhone}>{getUserPhone()}</p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <button 
            className={styles.statCard}
            onClick={() => router.push('/favorites')}
          >
            <div className={styles.statIcon} style={{ backgroundColor: '#fef2f2' }}>
              <IoHeart size={20} color="#ef4444" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{favoritesCount}</span>
              <span className={styles.statLabel}>Saved</span>
            </div>
          </button>
          <button 
            className={styles.statCard}
            onClick={() => router.push('/viewed')}
          >
            <div className={styles.statIcon} style={{ backgroundColor: '#eff6ff' }}>
              <IoEye size={20} color="#2563eb" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{viewedCount}</span>
              <span className={styles.statLabel}>Viewed</span>
            </div>
          </button>
          <button 
            className={styles.statCard}
            onClick={() => router.push('/contacted')}
          >
            <div className={styles.statIcon} style={{ backgroundColor: '#f0fdf4' }}>
              <IoCall size={20} color="#22c55e" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>{contactedCount}</span>
              <span className={styles.statLabel}>Contacted</span>
            </div>
          </button>
        </div>

        {/* Subscription Card */}
        <div className={styles.subscriptionCard}>
          {subscription && subscription.status === 'active' ? (
            <>
              <div className={styles.subscriptionHeader}>
                <div className={styles.subscriptionIcon}>
                  <IoDiamond size={24} color="#fff" />
                </div>
                <div className={styles.subscriptionInfo}>
                  <h3 className={styles.subscriptionTitle}>
                    {subscription.plan_type === 'semester' ? 'Premium Active' : 'Standard Active'}
                  </h3>
                  <p className={styles.subscriptionSubtitle}>
                    {daysLeft !== null ? `${daysLeft} days remaining` : 'Active subscription'}
                  </p>
                </div>
              </div>
              <div className={styles.subscriptionProgress}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
              <button 
                className={styles.subscriptionButton}
                onClick={() => router.push('/subscribe')}
              >
                Manage Subscription
              </button>
            </>
          ) : (
            <>
              <div className={styles.subscriptionHeader}>
                <div className={styles.subscriptionIconInactive}>
                  <IoDiamond size={24} color="#64748b" />
                </div>
                <div className={styles.subscriptionInfo}>
                  <h3 className={styles.subscriptionTitle}>No Active Subscription</h3>
                  <p className={styles.subscriptionSubtitle}>Subscribe to unlock all features</p>
                </div>
              </div>
              <button 
                className={styles.subscriptionButtonPrimary}
                onClick={() => router.push('/subscribe')}
              >
                Subscribe Now
              </button>
            </>
          )}
        </div>

        {/* Settings Sections */}
        <div className={styles.settingsSection}>
          <h2 className={styles.sectionHeader}>Account</h2>
          <div className={styles.settingsList}>
            {menuItems.slice(0, 2).map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  className={styles.settingsItem}
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  <div className={styles.settingsIcon} style={{ backgroundColor: `${item.color}15` }}>
                    <Icon size={20} color={item.color} />
                  </div>
                  <div className={styles.settingsContent}>
                    <span className={styles.settingsTitle}>{item.title}</span>
                    <span className={styles.settingsSubtitle}>{item.subtitle}</span>
                  </div>
                  <IoChevronForward size={18} color="#cbd5e1" />
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.settingsSection}>
          <h2 className={styles.sectionHeader}>Preferences</h2>
          <div className={styles.settingsList}>
            {menuItems.slice(2, 3).map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  className={styles.settingsItem}
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  <div className={styles.settingsIcon} style={{ backgroundColor: `${item.color}15` }}>
                    <Icon size={20} color={item.color} />
                  </div>
                  <div className={styles.settingsContent}>
                    <span className={styles.settingsTitle}>{item.title}</span>
                    <span className={styles.settingsSubtitle}>{item.subtitle}</span>
                  </div>
                  <IoChevronForward size={18} color="#cbd5e1" />
                </button>
              )
            })}
          </div>
        </div>

        <div className={styles.settingsSection}>
          <h2 className={styles.sectionHeader}>Support</h2>
          <div className={styles.settingsList}>
            {menuItems.slice(3).map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  className={styles.settingsItem}
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  <div className={styles.settingsIcon} style={{ backgroundColor: `${item.color}15` }}>
                    <Icon size={20} color={item.color} />
                  </div>
                  <div className={styles.settingsContent}>
                    <span className={styles.settingsTitle}>{item.title}</span>
                    <span className={styles.settingsSubtitle}>{item.subtitle}</span>
                  </div>
                  <IoChevronForward size={18} color="#cbd5e1" />
                </button>
              )
            })}
          </div>
        </div>

        {/* Payment History */}
        {paymentHistory.length > 0 && (
          <div className={styles.settingsSection}>
            <h2 className={styles.sectionHeader}>Payment History</h2>
            <div className={styles.paymentList}>
              {paymentHistory.map((payment) => (
                <div key={payment.id} className={styles.paymentItem}>
                  <div className={styles.paymentInfo}>
                    <span className={styles.paymentDate}>
                      {new Date(payment.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </span>
                    <span className={styles.paymentAmount}>
                      GHS {(Number(payment.amount) / 100).toFixed(2)}
                    </span>
                  </div>
                  <span className={`${styles.paymentStatus} ${styles[`status${payment.status}`]}`}>
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign Out */}
        <button className={styles.signOutButton} onClick={handleSignOut}>
          <IoLogOutOutline size={22} color="#ef4444" />
          <span className={styles.signOutText}>Sign Out</span>
        </button>

        <div style={{ height: '100px' }} />
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialName={getUserName()}
        initialEmail={getUserEmail()}
        profile={profile}
        selectedSchool={selectedSchool}
        onUpdate={async () => {
          const { data } = await getCurrentUser()
          if (data?.user) {
            const { data: profileData } = await getProfile()
            if (profileData) {
              setProfile(profileData)
            }
          }
        }}
      />

      {/* School Selection Modal */}
      <SchoolSelectionModal
        isOpen={showSchoolModal}
        onClose={() => setShowSchoolModal(false)}
        schools={schools}
        selectedSchool={selectedSchool}
        onSelect={async (schoolId: string) => {
          setSelectedSchool(schoolId)
          localStorage.setItem('selectedSchool', schoolId)
          await updateProfile(profile?.full_name, user?.email, profile?.phone, schoolId)
          const { data: profileData } = await getProfile()
          if (profileData) {
            setProfile(profileData)
          }
          setShowSchoolModal(false)
        }}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </div>
  )
}
