import styles from './page.module.css'
import Loader from '@/components/Loader'

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.scrollContent}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          paddingTop: '12px'
        }}>
          <Loader />
        </div>
      </div>
    </div>
  )
}
