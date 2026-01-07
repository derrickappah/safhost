import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/middleware'
import { getAppSetting } from '@/lib/admin/settings'
import SettingsClient from './SettingsClient'

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
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '32px' }}>
        Settings
      </h1>
      
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
          Application Settings
        </h2>
        
        <SettingsClient initialAdvertisementEnabled={advertisementEnabled} />
      </div>
    </div>
  )
}
