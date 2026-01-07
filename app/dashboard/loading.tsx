import styles from './page.module.css'

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.scrollContent}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          paddingTop: '12px',
          fontSize: '16px',
          color: 'var(--color-text-secondary)'
        }}>
          Loading...
        </div>
      </div>
    </div>
  )
}
