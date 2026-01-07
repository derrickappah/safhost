import styles from './page.module.css'

export default function RecommendationsSkeleton() {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Recommended for You</h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Based on your viewing history
        </p>
      </div>
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading recommendations...</p>
      </div>
    </section>
  )
}
