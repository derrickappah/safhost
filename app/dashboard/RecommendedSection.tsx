'use client'

import Link from 'next/link'
import { IoArrowForward, IoSparklesOutline, IoCompassOutline } from 'react-icons/io5'
import styles from './page.module.css'
import { useInstantNavigation } from '@/lib/hooks/useInstantNavigation'
import Loader from '@/components/Loader'
import DashboardHostelCard, { HostelCardData } from './DashboardHostelCard'

export interface RecommendedHostel extends HostelCardData {
  recommendationReasons?: string[]
}

interface RecommendedSectionProps {
  recommendedHostels: RecommendedHostel[]
  loading?: boolean
}

export default function RecommendedSection({ recommendedHostels, loading }: RecommendedSectionProps) {
  const { navigate } = useInstantNavigation()

  if (loading) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recommended for You</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Based on your viewing history
          </p>
        </div>
        <div style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Loader />
        </div>
      </section>
    )
  }

  if (recommendedHostels.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Recommended for You</h2>
            <span className={styles.sectionSubtitle}>
              Personalized accommodation picks
            </span>
          </div>
        </div>
        <div className={styles.emptyStateCard}>
          <div className={styles.emptyStateIcon}>
            <IoSparklesOutline size={28} />
          </div>
          <p className={styles.emptyStateTitle}>No recommendations yet</p>
          <p className={styles.emptyStateSubtitle}>
            Explore and view hostels around your campus to get tailored recommendations.
          </p>
          <button
            type="button"
            className={styles.emptyStateCta}
            onClick={() => navigate('/hostels')}
          >
            <IoCompassOutline size={16} />
            <span>Browse Hostels</span>
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader} style={{ alignItems: 'flex-start' }}>
        <div>
          <h2 className={styles.sectionTitle}>Recommended for You</h2>
          <span className={styles.sectionSubtitle}>
            Based on your viewing history
          </span>
        </div>
        <Link href="/hostels" className={styles.seeAll} style={{ marginTop: '2px' }}>
          See All <IoArrowForward size={14} />
        </Link>
      </div>
      <div className={styles.hostelGrid}>
        {recommendedHostels.map((hostel) => (
          <DashboardHostelCard
            key={hostel.id}
            hostel={hostel}
            variant="grid"
          />
        ))}
      </div>
    </section>
  )
}
