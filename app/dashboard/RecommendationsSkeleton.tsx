import styles from './page.module.css'
import Loader from '@/components/Loader'

export default function RecommendationsSkeleton() {
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
