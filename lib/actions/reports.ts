'use server'

import { createClient } from '../supabase/server'
import { getUser } from '../auth'
import { getActiveSubscription } from './subscriptions'

export interface CreateReportInput {
  hostelId?: string
  reviewId?: string
  reportType: 'inappropriate' | 'spam' | 'fake' | 'other'
  description?: string
}

/**
 * Create a report
 */
export async function createReport(input: CreateReportInput): Promise<{
  data: any | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    const { data: subscription } = await getActiveSubscription()
    
    if (!input.hostelId && !input.reviewId) {
      return { data: null, error: 'Either hostel_id or review_id is required' }
    }
    
    const reportData: any = {
      report_type: input.reportType,
      description: input.description || null,
    }
    
    if (input.hostelId) {
      reportData.hostel_id = input.hostelId
    }
    
    if (input.reviewId) {
      reportData.review_id = input.reviewId
    }
    
    if (user) {
      reportData.user_id = user.id
    }
    
    if (subscription) {
      reportData.subscription_id = subscription.id
    }
    
    const { data, error } = await supabase
      .from('reports')
      .insert(reportData)
      .select()
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create report'
    }
  }
}
