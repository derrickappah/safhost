'use server'

import { cache } from 'react'
import { createClient } from '../supabase/server'
import { isAdmin } from '../auth/middleware'

export type ReviewFilter = 'all' | 'pending' | 'approved' | 'rejected'

export interface AdminReview {
  id: string
  hostel_id: string
  user_id: string | null
  subscription_id: string | null
  rating: number
  comment: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  hostel?: {
    id: string
    name: string
  }
  user?: {
    email: string
  }
}

/**
 * Get all reviews (admin only)
 * Uses React cache() for request deduplication
 */
export const getAdminReviews = cache(async (filter: ReviewFilter = 'all'): Promise<{
  data: AdminReview[] | null
  error: string | null
}> => {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { data: null, error: 'Admin access required' }
    }

    const supabase = await createClient()
    let query = supabase
      .from('reviews')
      .select(`
        *,
        hostel:hostels(id, name)
      `)
      .order('created_at', { ascending: false })
    
    if (filter !== 'all') {
      query = query.eq('status', filter)
    }
    
    const { data, error } = await query
    
    if (error) {
      return { data: null, error: error.message }
    }

    // Fetch user emails for reviews that have user_id
    if (data && data.length > 0) {
      const userIds = data
        .filter((review: any) => review.user_id)
        .map((review: any) => review.user_id)
        .filter((id: string, index: number, self: string[]) => self.indexOf(id) === index) // unique IDs
      
      if (userIds.length > 0) {
        try {
          // Use a database function to get user emails
          const { data: userEmails, error: emailError } = await supabase.rpc('get_user_emails', {
            user_ids: userIds
          })
          
          if (!emailError && userEmails && userEmails.length > 0) {
            // Create a map of user_id to email
            const emailMap = new Map(userEmails.map((u: any) => [u.id, u.email]))
            
            // Add email to each review
            data.forEach((review: any) => {
              if (review.user_id && emailMap.has(review.user_id)) {
                review.user = { email: emailMap.get(review.user_id) }
              }
            })
          }
        } catch (rpcError) {
          console.error('RPC call failed:', rpcError)
          // Continue without user emails
        }
      }
    }
    
    return { data: data as AdminReview[] || [], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch reviews'
    }
  }
})

/**
 * Update review status (approve/reject)
 */
export async function updateReviewStatus(
  reviewId: string,
  status: 'approved' | 'rejected'
): Promise<{
  error: string | null
}> {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return { error: 'Admin access required' }
    }

    const supabase = await createClient()
    const { error } = await supabase
      .from('reviews')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
    
    if (error) {
      return { error: error.message }
    }
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update review status'
    }
  }
}
