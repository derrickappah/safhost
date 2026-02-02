'use client'

import { useState, useEffect, useMemo, useRef, memo } from 'react'
import {
  IoPerson,
  IoCardOutline,
  IoSchoolOutline,
  IoNotificationsOutline,
  IoHelpCircleOutline,
  IoInformationCircleOutline,
  IoCreateOutline,
  IoDiamond,
  IoChevronForward,
  IoLogOutOutline,
  IoHeart,
  IoEye,
  IoCall,
  IoShieldCheckmark
} from 'react-icons/io5'
import { createClient } from '@/lib/supabase/client'
import { updateProfile, getProfile } from '@/lib/actions/profile'
import { getCurrentUser } from '@/lib/auth/client'
import EditProfileModal from './EditProfileModal'
import SchoolSelectionModal from './SchoolSelectionModal'
import AboutModal from './AboutModal'
import styles from './page.module.css'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'

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
  isAdmin?: boolean
}

// Memoized Modals to prevent unnecessary re-renders
const MemoizedEditProfileModal = memo(EditProfileModal)
const MemoizedSchoolSelectionModal = memo(SchoolSelectionModal)
const MemoizedAboutModal = memo(AboutModal)

export default function ProfilePageClient({
  user,
  subscription,
  favoritesCount,
  viewedCount,
  contactedCount,
  paymentHistory,
  schools,
  profile: initialProfile,
  selectedSchool: initialSelectedSchool,
  isAdmin = false
}: ProfilePageClientProps) {
  const { navigate, router } = useInstantNavigation()
  const [profile, setProfile] = useState(initialProfile)
  const [selectedSchool, setSelectedSchool] = useState<string | null>(initialSelectedSchool)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showSchoolModal, setShowSchoolModal] = useState(false)
  const [showAboutModal, setShowAboutModal] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync state if initial props change (e.g. from server refresh)
  useEffect(() => {
    setProfile(initialProfile)
  }, [initialProfile])

  useEffect(() => {
    setSelectedSchool(initialSelectedSchool)
  }, [initialSelectedSchool])

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
      console.error('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.error('File size exceeds 5MB limit')
      return
    }

    setUploadingAvatar(true)

    try {
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

      // Locally update profile to avoid full re-fetch
      setProfile((prev: any) => ({ ...prev, avatar_url: data.url }))
    } catch (error) {
      console.error('Avatar upload error:', error)
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
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

  const menuItems = useMemo(() => [
    {
      id: "subscription",
      icon: IoCardOutline,
      title: "Subscription",
      subtitle: subscription
        ? `${subscription.status === 'active' ? 'Active' : subscription.status} • ${getSubscriptionDaysLeft() || 0} days left`
        : "No active subscription",
      color: subscription?.status === 'active' ? "#22c55e" : "#64748b",
      action: () => navigate('/subscribe')
    },
    {
      id: "school",
      icon: IoSchoolOutline,
      title: "My School",
      subtitle: selectedSchool
        ? schools.find(s => s.id === selectedSchool)?.name || "Not selected"
        : "Not selected",
      color: "#2563eb",
      action: () => setShowSchoolModal(true)
    },
    {
      id: "notifications",
      icon: IoNotificationsOutline,
      title: "Notifications",
      subtitle: "Push notifications enabled",
      color: "#f59e0b",
      action: () => navigate('/notifications')
    },
    {
      id: "help",
      icon: IoHelpCircleOutline,
      title: "Help & Support",
      subtitle: "FAQs, Contact us",
      color: "#8b5cf6",
      action: () => navigate('/help')
    },
    {
      id: "about",
      icon: IoInformationCircleOutline,
      title: "About",
      subtitle: "Version 1.0.0",
      color: "#64748b",
      action: () => setShowAboutModal(true)
    },
  ], [subscription, selectedSchool, schools, navigate])

  const daysLeft = getSubscriptionDaysLeft()
  const progress = getSubscriptionProgress()

  return (
    <div className={styles.container}>
      <div className={styles.scrollContent}>
        {/* Hero Section */}
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <div className={styles.avatarWrapper}>
              <div
                className={styles.avatar}
                onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
                style={{ cursor: uploadingAvatar ? 'wait' : 'pointer' }}
              >
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
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className={styles.avatarInput}
                disabled={uploadingAvatar}
                style={{ display: 'none' }}
              />
              <button
                className={styles.editAvatarButton}
                onClick={() => fileInputRef.current?.click()}
                aria-label="Change profile picture"
                disabled={uploadingAvatar}
              >
                <IoCreateOutline size={14} color="#fff" />
              </button>
            </div>
            <h1 className={styles.heroName}>{getUserName()}</h1>
            <p className={styles.heroEmail}>{getUserEmail()}</p>
            {getUserPhone() !== 'No phone number' && (
              <p className={styles.heroPhone}>{getUserPhone()}</p>
            )}
            <button
              className={styles.editProfileButton}
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {[
            { id: 'favorites', label: 'Saved', count: favoritesCount, icon: IoHeart, color: '#ef4444', bg: '#fef2f2', path: '/favorites' },
            { id: 'viewed', label: 'Viewed', count: viewedCount, icon: IoEye, color: '#2563eb', bg: '#eff6ff', path: '/viewed' },
            { id: 'contacted', label: 'Contacted', count: contactedCount, icon: IoCall, color: '#22c55e', bg: '#f0fdf4', path: '/contacted' }
          ].map((stat) => (
            <button
              key={stat.id}
              className={stat.id === 'favorites' ? styles.statCard : styles.statCard}
              onClick={() => navigate(stat.path)}
            >
              <div className={styles.statIcon} style={{ backgroundColor: stat.bg }}>
                <stat.icon size={20} color={stat.color} />
              </div>
              <div className={styles.statContent}>
                <span className={styles.statValue}>{stat.count}</span>
                <span className={stat.id === 'favorites' ? styles.statLabel : styles.statLabel}>{stat.label}</span>
              </div>
            </button>
          ))}
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
                onClick={() => navigate('/subscribe')}
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
                onClick={() => navigate('/subscribe')}
              >
                Subscribe Now
              </button>
            </>
          )}
        </div>

        {/* Settings Sections */}
        {[
          { title: "Account", range: [0, 2] },
          { title: "Preferences", range: [2, 3] },
          { title: "Support", range: [3, 5] }
        ].map((section) => (
          <div key={section.title} className={styles.settingsSection}>
            <h2 className={styles.sectionHeader}>{section.title}</h2>
            <div className={styles.settingsList}>
              {menuItems.slice(section.range[0], section.range[1]).map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    className={styles.settingsItem}
                    onClick={item.action}
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
        ))}

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

        {/* Admin Panel Button - Only visible to admins */}
        {isAdmin && (
          <button
            className={styles.adminButton}
            onClick={() => navigate('/admin')}
          >
            <IoShieldCheckmark size={22} color="#2563eb" />
            <span className={styles.adminButtonText}>Admin Panel</span>
          </button>
        )}

        {/* Sign Out */}
        <button className={styles.signOutButton} onClick={handleSignOut}>
          <IoLogOutOutline size={22} color="#ef4444" />
          <span className={styles.signOutText}>Sign Out</span>
        </button>

        <div style={{ height: '100px' }} />
      </div>

      <MemoizedEditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        initialName={getUserName()}
        initialEmail={getUserEmail()}
        profile={profile}
        selectedSchool={selectedSchool}
        onUpdate={async (updatedProfile) => {
          if (updatedProfile) {
            setProfile(updatedProfile)
          } else {
            // Fallback to fetch if no data returned
            const { data: profileData } = await getProfile()
            if (profileData) {
              setProfile(profileData)
            }
          }
        }}
      />

      <MemoizedSchoolSelectionModal
        isOpen={showSchoolModal}
        onClose={() => setShowSchoolModal(false)}
        schools={schools}
        selectedSchool={selectedSchool}
        onSelect={async (schoolId: string) => {
          // Optimistic update
          const oldSchool = selectedSchool
          setSelectedSchool(schoolId)
          try {
            const { error } = await updateProfile(profile?.full_name, user?.email, profile?.phone, schoolId)
            if (error) throw new Error(error)

            // Sync profile data to get full school object if needed
            const { data: profileData } = await getProfile()
            if (profileData) setProfile(profileData)

            setShowSchoolModal(false)
          } catch (error) {
            console.error('Failed to update school:', error)
            setSelectedSchool(oldSchool)
          }
        }}
      />

      <MemoizedAboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />
    </div>
  )
}
