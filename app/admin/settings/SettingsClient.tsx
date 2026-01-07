'use client'

import { useState } from 'react'
import { updateAppSetting } from '@/lib/admin/settings'

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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 0',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
            Advertisement Section
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b' }}>
            Show or hide the advertisement tab in the bottom navigation bar
          </p>
        </div>
        <label style={{
          position: 'relative',
          display: 'inline-block',
          width: '52px',
          height: '28px'
        }}>
          <input
            type="checkbox"
            checked={advertisementEnabled}
            onChange={(e) => handleToggleAdvertisement(e.target.checked)}
            disabled={loading}
            style={{
              opacity: 0,
              width: 0,
              height: 0
            }}
          />
          <span style={{
            position: 'absolute',
            cursor: loading ? 'not-allowed' : 'pointer',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: advertisementEnabled ? '#2563eb' : '#cbd5e1',
            borderRadius: '28px',
            transition: 'background-color 0.3s',
            opacity: loading ? 0.6 : 1
          }}>
            <span style={{
              position: 'absolute',
              content: '""',
              height: '22px',
              width: '22px',
              left: advertisementEnabled ? '26px' : '3px',
              bottom: '3px',
              backgroundColor: 'white',
              borderRadius: '50%',
              transition: 'left 0.3s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </span>
        </label>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: message.type === 'success' ? '#16a34a' : '#dc2626',
          fontSize: '14px'
        }}>
          {message.text}
        </div>
      )}
    </div>
  )
}
