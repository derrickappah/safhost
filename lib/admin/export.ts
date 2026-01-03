'use server'

import { generateAnalytics } from '../analytics/generate'

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
