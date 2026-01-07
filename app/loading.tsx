import styles from './page.module.css'

export default function Loading() {
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
