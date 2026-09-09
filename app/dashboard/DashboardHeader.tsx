'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  IoNotificationsOutline,
  IoSchoolOutline,
  IoChevronDown,
  IoShieldCheckmark,
  IoPerson,
} from 'react-icons/io5'
import type { Subscription } from '@/lib/actions/subscriptions'
import type { School } from '@/lib/actions/schools'
import { updateProfile } from '@/lib/actions/profile'
import CampusSwitcherModal from './CampusSwitcherModal'
import styles from './page.module.css'

export interface DashboardHeaderProps {
  user?: any
  profile?: any
  schools?: School[]
  unreadNotifications?: number
  subscription?: Subscription | null
  userName?: string
}

export default function DashboardHeader({
  user,
  profile,
  schools = [],
  unreadNotifications = 0,
  subscription = null,
  userName,
}: DashboardHeaderProps) {
  const router = useRouter()
  const [showCampusModal, setShowCampusModal] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Derive initial campus context
  const [activeSchool, setActiveSchool] = useState<School | null>(() => {
    if (profile?.school && typeof profile.school === 'object') {
      return profile.school as School
    }
    if (profile?.school_id && schools.length > 0) {
      const found = schools.find((s) => s.id === profile.school_id)
      if (found) return found
    }
    return null
  })

  // Sync with profile or localStorage if activeSchool is not yet set
  useEffect(() => {
    if (profile?.school && typeof profile.school === 'object') {
      setActiveSchool(profile.school as School)
      return
    }
    if (profile?.school_id && schools.length > 0) {
      const match = schools.find((s) => s.id === profile.school_id)
      if (match) {
        setActiveSchool(match)
        return
      }
    }
    try {
      const stored = localStorage.getItem('selectedSchool')
      if (stored && schools.length > 0) {
        const found = schools.find((s) => s.id === stored)
        if (found) {
          setActiveSchool(found)
        }
      }
    } catch {
      // Ignore localStorage read errors in restricted contexts
    }
  }, [profile, schools])

  const handleSelectSchool = async (schoolId: string) => {
    const selected = schools.find((s) => s.id === schoolId)
    if (selected) {
      setActiveSchool(selected)
    }
    try {
      localStorage.setItem('selectedSchool', schoolId)
    } catch (e) {
      console.error('[DashboardHeader] Failed to set localStorage selectedSchool:', e)
    }

    if (user) {
      try {
        await updateProfile(undefined, undefined, undefined, schoolId)
      } catch (e) {
        console.error('[DashboardHeader] Failed to update profile school:', e)
      }
    }
    setShowCampusModal(false)
  }

  // Student name derivation
  const studentName = useMemo(() => {
    if (profile?.full_name?.trim()) return profile.full_name.trim()
    if (user?.user_metadata?.name?.trim()) return user.user_metadata.name.trim()
    if (user?.user_metadata?.full_name?.trim()) return user.user_metadata.full_name.trim()
    if (userName?.trim()) return userName.trim()
    if (user?.email) return user.email.split('@')[0]
    return 'Student'
  }, [profile, user, userName])

  // Initials computation
  const initials = useMemo(() => {
    if (!studentName) return ''
    const parts = studentName.trim().split(/\s+/)
    if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return studentName.trim().substring(0, 2).toUpperCase()
  }, [studentName])

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) return 'Good morning'
    if (hour >= 12 && hour < 17) return 'Good afternoon'
    return 'Good evening'
  }, [])

  // Days left calculation
  const getSubscriptionDaysLeft = () => {
    if (!subscription?.expires_at) return null
    const expiresAt = new Date(subscription.expires_at)
    const now = new Date()
    const diffTime = expiresAt.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const isActive = subscription && subscription.status === 'active'
  const daysLeft = getSubscriptionDaysLeft()
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || null

  return (
    <>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          {/* Left Column: Avatar + Greeting & Name + Campus Switcher */}
          <div className={styles.headerLeft}>
            {/* Clickable Avatar linking to /profile */}
            <Link
              href="/profile"
              className={styles.avatarLink}
              aria-label="View profile"
            >
              {avatarUrl && !imageError ? (
                <img
                  src={avatarUrl}
                  alt={studentName}
                  className={styles.avatarImg}
                  onError={() => setImageError(true)}
                />
              ) : initials ? (
                <div className={styles.initialsAvatar}>{initials}</div>
              ) : (
                <div className={styles.avatarFallback}>
                  <IoPerson size={18} />
                </div>
              )}
            </Link>

            {/* Greeting and Identity Info */}
            <div className={styles.greetingContainer}>
              <div className={styles.greetingRow}>
                <span className={styles.greeting}>{greeting} 👋</span>
                {/* Subscription Badge */}
                {isActive ? (
                  <Link
                    href="/profile"
                    className={styles.subscriptionBadgeActive}
                    title="Active Pro Subscription"
                  >
                    <IoShieldCheckmark size={12} />
                    <span>
                      {daysLeft !== null ? `PRO • ${daysLeft}d left` : 'PRO • Active'}
                    </span>
                  </Link>
                ) : (
                  <Link
                    href="/subscribe"
                    className={styles.subscriptionBadgeFree}
                    title="Upgrade to Pro"
                  >
                    <span>Free</span>
                  </Link>
                )}
              </div>

              <div className={styles.nameRow}>
                <h1 className={styles.studentName}>{studentName}</h1>

                {/* Campus Context & Switcher Button */}
                <button
                  type="button"
                  className={styles.campusSwitcherBtn}
                  onClick={() => setShowCampusModal(true)}
                  aria-label={`Campus: ${
                    activeSchool ? activeSchool.name : 'Select Campus'
                  }. Click to switch.`}
                >
                  <IoSchoolOutline size={14} className={styles.campusIcon} />
                  <span className={styles.campusName}>
                    {activeSchool ? activeSchool.name : 'Select Campus'}
                  </span>
                  <IoChevronDown size={12} className={styles.chevronIcon} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Notification Bell Button */}
          <div className={styles.headerRight}>
            <button
              type="button"
              className={styles.notificationBtn}
              onClick={() => router.push('/notifications')}
              aria-label={`Notifications${
                unreadNotifications > 0 ? ` (${unreadNotifications} unread)` : ''
              }`}
            >
              <IoNotificationsOutline
                size={22}
                color={unreadNotifications > 0 ? '#2563eb' : '#64748b'}
              />
              {unreadNotifications > 0 && (
                <span className={styles.notificationBadge} aria-hidden="true">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Campus Switcher Modal */}
      <CampusSwitcherModal
        isOpen={showCampusModal}
        onClose={() => setShowCampusModal(false)}
        schools={schools}
        selectedSchoolId={activeSchool?.id || null}
        onSelectSchool={handleSelectSchool}
      />
    </>
  )
}
