import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/middleware'
import { getAppSetting } from '@/lib/admin/settings'
import SettingsClient from './SettingsClient'
import styles from './page.module.css'

export default async function AdminSettingsPage() {
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/')
  }

  // Load current settings
  const advertisementEnabledResult = await getAppSetting('advertisement_enabled')
  const advertisementEnabled = advertisementEnabledResult.data !== null 
    ? (typeof advertisementEnabledResult.data === 'boolean' 
        ? advertisementEnabledResult.data 
        : advertisementEnabledResult.data === 'true' || advertisementEnabledResult.data === true)
    : true // Default to enabled

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Settings
      </h1>
      
      <div className={styles.settingsCard}>
        <h2 className={styles.sectionTitle}>
          Application Settings
        </h2>
        
        <SettingsClient initialAdvertisementEnabled={advertisementEnabled} />
      </div>
    </div>
  )
}
