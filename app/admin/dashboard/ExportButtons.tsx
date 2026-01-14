'use client'

import { useState, useRef, useEffect } from 'react'
import { IoDownload, IoEllipsisVertical } from 'react-icons/io5'
import { exportAnalyticsToCSV, exportAnalyticsToJSON, exportViewLogsToCSV, exportContactLogsToCSV, exportViewLogsToExcel, exportContactLogsToExcel } from '@/lib/admin/export'
import styles from './ExportButtons.module.css'

export default function ExportButtons() {
  const [exporting, setExporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const handleExport = async (format: 'csv' | 'json') => {
    setExporting(true)
    setShowMenu(false)
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
    setShowMenu(false)
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
    <div className={styles.container} ref={menuRef}>
      {/* Desktop View */}
      <div className={styles.desktopButtons}>
        <div className={styles.buttonRow}>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting}
            className={styles.primaryButton}
          >
            <IoDownload size={16} />
            {exporting ? 'Exporting...' : 'Export Analytics CSV'}
          </button>
          <button
            onClick={() => handleExport('json')}
            disabled={exporting}
            className={styles.secondaryButton}
          >
            <IoDownload size={16} />
            {exporting ? 'Exporting...' : 'Export Analytics JSON'}
          </button>
        </div>
        <div className={styles.buttonRow}>
          <button
            onClick={() => handleExportLogs('view', 'csv')}
            disabled={exporting}
            className={styles.tertiaryButton}
          >
            View Logs CSV
          </button>
          <button
            onClick={() => handleExportLogs('contact', 'csv')}
            disabled={exporting}
            className={styles.tertiaryButton}
          >
            Contact Logs CSV
          </button>
          <button
            onClick={() => handleExportLogs('view', 'excel')}
            disabled={exporting}
            className={styles.tertiaryButton}
          >
            View Logs Excel
          </button>
          <button
            onClick={() => handleExportLogs('contact', 'excel')}
            disabled={exporting}
            className={styles.tertiaryButton}
          >
            Contact Logs Excel
          </button>
        </div>
      </div>

      {/* Mobile View */}
      <div className={styles.mobileButtons}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={exporting}
          className={styles.menuButton}
          aria-label="Export options"
          aria-expanded={showMenu}
        >
          <IoEllipsisVertical size={20} />
        </button>
        {showMenu && (
          <div className={styles.menu}>
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className={styles.menuItem}
            >
              <IoDownload size={16} />
              Analytics CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={exporting}
              className={styles.menuItem}
            >
              <IoDownload size={16} />
              Analytics JSON
            </button>
            <div className={styles.menuDivider} />
            <button
              onClick={() => handleExportLogs('view', 'csv')}
              disabled={exporting}
              className={styles.menuItem}
            >
              View Logs CSV
            </button>
            <button
              onClick={() => handleExportLogs('contact', 'csv')}
              disabled={exporting}
              className={styles.menuItem}
            >
              Contact Logs CSV
            </button>
            <button
              onClick={() => handleExportLogs('view', 'excel')}
              disabled={exporting}
              className={styles.menuItem}
            >
              View Logs Excel
            </button>
            <button
              onClick={() => handleExportLogs('contact', 'excel')}
              disabled={exporting}
              className={styles.menuItem}
            >
              Contact Logs Excel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
