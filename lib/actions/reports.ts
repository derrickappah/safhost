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
    
    if (input.hostelId && input.reviewId) {
      return { data: null, error: 'Cannot report both a hostel and a review at the same time' }
    }
    
    if (!input.hostelId && !input.reviewId) {
      return { data: null, error: 'Either hostel_id or review_id is required' }
    }
    
    const reportData: any = {
      report_type: input.reportType,
      description: input.description || null,
    }
    
    if (input.hostelId) {
      reportData.hostel_id = input.hostelId
      reportData.review_id = null
    } else {
      reportData.review_id = input.reviewId
      reportData.hostel_id = null
    }
    
    if (user) {
      reportData.user_id = user.id
      reportData.subscription_id = null
    } else if (subscription) {
      reportData.subscription_id = subscription.id
      reportData.user_id = null
    } else {
      return { data: null, error: 'Authentication or active subscription required to report' }
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
