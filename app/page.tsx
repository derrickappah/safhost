'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { IoHome, IoCameraOutline, IoCashOutline, IoLocationOutline, IoStarOutline, IoCallOutline, IoLockClosed, IoCheckmarkCircle, IoArrowForward } from 'react-icons/io5'
import styles from './page.module.css'
import { getHostels } from '@/lib/actions/hostels'
import { getCurrentUser } from '@/lib/auth/client'

interface PreviewHostel {
  id: string
  name: string
  price: number
  rating: number
  distance: string | null
  image: string
  amenities: string[]
}

const features = [
  { icon: IoCameraOutline, text: "Real Photos" },
  { icon: IoCashOutline, text: "Verified Prices" },
  { icon: IoLocationOutline, text: "Distance Info" },
  { icon: IoStarOutline, text: "Student Reviews" },
  { icon: IoCallOutline, text: "Direct Contact" },
]

export default function LandingPage() {
  const router = useRouter()
  const [previewHostels, setPreviewHostels] = useState<PreviewHostel[]>([])
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function loadData() {
      // Check authentication
      const { data, error } = await getCurrentUser()
      setIsAuthenticated(!!(data?.user))
      
      // Load hostels
      const { data: hostelsData, error: hostelsError } = await getHostels({ limit: 3 })
      if (hostelsData) {
        const formatted = hostelsData.map((hostel) => ({
          id: hostel.id,
          name: hostel.name,
          price: hostel.price_min,
          rating: Number(hostel.rating),
          distance: hostel.distance ? `${hostel.distance}km` : null,
          image: hostel.images && hostel.images.length > 0 ? hostel.images[0] : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
          amenities: hostel.amenities || []
        }))
        setPreviewHostels(formatted)
      }
      setLoading(false)
    }
    loadData()
  }, [])
  
  const handleSubscribe = () => {
    if (isAuthenticated) {
      router.push('/subscribe')
    } else {
      router.push('/auth/signup?redirect=/subscribe')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.scrollContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <IoHome size={24} color="#fff" />
            </div>
            <h1 className={styles.logoText}>HostelFinder</h1>
          </div>
        </header>

        {/* Hero Section */}
        <section className={styles.heroSection}>
          <h2 className={styles.heroTitle}>
            Find Verified Hostels<br />Near Your School
          </h2>
          <p className={styles.heroSubtitle}>
            Browse 500+ student hostels across Ghana
          </p>
        </section>

        {/* Features Grid */}
        <div className={styles.featuresContainer}>
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <Icon size={20} color="#2563eb" />
                </div>
                <span className={styles.featureText}>{feature.text}</span>
              </div>
            )
          })}
        </div>

        {/* Blurred Preview Section */}
        <section className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <h3 className={styles.previewTitle}>Available Hostels</h3>
            <div className={styles.lockBadge}>
              <IoLockClosed size={12} color="#fff" />
              <span className={styles.lockText}>Locked</span>
            </div>
          </div>

          {/* Blurred Hostel Cards */}
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>Loading hostels...</div>
          ) : (
            previewHostels.map((hostel) => (
              <div key={hostel.id} className={styles.blurredCard}>
                <div className={styles.cardImageContainer}>
                  <img
                    src={hostel.image}
                    alt={hostel.name}
                    className={styles.cardImage}
                    style={{ filter: 'blur(8px)' }}
                  />
                  <div className={styles.blurOverlay}>
                    <IoLockClosed size={24} color="#fff" />
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <h4 className={styles.hostelName}>{hostel.name}</h4>
                    <div className={styles.ratingBadge}>
                      <IoStarOutline size={12} color="#fbbf24" />
                      <span className={styles.ratingText}>{hostel.rating}</span>
                    </div>
                  </div>
                  <div className={styles.cardMeta}>
                    {hostel.distance && (
                      <span className={styles.distanceText}>
                        <IoLocationOutline size={12} color="#6b7280" /> {hostel.distance}
                      </span>
                    )}
                    <span className={styles.priceText}>
                      From GHS {hostel.price}/mo
                    </span>
                  </div>
                  <div className={styles.amenitiesRow}>
                    {hostel.amenities.slice(0, 3).map((amenity, idx) => (
                      <div key={idx} className={styles.amenityTag}>
                        <span className={styles.amenityText}>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </section>

        {/* Spacer for sticky button */}
        <div style={{ height: '180px' }} />
      </div>

      {/* Sticky CTA Section */}
      <div className={styles.ctaContainer}>
        <div className={styles.ctaGradient}>
          <div className={styles.ctaContent}>
            <div className={styles.priceBox}>
              <span className={styles.priceLabel}>Full Access</span>
              <div className={styles.priceRow}>
                <span className={styles.currency}>GHS</span>
                <span className={styles.priceAmount}>20</span>
                <span className={styles.pricePeriod}>/month</span>
              </div>
            </div>

            <div className={styles.benefitsList}>
              <div className={styles.benefitItem}>
                <IoCheckmarkCircle size={16} color="#22c55e" />
                <span className={styles.benefitText}>Full access for 30 days</span>
              </div>
              <div className={styles.benefitItem}>
                <IoCheckmarkCircle size={16} color="#22c55e" />
                <span className={styles.benefitText}>Secure account creation</span>
              </div>
              <div className={styles.benefitItem}>
                <IoCheckmarkCircle size={16} color="#22c55e" />
                <span className={styles.benefitText}>Mobile Money supported</span>
              </div>
            </div>

            <button
              className={styles.subscribeButton}
              onClick={handleSubscribe}
            >
              <span className={styles.subscribeButtonText}>Subscribe Now</span>
              <IoArrowForward size={20} color="#fff" />
            </button>

            {/* Payment Methods */}
            <div className={styles.paymentMethods}>
              <span className={styles.paymentLabel}>Pay with</span>
              <div className={styles.paymentIcons}>
                <div className={styles.paymentBadge}>
                  <span className={styles.paymentBadgeText}>MTN MoMo</span>
                </div>
                <div className={styles.paymentBadge}>
                  <span className={styles.paymentBadgeText}>Vodafone Cash</span>
                </div>
                <div className={styles.paymentBadge}>
                  <span className={styles.paymentBadgeText}>AirtelTigo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
