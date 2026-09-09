import Link from 'next/link'
import Image from 'next/image'
import {
  IoLogoWhatsapp,
  IoLogoTiktok,
  IoLogoInstagram,
  IoShieldCheckmark,
  IoLocationOutline,
  IoStar,
  IoCheckmarkCircle,
  IoArrowForward,
  IoSchoolOutline,
  IoEyeOutline,
  IoChatbubblesOutline,
  IoFlashOutline,
  IoLockClosedOutline,
  IoSparklesOutline,
  IoCallOutline,
} from 'react-icons/io5'
import styles from './page.module.css'
import { getPublicHostelPreviews } from '@/lib/actions/hostels'
import { getSchools } from '@/lib/actions/schools'
import LandingPageClient from './LandingPageClient'
import SearchBar from './SearchBar'
import HostelPreviewCard from './HostelPreviewCard'
import BottomBar from './BottomBar'
import FaqAccordion from './FaqAccordion'
import { AuthProvider } from '@/components/AuthProvider'

// Constants
const PREVIEW_HOSTELS_COUNT = 6

// Static generation with hourly revalidation
export const revalidate = 3600
export const dynamic = 'force-static'
export const dynamicParams = false

interface HostelPreview {
  id: string
  name: string
  price: number
  rating: number
  distance: string | null
  image: string
  schoolName: string | null
  amenities: string[]
}

const FALLBACK_CAMPUSES = [
  { name: 'University of Ghana (UG)', shortName: 'UG Legon', city: 'Legon, Accra' },
  { name: 'KNUST', shortName: 'KNUST', city: 'Kumasi' },
  { name: 'UPSA', shortName: 'UPSA', city: 'Madina, Accra' },
  { name: 'University of Cape Coast (UCC)', shortName: 'UCC', city: 'Cape Coast' },
  { name: 'Accra Technical University', shortName: 'ATU', city: 'Accra Central' },
  { name: 'Academic City University', shortName: 'Academic City', city: 'Haatso, Accra' },
]

