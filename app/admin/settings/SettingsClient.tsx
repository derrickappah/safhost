'use client'

import { useState } from 'react'
import { updateAppSetting } from '@/lib/admin/settings'
import styles from './page.module.css'

interface SettingsClientProps {
  initialAdvertisementEnabled: boolean
}

export default function SettingsClient({ initialAdvertisementEnabled }: SettingsClientProps) {
  const [advertisementEnabled, setAdvertisementEnabled] = useState(initialAdvertisementEnabled)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleToggleAdvertisement = async (enabled: boolean) => {
    setLoading(true)
    setMessage(null)
    
    try {
      const { error } = await updateAppSetting('advertisement_enabled', enabled)
      
      if (error) {
        setMessage({ type: 'error', text: error })
        // Revert the toggle on error
        setAdvertisementEnabled(!enabled)
      } else {
        setAdvertisementEnabled(enabled)
        setMessage({ 
          type: 'success', 
          text: `Advertisement section ${enabled ? 'enabled' : 'disabled'} successfully` 
        })
        // Clear message after 3 seconds
        setTimeout(() => setMessage(null), 3000)
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update setting' 
      })
      setAdvertisementEnabled(!enabled)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Advertisement Setting */}
      <div className={styles.settingItem}>
        <div className={styles.settingInfo}>
          <h3 className={styles.settingTitle}>
            Advertisement Section
          </h3>
          <p className={styles.settingDescription}>
            Show or hide the advertisement tab in the bottom navigation bar
          </p>
        </div>
        <label className={styles.toggleWrapper}>
          <input
            type="checkbox"
            checked={advertisementEnabled}
            onChange={(e) => handleToggleAdvertisement(e.target.checked)}
            disabled={loading}
            className={styles.toggleInput}
          />
          <span className={`${styles.toggleSlider} ${advertisementEnabled ? styles.toggleSliderActive : ''} ${loading ? styles.toggleSliderDisabled : ''}`}>
            <span className={`${styles.toggleThumb} ${advertisementEnabled ? styles.toggleThumbActive : ''}`} />
          </span>
        </label>
      </div>

      {/* Message */}
      {message && (
        <div className={`${styles.message} ${message.type === 'success' ? styles.messageSuccess : styles.messageError}`}>
          {message.text}
        </div>
      )}
    </div>
  )
}
