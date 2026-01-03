'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { IoNotificationsOutline, IoCheckmarkCircle, IoArrowForward, IoSearch, IoMap, IoStar, IoLocation, IoHeart, IoHeartOutline } from 'react-icons/io5'
import styles from './page.module.css'
import { getCurrentUser } from '@/lib/auth/client'
import { getFavorites } from '@/lib/actions/favorites'
import { getActiveSubscription } from '@/lib/actions/subscriptions'
import { removeFavorite, addFavorite } from '@/lib/actions/favorites'
import { getRecentlyViewed } from '@/lib/actions/views'
import { getHostels } from '@/lib/actions/hostels'
import { getUnreadCount } from '@/lib/notifications/get'

function DashboardPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [favorites, setFavorites] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([])
  const [featuredHostels, setFeaturedHostels] = useState<any[]>([])
  const [recommendedHostels, setRecommendedHostels] = useState<any[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const loadSubscription = async () => {
    const { data: subData, error } = await getActiveSubscription()
    if (error) {
      console.error('Error loading subscription:', error)
    }
    if (subData) {
      setSubscription(subData)
    } else {
      setSubscription(null)
    }
  }

  useEffect(() => {
    async function loadData() {
      const { data, error } = await getCurrentUser()
      if (error || !data?.user) {
        router.push(`/auth/login?redirect=${encodeURIComponent('/dashboard')}`)
        return
      }
      
      setUser(data.user)
      setCheckingAuth(false)
      
      // Load subscription
      await loadSubscription()
      
      // Load favorites
      const { data: favoritesData } = await getFavorites()
      if (favoritesData) {
        setFavorites(favoritesData.map(fav => ({
          id: fav.hostel?.id || fav.hostel_id,
          name: fav.hostel?.name || 'Unknown',
          price: fav.hostel?.price_min || 0,
          rating: fav.hostel?.rating || 0,
          distance: null, // Distance not stored in favorites
          image: fav.hostel?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
          favoriteId: fav.id
        })))
      }
      
      // Load unread notification count
      const { data: unreadCount } = await getUnreadCount()
      if (unreadCount !== null) {
        setUnreadNotifications(unreadCount)
      }
      
      setLoading(false)
    }
    loadData()
  }, [router])

  // Check for payment success and reload subscription
  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    if (paymentStatus === 'success') {
      setShowSuccessMessage(true)
      // Immediately reload subscription
      loadSubscription()
      
      // Reload subscription data multiple times with delays to ensure it's activated
      const reloadInterval = setInterval(async () => {
        await loadSubscription()
      }, 2000)
      
      // Stop reloading after 15 seconds
      setTimeout(() => {
        clearInterval(reloadInterval)
        // Final reload
        loadSubscription()
        // Remove query param from URL
        router.replace('/dashboard')
      }, 15000)
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
    }
  }, [searchParams, router])

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

  const handleToggleFavorite = async (hostelId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const favorite = favorites.find(f => f.id === hostelId)
    
    if (favorite) {
      // Remove from favorites
      await removeFavorite(hostelId)
      setFavorites(favorites.filter(f => f.id !== hostelId))
    } else {
      // Add to favorites
      const { data } = await addFavorite(hostelId)
      if (data) {
        // Reload favorites to get full data
        const { data: favoritesData } = await getFavorites()
        if (favoritesData) {
          setFavorites(favoritesData.map(fav => ({
            id: fav.hostel?.id || fav.hostel_id,
            name: fav.hostel?.name || 'Unknown',
            price: fav.hostel?.price_min || 0,
            rating: fav.hostel?.rating || 0,
            distance: null,
            image: fav.hostel?.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
            favoriteId: fav.id
          })))
        }
      }
    }
  }

  const getUserName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

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
        {/* Success Message */}
        {showSuccessMessage && (
          <div style={{
            margin: '16px',
            padding: '16px',
            backgroundColor: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            color: '#065f46',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <IoCheckmarkCircle size={20} color="#10b981" />
            <span style={{ fontWeight: 500 }}>Payment successful! Your subscription is being activated...</span>
          </div>
        )}

        {/* Header */}
        <header className={styles.header}>
          <div>
            <p className={styles.greeting}>{getGreeting()} 👋</p>
            <h1 className={styles.schoolName}>{getUserName()}</h1>
          </div>
          <button 
            className={styles.notificationBtn}
            onClick={() => router.push('/notifications')}
          >
            {unreadNotifications > 0 ? (
              <IoNotifications size={24} color="#2563eb" />
            ) : (
              <IoNotificationsOutline size={24} color="#1e293b" />
            )}
            {unreadNotifications > 0 && (
              <span className={styles.notificationBadge}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
            )}
          </button>
        </header>

        {/* Subscription Card */}
        {subscription && subscription.status === 'active' ? (
          <div className={styles.subscriptionCard}>
            <div className={styles.subscriptionHeader}>
              <div className={styles.subscriptionBadge}>
                <IoCheckmarkCircle size={16} color="#22c55e" />
                <span className={styles.subscriptionStatus}>Active</span>
              </div>
              <span className={styles.daysLeft}>
                {daysLeft !== null ? `${daysLeft} days left` : 'Active'}
              </span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <button 
              className={styles.renewButton}
              onClick={() => router.push('/subscribe')}
            >
              <span className={styles.renewButtonText}>Renew Subscription</span>
              <IoArrowForward size={16} color="#2563eb" />
            </button>
          </div>
        ) : (
          <div className={styles.subscriptionCard} style={{ backgroundColor: '#fef2f2' }}>
            <div className={styles.subscriptionHeader}>
              <div className={styles.subscriptionBadge} style={{ backgroundColor: '#fee2e2' }}>
                <span className={styles.subscriptionStatus} style={{ color: '#dc2626' }}>No Subscription</span>
              </div>
              <button
                onClick={async () => {
                  setLoading(true)
                  await loadSubscription()
                  setLoading(false)
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Refresh
              </button>
            </div>
            <button 
              className={styles.renewButton}
              onClick={() => router.push('/subscribe')}
            >
              <span className={styles.renewButtonText}>Subscribe Now</span>
              <IoArrowForward size={16} color="#2563eb" />
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button
            className={styles.quickActionCard}
            onClick={() => router.push('/hostels')}
          >
            <div className={`${styles.quickActionIcon} ${styles.iconBlue}`}>
              <IoSearch size={24} color="#2563eb" />
            </div>
            <span className={styles.quickActionText}>Browse</span>
          </button>

          <button className={styles.quickActionCard}>
            <div className={`${styles.quickActionIcon} ${styles.iconGreen}`}>
              <IoMap size={24} color="#22c55e" />
            </div>
            <span className={styles.quickActionText}>Map</span>
          </button>
          <button className={styles.quickActionCard}>
            <div className={`${styles.quickActionIcon} ${styles.iconYellow}`}>
              <IoStar size={24} color="#eab308" />
            </div>
            <span className={styles.quickActionText}>Top Rated</span>
          </button>
        </div>

        {/* Favorites Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your Favorites</h2>
          </div>
          {favorites.length > 0 ? (
            <div className={styles.horizontalScroll}>
              {favorites.map((hostel) => (
                <div
                  key={hostel.id}
                  className={styles.favoriteCard}
                  onClick={() => router.push(`/hostel/${hostel.id}`)}
                >
                  <Image
                    src={hostel.image}
                    alt={hostel.name}
                    width={180}
                    height={110}
                    className={styles.favoriteImage}
                    priority={hostel.id === favorites[0]?.id}
                  />
                  <div className={styles.favoriteContent}>
                    <h3 className={styles.favoriteName}>{hostel.name}</h3>
                    <div className={styles.favoriteRow}>
                      <div className={styles.ratingSmall}>
                        <IoStar size={10} color="#fbbf24" />
                        <span className={styles.ratingSmallText}>{Number(hostel.rating).toFixed(1)}</span>
                      </div>
                      {hostel.distance && (
                        <span className={styles.distanceSmall}>{hostel.distance}</span>
                      )}
                    </div>
                    <span className={styles.favoritePrice}>GHS {hostel.price}/mo</span>
                  </div>
                  <button 
                    className={styles.heartButton}
                    onClick={(e) => handleToggleFavorite(hostel.id, e)}
                  >
                    <IoHeart size={18} color="#ef4444" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
                No favorites yet
              </p>
              <button
                onClick={() => router.push('/hostels')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'var(--color-primary)',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                Browse Hostels
              </button>
            </div>
          )}
        </section>

        {/* Featured Hostels */}
        {featuredHostels.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Featured Hostels</h2>
            </div>
            <div className={styles.hostelGrid}>
              {featuredHostels.map((hostel) => (
                <button
                  key={hostel.id}
                  className={styles.hostelCard}
                  onClick={() => router.push(`/hostel/${hostel.id}`)}
                >
                  <div className={styles.hostelImageContainer}>
                    <Image
                      src={hostel.image}
                      alt={hostel.name}
                      width={200}
                      height={120}
                      className={styles.hostelImage}
                    />
                  </div>
                  <div className={styles.hostelInfo}>
                    <h3 className={styles.hostelName}>{hostel.name}</h3>
                    <div className={styles.hostelMeta}>
                      <div className={styles.rating}>
                        <IoStar size={12} color="#fbbf24" />
                        <span>{Number(hostel.rating).toFixed(1)}</span>
                      </div>
                      {hostel.distance && (
                        <div className={styles.distance}>
                          <IoLocation size={12} color="#64748b" />
                          <span>{hostel.distance}km</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.hostelPrice}>GHS {hostel.price}/mo</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recommended Hostels */}
        {recommendedHostels.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recommended for You</h2>
            </div>
            <div className={styles.hostelGrid}>
              {recommendedHostels.map((hostel) => (
                <button
                  key={hostel.id}
                  className={styles.hostelCard}
                  onClick={() => router.push(`/hostel/${hostel.id}`)}
                >
                  <div className={styles.hostelImageContainer}>
                    <Image
                      src={hostel.image}
                      alt={hostel.name}
                      width={200}
                      height={120}
                      className={styles.hostelImage}
                    />
                  </div>
                  <div className={styles.hostelInfo}>
                    <h3 className={styles.hostelName}>{hostel.name}</h3>
                    <div className={styles.hostelMeta}>
                      <div className={styles.rating}>
                        <IoStar size={12} color="#fbbf24" />
                        <span>{Number(hostel.rating).toFixed(1)}</span>
                      </div>
                      {hostel.distance && (
                        <div className={styles.distance}>
                          <IoLocation size={12} color="#64748b" />
                          <span>{hostel.distance}km</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.hostelPrice}>GHS {hostel.price}/mo</div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Recently Viewed</h2>
            </div>
            <div className={styles.hostelList}>
              {recentlyViewed.map((hostel) => (
                <button
                  key={hostel.id}
                  className={styles.recentCard}
                  onClick={() => router.push(`/hostel/${hostel.id}`)}
                >
                  <div className={styles.recentImageContainer}>
                    <Image
                      src={hostel.image}
                      alt={hostel.name}
                      width={80}
                      height={80}
                      className={styles.recentImage}
                    />
                  </div>
                  <div className={styles.recentContent}>
                    <h3 className={styles.recentName}>{hostel.name}</h3>
                    <div className={styles.recentMeta}>
                      <div className={styles.rating}>
                        <IoStar size={12} color="#fbbf24" />
                        <span>{Number(hostel.rating).toFixed(1)}</span>
                      </div>
                      {hostel.distance && (
                        <div className={styles.distance}>
                          <IoLocation size={12} color="#64748b" />
                          <span>{hostel.distance}km</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.recentPrice}>GHS {hostel.price}/mo</div>
                  </div>
                  <IoArrowForward size={20} color="#94a3b8" />
                </button>
              ))}
            </div>
          </section>
        )}

        <div style={{ height: '100px' }} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
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
    }>
      <DashboardPageContent />
    </Suspense>
  )
}
