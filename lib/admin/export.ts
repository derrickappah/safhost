'use server'

import { generateAnalytics } from '../analytics/generate'
import { getViewLogs, getContactLogs, LogFilters } from './logs'

/**
 * Export analytics to CSV format
 */
export async function exportAnalyticsToCSV(): Promise<{
  data: string | null
  error: string | null
}> {
  try {
    const { data: analytics, error } = await generateAnalytics()
    
    if (error || !analytics) {
      return { data: null, error: error || 'Failed to generate analytics' }
    }
    
    // Create CSV content
    const rows: string[] = []
    
    // Header
    rows.push('Metric,Value')
    
    // Basic stats
    rows.push(`Total Hostels,${analytics.totalHostels}`)
    rows.push(`Total Schools,${analytics.totalSchools}`)
    rows.push(`Active Subscriptions,${analytics.activeSubscriptions}`)
    rows.push(`Total Revenue (GHS),${analytics.totalRevenue.toFixed(2)}`)
    rows.push(`Hostel Views,${analytics.hostelViews}`)
    rows.push(`Total Contacts,${analytics.totalContacts || 0}`)
    rows.push(`Reviews Count,${analytics.reviewsCount}`)
    
    // Revenue per school
    rows.push('')
    rows.push('Revenue per School')
    rows.push('School Name,Revenue (GHS)')
    analytics.revenuePerSchool.forEach(item => {
      rows.push(`${item.schoolName},${(item.revenue / 100).toFixed(2)}`)
    })
    
    // Revenue per region
    rows.push('')
    rows.push('Revenue per Region')
    rows.push('Region,Revenue (GHS)')
    analytics.revenuePerRegion.forEach(item => {
      rows.push(`${item.region},${(item.revenue / 100).toFixed(2)}`)
    })
    
    return { data: rows.join('\n'), error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to export analytics',
    }
  }
}

/**
 * Export analytics to JSON format
 */
export async function exportAnalyticsToJSON(): Promise<{
  data: string | null
  error: string | null
}> {
  try {
    const { data: analytics, error } = await generateAnalytics()
    
    if (error || !analytics) {
      return { data: null, error: error || 'Failed to generate analytics' }
    }
    
    return { data: JSON.stringify(analytics, null, 2), error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to export analytics',
    }
  }
}

/**
 * Export view logs to CSV
 */
export async function exportViewLogsToCSV(filters: LogFilters = {}): Promise<{
  data: string | null
  error: string | null
}> {
  try {
    const { data: logs, error } = await getViewLogs({ ...filters, limit: 10000 })
    
    if (error || !logs) {
      return { data: null, error: error || 'Failed to fetch view logs' }
    }
    
    const rows: string[] = []
    rows.push('Date,User Email,User ID,Hostel Name,Hostel ID,Subscription ID')
    
    logs.forEach(log => {
      const date = new Date(log.viewed_at).toISOString()
      const userEmail = log.user?.email || ''
      const userId = log.user_id || ''
      const hostelName = log.hostel?.name || ''
      const hostelId = log.hostel_id || ''
      const subscriptionId = log.subscription_id || ''
      
      rows.push(`"${date}","${userEmail}","${userId}","${hostelName}","${hostelId}","${subscriptionId}"`)
    })
    
    return { data: rows.join('\n'), error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to export view logs',
    }
  }
}

/**
 * Export contact logs to CSV
 */
export async function exportContactLogsToCSV(filters: LogFilters = {}): Promise<{
  data: string | null
  error: string | null
}> {
  try {
    const { data: logs, error } = await getContactLogs({ ...filters, limit: 10000 })
    
    if (error || !logs) {
      return { data: null, error: error || 'Failed to fetch contact logs' }
    }
    
    const rows: string[] = []
    rows.push('Date,User Email,User ID,Hostel Name,Hostel ID,Subscription ID')
    
    logs.forEach(log => {
      const date = new Date(log.created_at).toISOString()
      const userEmail = log.user?.email || ''
      const userId = log.user_id || ''
      const hostelName = log.hostel?.name || ''
      const hostelId = log.hostel_id || ''
      const subscriptionId = log.subscription_id || ''
      
      rows.push(`"${date}","${userEmail}","${userId}","${hostelName}","${hostelId}","${subscriptionId}"`)
    })
    
    return { data: rows.join('\n'), error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to export contact logs',
    }
  }
}

/**
 * Export view logs to Excel (CSV format that Excel can open)
 */
export async function exportViewLogsToExcel(filters: LogFilters = {}): Promise<{
  data: string | null
  error: string | null
}> {
  // For now, return CSV format which Excel can open
  // In production, you might want to use a library like 'xlsx' for proper Excel format
  return exportViewLogsToCSV(filters)
}

/**
 * Export contact logs to Excel (CSV format that Excel can open)
 */
export async function exportContactLogsToExcel(filters: LogFilters = {}): Promise<{
  data: string | null
  error: string | null
}> {
  // For now, return CSV format which Excel can open
  // In production, you might want to use a library like 'xlsx' for proper Excel format
  return exportContactLogsToCSV(filters)
}
