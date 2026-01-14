import styles from './page.module.css'
import Loader from '@/components/Loader'

export default function Loading() {
  return (
    <div className={styles.container}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh'
      }}>
        <Loader />
      </div>
    </div>
  )
}
