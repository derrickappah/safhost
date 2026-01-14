import Link from 'next/link'
import Image from 'next/image'
import { IoHome, IoCameraOutline, IoCashOutline, IoLocationOutline, IoStarOutline, IoCallOutline, IoLockClosed, IoCheckmarkCircle, IoArrowForward, IoLogInOutline } from 'react-icons/io5'
import styles from './page.module.css'
import { getPublicHostelPreviews, getFeaturedHostels } from '@/lib/actions/hostels'
import SubscribeButton from './SubscribeButton'
import LandingPageClient from './LandingPageClient'
import FeaturedSection from './dashboard/FeaturedSection'

const features = [
  { icon: IoCameraOutline, text: "Real Photos" },
  { icon: IoCashOutline, text: "Verified Prices" },
  { icon: IoLocationOutline, text: "Distance Info" },
  { icon: IoStarOutline, text: "Student Reviews" },
  { icon: IoCallOutline, text: "Direct Contact" },
]

// Full static generation - revalidate every hour
export const revalidate = 3600

// Force static generation
export const dynamic = 'force-static'
export const dynamicParams = false

export default async function LandingPage() {
  // Load hostels for preview (public) - this will be cached
  const { data: hostelsData } = await getPublicHostelPreviews(3)
  
  const previewHostels = hostelsData?.map((hostel) => ({
    id: hostel.id,
    name: hostel.name,
    price: hostel.price_min,
    rating: Number(hostel.rating),
    distance: hostel.distance ? `${hostel.distance}km` : null,
    image: hostel.images && hostel.images.length > 0 ? hostel.images[0] : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
    amenities: hostel.amenities || []
  })) || []

  // Load featured hostels
  const { data: featuredHostelsData } = await getFeaturedHostels(10).catch(() => ({ data: null, error: null }))
  
  // Format featured hostels for display
  const formattedFeaturedHostels = (featuredHostelsData || []).map(hostel => ({
    id: hostel.id,
    name: hostel.name,
    price: hostel.price_min || 0,
    rating: hostel.rating || 0,
    distance: hostel.distance,
    image: hostel.images?.[0] || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400'
  }))

  return (
    <LandingPageClient>
      <div className={styles.container}>
      <div className={styles.scrollContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.logoContainer}>
            <Image 
              src="/20260101_2143_SafHostel Logo_simple_compose_01kdxr7e9gfrvrqba7hb1811ghjhvh.png" 
              alt="SafHostel Logo" 
              width={180}
              height={52}
              priority
              className={styles.logoImage}
            />
          </div>
          <Link href="/auth/login" className={styles.signInButton}>
            <IoLogInOutline size={20} />
            <span>Sign In</span>
          </Link>
        </header>

        {/* Hero Section */}
        <section className={styles.heroSection}>
          <h2 className={styles.heroTitle}>
            Find Verified Hostels<br />Near Your School
          </h2>
          <p className={styles.heroSubtitle}>
            Browse 500+ student hostels across Ghana
          </p>
          <div className={styles.heroCtas}>
            <Link href="/auth/signup" className={styles.primaryCta}>
              Get Started
            </Link>
            <Link href="#preview" className={styles.secondaryCta}>
              Browse Hostels
            </Link>
          </div>
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
        <section id="preview" className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <h3 className={styles.previewTitle}>Available Hostels</h3>
            <div className={styles.lockBadge}>
              <IoLockClosed size={12} color="#fff" />
              <span className={styles.lockText}>Locked</span>
            </div>
          </div>

          {/* Blurred Hostel Cards */}
          {previewHostels.length === 0 ? (
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h4 className={styles.hostelName} style={{ filter: 'blur(5px)', userSelect: 'none' }}>
                        {hostel.name}
                      </h4>
                      <IoLockClosed size={14} color="#ef4444" style={{ opacity: 0.8 }} />
                    </div>
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
                      From GHS {hostel.price}/sem
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

        {/* Featured Hostels Section */}
        <FeaturedSection featuredHostels={formattedFeaturedHostels} />

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

            <SubscribeButton />

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
    </LandingPageClient>
  )
}
