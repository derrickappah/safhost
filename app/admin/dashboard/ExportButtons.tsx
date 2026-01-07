'use client'

import { useState } from 'react'
import { exportAnalyticsToCSV, exportAnalyticsToJSON, exportViewLogsToCSV, exportContactLogsToCSV, exportViewLogsToExcel, exportContactLogsToExcel } from '@/lib/admin/export'

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

  const handleExportLogs = async (type: 'view' | 'contact', format: 'csv' | 'excel') => {
    setExporting(true)
    try {
      const { data, error } = type === 'view'
        ? (format === 'csv' ? await exportViewLogsToCSV({}) : await exportViewLogsToExcel({}))
        : (format === 'csv' ? await exportContactLogsToCSV({}) : await exportContactLogsToExcel({}))
      
      if (error) {
        alert('Export failed: ' + error)
        return
      }
      
      if (data) {
        const extension = format === 'excel' ? 'xlsx' : 'csv'
        const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-logs-${new Date().toISOString().split('T')[0]}.${extension}`
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
          {exporting ? 'Exporting...' : 'Export Analytics CSV'}
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
          {exporting ? 'Exporting...' : 'Export Analytics JSON'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#64748b' }}>
        <button
          onClick={() => handleExportLogs('view', 'csv')}
          disabled={exporting}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f3f4f6',
            color: '#1e293b',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: exporting ? 'not-allowed' : 'pointer',
            opacity: exporting ? 0.6 : 1,
          }}
        >
          View Logs CSV
        </button>
        <button
          onClick={() => handleExportLogs('contact', 'csv')}
          disabled={exporting}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f3f4f6',
            color: '#1e293b',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: exporting ? 'not-allowed' : 'pointer',
            opacity: exporting ? 0.6 : 1,
          }}
        >
          Contact Logs CSV
        </button>
        <button
          onClick={() => handleExportLogs('view', 'excel')}
          disabled={exporting}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f3f4f6',
            color: '#1e293b',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: exporting ? 'not-allowed' : 'pointer',
            opacity: exporting ? 0.6 : 1,
          }}
        >
          View Logs Excel
        </button>
        <button
          onClick={() => handleExportLogs('contact', 'excel')}
          disabled={exporting}
          style={{
            padding: '6px 12px',
            backgroundColor: '#f3f4f6',
            color: '#1e293b',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: exporting ? 'not-allowed' : 'pointer',
            opacity: exporting ? 0.6 : 1,
          }}
        >
          Contact Logs Excel
        </button>
      </div>
    </div>
  )
}