export default async function LandingPage() {
  // Parallel fetch featured hostels and schools
  const [hostelsResult, schoolsResult] = await Promise.all([
    getPublicHostelPreviews(PREVIEW_HOSTELS_COUNT).catch(() => ({ data: null, error: null })),
    getSchools().catch(() => ({ data: null, error: null })),
  ])

  const hostelsData = hostelsResult?.data
  const hostelsError = hostelsResult?.error
  const schoolsData = schoolsResult?.data

  const previewHostels: HostelPreview[] =
    hostelsData?.map((hostel) => ({
      id: hostel.id,
      name: hostel.name,
      price: hostel.price_min,
      rating: Number(hostel.rating) || 0,
      distance: hostel.distance ? `${hostel.distance}km` : null,
      image:
        hostel.images && hostel.images.length > 0
          ? hostel.images[0]
          : 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop&q=80',
      schoolName: hostel.school?.name || null,
      amenities: hostel.amenities || [],
    })) || []

  // Combine fetched schools or use standard top university hubs
  const campusList =
    schoolsData && schoolsData.length > 0
      ? schoolsData.slice(0, 6).map((school) => ({
          id: school.id,
          name: school.name,
          city: school.location || 'Ghana',
        }))
      : FALLBACK_CAMPUSES.map((c, idx) => ({
          id: `campus-${idx}`,
          name: c.name,
          city: c.city,
        }))

  return (
    <AuthProvider>
      <LandingPageClient>
        <div className={styles.container}>
          <div className={styles.scrollContent}>
            {/* 1. Header & Navigation */}
            <header className={styles.header}>
              <div className={styles.headerInner}>
                <Link href="/" className={styles.logoLink} aria-label="SafHost Home">
                  <Image
                    src="/20260101_2143_SafHostel Logo_simple_compose_01kdxr7e9gfrvrqba7hb1811ghjhvh.png"
                    alt="SafHost Logo"
                    width={130}
                    height={40}
                    className={styles.logoImage}
                    priority
                  />
                </Link>

                <nav className={styles.desktopNav} aria-label="Main Navigation">
                  <Link href="/hostels" className={styles.navLink}>
                    Browse Hostels
                  </Link>
                  <Link href="#campuses" className={styles.navLink}>
                    Campuses
                  </Link>
                  <Link href="#why-safhost" className={styles.navLink}>
                    Why SafHost
                  </Link>
                  <Link href="#how-it-works" className={styles.navLink}>
                    How It Works
                  </Link>
                  <Link href="#faqs" className={styles.navLink}>
                    FAQs
                  </Link>
                </nav>

                <div className={styles.headerActions}>
                  <Link href="/auth/login" className={styles.signInLink}>
                    Sign In
                  </Link>
                  <Link href="/auth/signup" className={styles.signUpButton}>
                    <span>Find a Room</span>
                    <IoArrowForward size={14} />
                  </Link>
                </div>
              </div>
            </header>

            <main>
              {/* 2. Hero Section */}
              <section className={styles.heroSection}>
                <div className={styles.heroContent}>
                  <div className={styles.heroBadge}>
                    <span className={styles.heroBadgeDot} />
                    <span>🇬🇭 Ghana&apos;s #1 Verified Student Accommodation Platform</span>
                  </div>

                  <h1 className={styles.heroTitle}>
                    Find Verified Student Hostels{' '}
                    <span className={styles.heroTitleGradient}>Near Your Campus</span>
                  </h1>

                  <p className={styles.heroSubtitle}>
                    Say goodbye to fake agents and surprise viewing fees. Discover inspected student
                    rooms, compare transparent semester rates, and connect directly with official hostel
                    administrations.
                  </p>

                  {/* 3. Search Bar with Autocomplete & Campus Chips */}
                  <div className={styles.searchSection}>
                    <SearchBar />
                  </div>

                  {/* Trust Stats Row */}
                  <div className={styles.trustStatsRow}>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>100%</span>
                      <span className={styles.statLabel}>Physically Inspected</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>GH₵ 0</span>
                      <span className={styles.statLabel}>Agent Viewing Fees</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>15+</span>
                      <span className={styles.statLabel}>University Campuses</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>4.9 / 5</span>
                      <span className={styles.statLabel}>Student Trust Rating</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. The SafHost Anti-Scam Promise & Core Value Props */}
              <section id="why-safhost" className={`${styles.sectionWrapper} ${styles.sectionWrapperAlt}`}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionBadge}>Safety First</span>
                  <h2 className={styles.sectionTitle}>Why Over 10,000 Students Choose SafHost</h2>
                  <p className={styles.sectionSubtitle}>
                    Finding safe, reliable student accommodation shouldn&apos;t feel like a gamble. We
                    protect your time, safety, and money at every step.
                  </p>
                </div>

                <div className={styles.trustGrid}>
                  <div className={styles.trustCard}>
                    <div className={`${styles.trustCardIcon} ${styles.blueIcon}`}>
                      <IoShieldCheckmark size={26} />
                    </div>
                    <h3 className={styles.trustCardTitle}>100% In-Person Verified</h3>
                    <p className={styles.trustCardDesc}>
                      Our campus field team personally visits every single hostel to verify room
                      photos, confirm active security, and check water & electricity reliability.
                    </p>
                  </div>

                  <div className={styles.trustCard}>
                    <div className={`${styles.trustCardIcon} ${styles.greenIcon}`}>
                      <IoCheckmarkCircle size={26} />
                    </div>
                    <h3 className={styles.trustCardTitle}>Zero Agent Exploitation</h3>
                    <p className={styles.trustCardDesc}>
                      Connect directly with registered hostel managers. Say goodbye to fraudulent middleman
                      charges, fake keys, or inflated non-refundable viewing fees.
                    </p>
                  </div>

                  <div className={styles.trustCard}>
                    <div className={`${styles.trustCardIcon} ${styles.purpleIcon}`}>
                      <IoLocationOutline size={26} />
                    </div>
                    <h3 className={styles.trustCardTitle}>Accurate Campus Proximity</h3>
                    <p className={styles.trustCardDesc}>
                      Know exact walking and shuttle times to your lecture halls. Never get trapped miles
                      away from campus during exam week.
                    </p>
                  </div>

                  <div className={styles.trustCard}>
                    <div className={`${styles.trustCardIcon} ${styles.amberIcon}`}>
                      <IoStar size={26} />
                    </div>
                    <h3 className={styles.trustCardTitle}>Authentic Student Reviews</h3>
                    <p className={styles.trustCardDesc}>
                      Read real feedback from current residents about WiFi speed, study environments,
                      management responsiveness, and water availability.
                    </p>
                  </div>
                </div>
              </section>

              {/* 5. Explore by Campus / University */}
              <section id="campuses" className={styles.sectionWrapper}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionBadge}>Top Institutions</span>
                  <h2 className={styles.sectionTitle}>Explore Hostels by University Campus</h2>
                  <p className={styles.sectionSubtitle}>
                    Select your institution to instantly discover verified accommodation within walking
                    distance.
                  </p>
                </div>

                <div className={styles.campusGrid}>
                  {campusList.map((campus, idx) => (
                    <Link
                      key={idx}
                      href={`/hostels?search=${encodeURIComponent(campus.name)}`}
                      className={styles.campusCard}
                    >
                      <div className={styles.campusIconBadge}>
                        <IoSchoolOutline size={22} />
                      </div>
                      <h3 className={styles.campusName}>{campus.name}</h3>
                      <p className={styles.campusLocation}>
                        <IoLocationOutline size={14} />
                        <span>{campus.city}</span>
                      </p>
                      <span className={styles.campusActionText}>
                        Browse Hostels <IoArrowForward size={12} />
                      </span>
                    </Link>
                  ))}
                </div>
              </section>

              {/* 6. Featured & Verified Hostels Showcase */}
              <section id="preview" className={`${styles.sectionWrapper} ${styles.sectionWrapperAlt}`}>
                <div className={styles.hostelHeaderRow}>
                  <div>
                    <span className={styles.sectionBadge}>Featured Listings</span>
                    <h2 className={styles.sectionTitle}>Featured & Verified Hostels</h2>
                    <p className={styles.sectionSubtitle}>
                      Top-rated student housing currently accepting reservations for next semester.
                    </p>
                  </div>
                  <Link href="/hostels" className={styles.seeAllLink}>
                    <span>View all hostels</span>
                    <IoArrowForward size={14} />
                  </Link>
                </div>

                <div className={styles.hostelGrid}>
                  {hostelsError && (
                    <div className={styles.errorState}>
                      <p className={styles.errorMessage}>
                        Unable to load featured hostels. Please check your internet connection or browse
                        our catalog.
                      </p>
                    </div>
                  )}

                  {!hostelsError && previewHostels.length === 0 && (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyMessage}>
                        New hostel listings are currently undergoing campus verification. Check back
                        shortly!
                      </p>
                    </div>
                  )}

                  {!hostelsError &&
                    previewHostels.map((hostel) => (
                      <HostelPreviewCard
                        key={hostel.id}
                        id={hostel.id}
                        name={hostel.name}
                        price={hostel.price}
                        rating={hostel.rating}
                        distance={hostel.distance}
                        image={hostel.image}
                        schoolName={hostel.schoolName}
                        amenities={hostel.amenities}
                      />
                    ))}
                </div>
              </section>

              {/* 7. How SafHost Works */}
              <section id="how-it-works" className={styles.sectionWrapper}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionBadge}>Simple & Fast</span>
                  <h2 className={styles.sectionTitle}>How SafHost Works</h2>
                  <p className={styles.sectionSubtitle}>
                    Securing your ideal room on or off campus is straightforward, safe, and takes just a
                    few minutes.
                  </p>
                </div>

                <div className={styles.stepsGrid}>
                  <div className={styles.stepCard}>
                    <div className={styles.stepTopRow}>
                      <div className={styles.stepIconCircle}>
                        <IoSchoolOutline size={24} />
                      </div>
                      <span className={styles.stepBadgeNumber}>01</span>
                    </div>
                    <h3 className={styles.stepTitle}>Pick Your Campus</h3>
                    <p className={styles.stepDescription}>
                      Search by your university or faculty to view hostels organized by distance,
                      amenities, and budget.
                    </p>
                  </div>

                  <div className={styles.stepCard}>
                    <div className={styles.stepTopRow}>
                      <div className={styles.stepIconCircle}>
                        <IoEyeOutline size={24} />
                      </div>
                      <span className={styles.stepBadgeNumber}>02</span>
                    </div>
                    <h3 className={styles.stepTitle}>Tour & Compare</h3>
                    <p className={styles.stepDescription}>
                      Browse genuine room photographs, check water and generator backup, and inspect
                      transparent semester pricing without paying any viewing fees.
                    </p>
                  </div>

                  <div className={styles.stepCard}>
                    <div className={styles.stepTopRow}>
                      <div className={styles.stepIconCircle}>
                        <IoCheckmarkCircle size={24} />
                      </div>
                      <span className={styles.stepBadgeNumber}>03</span>
                    </div>
                    <h3 className={styles.stepTitle}>Connect & Reserve</h3>
                    <p className={styles.stepDescription}>
                      Get direct access to official hostel management phone and WhatsApp lines to confirm
                      room availability and lock in your reservation.
                    </p>
                  </div>
                </div>
              </section>

              {/* 8. Anti-Scam Student Guarantee Banner */}
              <section className={styles.sectionWrapper}>
                <div className={styles.guaranteeBanner}>
                  <div className={styles.guaranteeContent}>
                    <div className={styles.guaranteeBadge}>
                      <IoShieldCheckmark size={14} />
                      <span>SafHost Student Protection</span>
                    </div>
                    <h2 className={styles.guaranteeTitle}>Tired of Fake Hostel Agents?</h2>
                    <p className={styles.guaranteeText}>
                      We created SafHost because Ghanaian university students lose millions every year to
                      predatory roadside agents and scam booking numbers. On SafHost, every listed property
                      is physically verified with management identity authenticated.
                    </p>
                  </div>
                  <div className={styles.guaranteePoints}>
                    <div className={styles.guaranteePoint}>
                      <IoCheckmarkCircle className={styles.guaranteePointIcon} size={20} />
                      <span>Verified Landlord & Manager Contact</span>
                    </div>
                    <div className={styles.guaranteePoint}>
                      <IoCheckmarkCircle className={styles.guaranteePointIcon} size={20} />
                      <span>Zero Viewing Fees Policy</span>
                    </div>
                    <div className={styles.guaranteePoint}>
                      <IoCheckmarkCircle className={styles.guaranteePointIcon} size={20} />
                      <span>Accurate Facility & Utility Disclosures</span>
                    </div>
                    <div className={styles.guaranteePoint}>
                      <IoCheckmarkCircle className={styles.guaranteePointIcon} size={20} />
                      <span>Free Support & Safety Assistance</span>
                    </div>
                  </div>
                </div>

                {/* 9. Student Testimonials */}
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionBadge}>Student Stories</span>
                  <h2 className={styles.sectionTitle}>Trusted by Students Across Ghana</h2>
                </div>

                <div className={styles.testimonialGrid}>
                  <div className={styles.testimonialCard}>
                    <div>
                      <div className={styles.testimonialStars}>
                        {[...Array(5)].map((_, i) => (
                          <IoStar key={i} size={16} />
                        ))}
                      </div>
                      <p className={styles.testimonialQuote}>
                        &ldquo;SafHost saved me from getting scammed by street agents near Legon gate. Found a
                        clean, quiet 2-in-a-room in Ayensu within 48 hours. Zero stress!&rdquo;
                      </p>
                    </div>
                    <div className={styles.testimonialAuthor}>
                      <div className={styles.authorAvatar}>KA</div>
                      <div>
                        <p className={styles.authorName}>Kwabena Asante</p>
                        <p className={styles.authorCampus}>Level 300, UG Legon</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.testimonialCard}>
                    <div>
                      <div className={styles.testimonialStars}>
                        {[...Array(5)].map((_, i) => (
                          <IoStar key={i} size={16} />
                        ))}
                      </div>
                      <p className={styles.testimonialQuote}>
                        &ldquo;The distance indicator is spot on. I knew exactly how long my walk to the
                        engineering faculty would be before making any payment. Highly recommend.&rdquo;
                      </p>
                    </div>
                    <div className={styles.testimonialAuthor}>
                      <div className={styles.authorAvatar}>AM</div>
                      <div>
                        <p className={styles.authorName}>Ama Mensah</p>
                        <p className={styles.authorCampus}>Level 200, KNUST</p>
                      </div>
                    </div>
                  </div>

                  <div className={styles.testimonialCard}>
                    <div>
                      <div className={styles.testimonialStars}>
                        {[...Array(5)].map((_, i) => (
                          <IoStar key={i} size={16} />
                        ))}
                      </div>
                      <p className={styles.testimonialQuote}>
                        &ldquo;Direct manager contact with no middleman asking for 100 GHS viewing fee. It is
                        about time someone built a real solution for students in Accra.&rdquo;
                      </p>
                    </div>
                    <div className={styles.testimonialAuthor}>
                      <div className={styles.authorAvatar}>EK</div>
                      <div>
                        <p className={styles.authorName}>Emmanuel Kotey</p>
                        <p className={styles.authorCampus}>Level 400, UPSA</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 10. Hostel Manager / Owner Partner Banner */}
                <div className={styles.managerBanner}>
                  <div className={styles.managerContent}>
                    <h3 className={styles.managerTitle}>Are you a Hostel Owner or Manager?</h3>
                    <p className={styles.managerSubtitle}>
                      Fill your rooms quickly with verified, responsible students. Join hundreds of
                      properties partnered with SafHost for seamless bookings.
                    </p>
                  </div>
                  <Link href="/support" className={styles.managerCtaButton}>
                    <span>List Your Property</span>
                    <IoArrowForward size={16} />
                  </Link>
                </div>
              </section>

              {/* 11. Frequently Asked Questions */}
              <section id="faqs" className={`${styles.sectionWrapper} ${styles.sectionWrapperAlt}`}>
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionBadge}>Got Questions?</span>
                  <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                  <p className={styles.sectionSubtitle}>
                    Everything you need to know about finding and securing accommodation on SafHost.
                  </p>
                </div>

                <div className={styles.faqSection}>
                  <FaqAccordion />
                </div>
              </section>
            </main>

            {/* 12. Modern Multi-Column Footer */}
            <footer className={styles.footer}>
              <div className={styles.footerInner}>
                <div className={styles.footerTopGrid}>
                  <div className={styles.footerBrandCol}>
                    <Image
                      src="/20260101_2143_SafHostel Logo_simple_compose_01kdxr7e9gfrvrqba7hb1811ghjhvh.png"
                      alt="SafHost Logo"
                      width={120}
                      height={38}
                      className={styles.footerLogo}
                    />
                    <p className={styles.footerTagline}>
                      Ghana&apos;s verified student accommodation platform. Direct manager connections, zero
                      scam agents, and 100% physically inspected rooms.
                    </p>
                    <div className={styles.socialIcons}>
                      <a
                        href="https://wa.me/233200000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialBtn}
                        aria-label="WhatsApp Support"
                      >
                        <IoLogoWhatsapp size={20} />
                      </a>
                      <a
                        href="https://tiktok.com/@safhost"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialBtn}
                        aria-label="TikTok"
                      >
                        <IoLogoTiktok size={20} />
                      </a>
                      <a
                        href="https://instagram.com/safhost"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialBtn}
                        aria-label="Instagram"
                      >
                        <IoLogoInstagram size={20} />
                      </a>
                    </div>
                  </div>

                  <div>
                    <h4 className={styles.footerColTitle}>Campuses</h4>
                    <ul className={styles.footerLinks}>
                      <li>
                        <Link href="/hostels?search=University+of+Ghana" className={styles.footerLink}>
                          UG Legon
                        </Link>
                      </li>
                      <li>
                        <Link href="/hostels?search=KNUST" className={styles.footerLink}>
                          KNUST Kumasi
                        </Link>
                      </li>
                      <li>
                        <Link href="/hostels?search=UPSA" className={styles.footerLink}>
                          UPSA Accra
                        </Link>
                      </li>
                      <li>
                        <Link href="/hostels?search=UCC" className={styles.footerLink}>
                          UCC Cape Coast
                        </Link>
                      </li>
                      <li>
                        <Link href="/hostels?search=ATU" className={styles.footerLink}>
                          ATU Accra
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className={styles.footerColTitle}>Quick Links</h4>
                    <ul className={styles.footerLinks}>
                      <li>
                        <Link href="/hostels" className={styles.footerLink}>
                          Browse All Hostels
                        </Link>
                      </li>
                      <li>
                        <Link href="/hostels/map" className={styles.footerLink}>
                          Interactive Campus Map
                        </Link>
                      </li>
                      <li>
                        <Link href="/compare" className={styles.footerLink}>
                          Compare Hostels
                        </Link>
                      </li>
                      <li>
                        <Link href="/support" className={styles.footerLink}>
                          List Your Property
                        </Link>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className={styles.footerColTitle}>Safety & Help</h4>
                    <ul className={styles.footerLinks}>
                      <li>
                        <Link href="/help" className={styles.footerLink}>
                          Help Center
                        </Link>
                      </li>
                      <li>
                        <Link href="/feedback" className={styles.footerLink}>
                          Report a Suspicious Agent
                        </Link>
                      </li>
                      <li>
                        <Link href="/support" className={styles.footerLink}>
                          Contact Student Support
                        </Link>
                      </li>
                      <li>
                        <Link href="/auth/login" className={styles.footerLink}>
                          Student Login
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className={styles.footerBottomRow}>
                  <p>© {new Date().getFullYear()} SafHost Technologies. All rights reserved.</p>
                  <div className={styles.footerCountryBadge}>
                    <span>🇬🇭 Crafted for university students in Ghana</span>
                  </div>
                </div>
              </div>
            </footer>
          </div>

          {/* Sticky Floating Mobile Bar */}
          <BottomBar />
        </div>
      </LandingPageClient>
    </AuthProvider>
  )
}
