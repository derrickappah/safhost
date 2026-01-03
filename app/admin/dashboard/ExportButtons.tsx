'use client'

import { useState } from 'react'
import { exportAnalyticsToCSV, exportAnalyticsToJSON } from '@/lib/admin/export'

export default function ExportButtons() {
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true)
    try {
      const { data, error } = format === 'csv' 
        ? await exportAnalyticsToCSV()
        : await exportAnalyticsToJSON()
      
      if (error) {
        alert('Export failed: ' + error)
        return
      }
      
      if (data) {
        const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={() => handleExport('csv')}
        disabled={exporting}
        style={{
          padding: '8px 16px',
          backgroundColor: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: exporting ? 'not-allowed' : 'pointer',
          opacity: exporting ? 0.6 : 1,
        }}
      >
        {exporting ? 'Exporting...' : 'Export CSV'}
      </button>
      <button
        onClick={() => handleExport('json')}
        disabled={exporting}
        style={{
          padding: '8px 16px',
          backgroundColor: '#64748b',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 600,
          cursor: exporting ? 'not-allowed' : 'pointer',
          opacity: exporting ? 0.6 : 1,
        }}
      >
        {exporting ? 'Exporting...' : 'Export JSON'}
      </button>
    </div>
  )
}
