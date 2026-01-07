'use server'

import { cache } from 'react'
import { createClient } from '../supabase/server'
import { isAdmin } from '../auth/middleware'

export type ReportFilter = 'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'

/**
 * Get all reports (admin only)
 * Uses React cache() for request deduplication
 */
export const getReports = cache(async (filter: ReportFilter = 'all'): Promise<{
  data: any[] | null
  error: string | null
}> => {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { data: null, error: 'Admin access required' }
    }

    const supabase = await createClient()
    let query = supabase
      .from('reports')
      .select(`
        *,
        hostel:hostels(id, name),
        review:reviews(id, comment)
      `)
      .order('created_at', { ascending: false })
    
    if (filter !== 'all') {
      query = query.eq('status', filter)
    }
    
    const { data, error } = await query
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data || [], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch reports'
    }
  }
})

/**
 * Update report status
 */
export async function updateReportStatus(
  reportId: string,
  newStatus: string,
  adminResponse?: string
): Promise<{
  error: string | null
}> {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { error: 'Admin access required' }
    }

    const { getUser } = await import('../auth')
    const user = await getUser()
    
    const supabase = await createClient()
    const updateData: any = {
      status: newStatus,
      admin_id: user?.id || null,
    }
    
    if (adminResponse) {
      updateData.admin_response = adminResponse
    }
    
    const { error } = await supabase
      .from('reports')
      .update(updateData)
      .eq('id', reportId)
    
    if (error) {
      return { error: error.message }
    }
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update report'
    }
  }
}
