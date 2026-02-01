import Link from 'next/link'
import Image from 'next/image'
import { IoLogoWhatsapp, IoLogoTiktok, IoLogoInstagram } from 'react-icons/io5'
import styles from './page.module.css'
import { getPublicHostelPreviews } from '@/lib/actions/hostels'
import LandingPageClient from './LandingPageClient'
import Loader from '@/components/Loader'
import SearchBar from './SearchBar'
import HostelPreviewCard from './HostelPreviewCard'
import BottomBar from './BottomBar'
import { AuthProvider } from '@/components/AuthProvider'

// Constants
const PREVIEW_HOSTELS_COUNT = 3
const LANDING_PAGE_REVALIDATE_SECONDS = 3600

// Full static generation - revalidate every hour
export const revalidate = LANDING_PAGE_REVALIDATE_SECONDS

// Force static generation
export const dynamic = 'force-static'
export const dynamicParams = false

interface HostelPreview {
  id: string
  name: string
  price: number
  rating: number
  distance: string | null
  image: string
  amenities: string[]
}

export default async function LandingPage() {
  // Load hostels for preview (public) - this will be cached
  const { data: hostelsData, error: hostelsError } = await getPublicHostelPreviews(PREVIEW_HOSTELS_COUNT)

  const previewHostels: HostelPreview[] = hostelsData?.map((hostel) => ({
    id: hostel.id,
    name: hostel.name,
    price: hostel.price_min,
    rating: Number(hostel.rating),
    distance: hostel.distance ? `${hostel.distance}km` : null,
    image: hostel.images && hostel.images.length > 0 ? hostel.images[0] : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400',
    amenities: hostel.amenities || []
  })) || []

  return (
    <AuthProvider>
      <LandingPageClient>
        <div className={styles.container}>
          <div className={styles.scrollContent}>
            {/* Header */}
            <header className={styles.header}>
              <div className={styles.logoContainer}>
                <Image
                  src="/20260101_2143_SafHostel Logo_simple_compose_01kdxr7e9gfrvrqba7hb1811ghjhvh.png"
                  alt="SafHostel Logo"
                  width={120}
                  height={40}
                  className={styles.logoImage}
                />
              </div>
              <div className={styles.headerActions}>
                <Link href="/auth/login" className={styles.signInButton}>
                  Sign In
                </Link>
              </div>
            </header>

            <main className={styles.main}>
              {/* Hero Section */}
              <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                  <h1 className={styles.heroTitle}>Find Verified Hostels Near Your School</h1>
                  <p className={styles.heroSubtitle}>Safely find student accommodation with zero stress.</p>
                  <div className={styles.heroCtas}>
                    <Link href="/auth/signup" className={styles.primaryCta}>
                      Get Started <span className="material-icons-round">arrow_forward</span>
                    </Link>
                    <Link href="#preview" className={styles.secondaryCta}>
                      Browse Hostels
                    </Link>
                  </div>
                </div>
                <div className={styles.heroVisual}>
                  <div className={styles.mainImageContainer}>
                    <Image
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlK-gDJHCR5GstaF23A0hty8nishYlIMwYSSGTcLKtjq_D0_oXmbOIq-_KBMObomcCAKsJzz3zTxY4gejsgagqICgKowEBQSb7a6nCYULMvYXXfEDcpHHWOeLXlOu8JX1wk189iN0wKYT9FXLSAd0e-tfES3xlvaJabkKlOAF6OQQMR1W18xmCGaGik506jRSxPBgFBzMBBevxKfNPieXAUTwKP8NrWMxN_TtYI8sHVBTH2r_GfkpwQouTziGtZSn7Cj4nrELxIgc"
                      alt="Modern student hostel"
                      fill
                      className={styles.heroImage}
                      priority
                    />
                    {/* Floating Stat Card */}
                    <div className={styles.statCard}>
                      <div className={styles.statIcon}>
                        <span className="material-icons-round">verified</span>
                      </div>
                      <div className={styles.statText}>
                        <p className={styles.statValue}>100+</p>
                        <p className={styles.statLabel}>Verified Listing</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Search Bar Mini */}
              <div className={styles.searchContainer}>
                <SearchBar />
              </div>

              {/* Trust Section */}
              <section className={styles.trustSection}>
                <h2 className={styles.trustLabel}>Why SafHost</h2>
                <div className={styles.trustGrid}>
                  <div className={styles.trustItem}>
                    <div className={`${styles.trustIcon} ${styles.blueIcon}`}>
                      <span className="material-icons-round">verified</span>
                    </div>
                    <h3 className={styles.trustTitle}>Verified Listings</h3>
                    <p className={styles.trustDesc}>Every room is physically inspected.</p>
                  </div>
                  <div className={styles.trustItem}>
                    <div className={`${styles.trustIcon} ${styles.greenIcon}`}>
                      <span className="material-icons-round">near_me</span>
                    </div>
                    <h3 className={styles.trustTitle}>Campus Proximity</h3>
                    <p className={styles.trustDesc}>See walking distance to lectures.</p>
                  </div>
                  <div className={styles.trustItem}>
                    <div className={`${styles.trustIcon} ${styles.orangeIcon}`}>
                      <span className="material-icons-round">star</span>
                    </div>
                    <h3 className={styles.trustTitle}>Student Reviews</h3>
                    <p className={styles.trustDesc}>Honest feedback from residents.</p>
                  </div>
                  <div className={styles.trustItem}>
                    <div className={`${styles.trustIcon} ${styles.purpleIcon}`}>
                      <span className="material-icons-round">chat_bubble</span>
                    </div>
                    <h3 className={styles.trustTitle}>Direct Contact</h3>
                    <p className={styles.trustDesc}>Chat with managers instantly.</p>
                  </div>
                </div>
              </section>

              {/* Property Gallery */}
              <section id="preview" className={styles.previewSection}>
                <div className={styles.previewHeader}>
                  <h2 className={styles.sectionTitle}>Featured Hostels</h2>
                  <Link href="/hostels" className={styles.seeAllButton}>
                    See all <span className="material-icons-round">chevron_right</span>
                  </Link>
                </div>

                <div className={styles.hostelGrid}>
                  {hostelsError && (
                    <div className={styles.errorState}>
                      <p className={styles.errorMessage}>
                        Failed to load hostels. Please try again later.
                      </p>
                    </div>
                  )}

                  {!hostelsError && previewHostels.length === 0 && (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyMessage}>
                        No featured hostels available at the moment.
                      </p>
                    </div>
                  )}

                  {!hostelsError && previewHostels.map((hostel) => (
                    <HostelPreviewCard
                      key={hostel.id}
                      id={hostel.id}
                      name={hostel.name}
                      price={hostel.price}
                      rating={hostel.rating}
                      distance={hostel.distance}
                      image={hostel.image}
                    />
                  ))}
                </div>
              </section>

              {/* How it Works */}
              <section className={styles.howItWorks}>
                <h2 className={styles.howItWorksTitle}>How SafHost Works</h2>
                <div className={styles.steps}>
                  <div className={styles.step}>
                    <div className={styles.stepHeader}>
                      <div className={styles.stepIcon}>
                        <span className="material-icons-round">search</span>
                      </div>
                      <div className={styles.stepNumber}>1</div>
                    </div>
                    <div className={styles.stepContent}>
                      <h4 className={styles.stepTitle}>Find a School</h4>
                      <p className={styles.stepDesc}>Search hostels by institution's name for nearby options.</p>
                    </div>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepHeader}>
                      <div className={styles.stepIcon}>
                        <span className="material-icons-round">visibility</span>
                      </div>
                      <div className={styles.stepNumber}>2</div>
                    </div>
                    <div className={styles.stepContent}>
                      <h4 className={styles.stepTitle}>Visit Virtually</h4>
                      <p className={styles.stepDesc}>Explore verified photos and read genuine reviews.</p>
                    </div>
                  </div>
                  <div className={styles.step}>
                    <div className={styles.stepHeader}>
                      <div className={styles.stepIcon}>
                        <span className="material-icons-round">verified_user</span>
                      </div>
                      <div className={styles.stepNumber}>3</div>
                    </div>
                    <div className={styles.stepContent}>
                      <h4 className={styles.stepTitle}>Book Securely</h4>
                      <p className={styles.stepDesc}>Call managers directly to book your spot</p>
                    </div>
                  </div>
                </div>
              </section>
            </main>

            <footer className={styles.footer}>
              <div className={styles.socialIcons}>
                {/* TODO: Update with actual social media URLs */}
                <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="WhatsApp">
                  <IoLogoWhatsapp size={24} />
                </a>
                <a href="https://tiktok.com/@safhost" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="TikTok">
                  <IoLogoTiktok size={24} />
                </a>
                <a href="https://instagram.com/safhost" target="_blank" rel="noopener noreferrer" className={styles.socialBtn} aria-label="Instagram">
                  <IoLogoInstagram size={24} />
                </a>
              </div>
              <p className={styles.copyright}>© 2026 SafHost Technologies. All rights reserved.</p>
            </footer>
          </div>

          {/* Sticky Bottom Bar - Hidden for authenticated users */}
          <BottomBar />
        </div>
      </LandingPageClient>
    </AuthProvider>
  )
}
