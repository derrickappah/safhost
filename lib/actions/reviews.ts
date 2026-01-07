'use server'

import { cache } from 'react'
import { createClient } from '../supabase/server'
import { getUser } from '../auth'
import { getActiveSubscription } from './subscriptions'

export interface Review {
  id: string
  hostel_id: string
  user_id: string | null
  subscription_id: string | null
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  user?: {
    email: string
  }
}

export interface CreateReviewInput {
  hostelId: string
  rating: number
  comment?: string
}

/**
 * Get reviews for a hostel
 * Uses React cache() for request deduplication
 */
export const getHostelReviews = cache(async (hostelId: string): Promise<{
  data: Review[] | null
  error: string | null
}> => {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('hostel_id', hostelId)
      .order('created_at', { ascending: false })
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    // Fetch user emails for reviews that have user_id
    if (data && data.length > 0) {
      const userIds = data
        .filter(review => review.user_id)
        .map(review => review.user_id)
        .filter((id, index, self) => self.indexOf(id) === index) // unique IDs
      
      if (userIds.length > 0) {
        try {
          // Use a database function to get user emails
          const { data: userEmails, error: emailError } = await supabase.rpc('get_user_emails', {
            user_ids: userIds
          })
          
          if (emailError) {
            console.error('Error fetching user emails:', emailError)
            // Continue without user emails - reviews will show as anonymous
          } else if (userEmails && userEmails.length > 0) {
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
          // Continue without user emails - reviews will show as anonymous
        }
      }
    }
    
    return { data: data as Review[], error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch reviews'
    }
  }
})

/**
 * Get user's review for a hostel (if exists)
 * Uses React cache() for request deduplication
 */
export const getUserReview = cache(async (hostelId: string): Promise<{
  data: Review | null
  error: string | null
}> => {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { data: null, error: null } // No user, no review
    }
    
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('hostel_id', hostelId)
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No review found
        return { data: null, error: null }
      }
      return { data: null, error: error.message }
    }
    
    return { data: data as Review, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to fetch user review'
    }
  }
})

/**
 * Create a new review (requires authenticated user with active subscription)
 */
export async function createReview(input: CreateReviewInput): Promise<{
  data: Review | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user) {
      return { data: null, error: 'Authentication required to leave reviews' }
    }
    
    // Validate rating
    if (input.rating < 1 || input.rating > 5) {
      return { data: null, error: 'Rating must be between 1 and 5' }
    }
    
    // Try to get subscription for better error messages, but don't block if RLS will handle it
    // The RLS policy is the source of truth, so we'll let it enforce the check
    const { data: subscription } = await getActiveSubscription()
    
    // If we can't find a subscription via getActiveSubscription, still try the insert
    // RLS will block it if the user doesn't have an active subscription
    // This handles edge cases where RLS can see subscriptions but our query can't
    
    // For authenticated users, set user_id and leave subscription_id as NULL
    // The table constraint requires either user_id OR subscription_id, not both
    // The RLS policy will verify the user has an active subscription
    const reviewData: any = {
      hostel_id: input.hostelId,
      rating: input.rating,
      comment: input.comment || null,
      user_id: user.id, // For authenticated users, use user_id
      subscription_id: null // Leave NULL for authenticated users (constraint requirement)
    }
    
    // Attempt insert - RLS will enforce the policy
    // Policy allows if: user_id = auth.uid() OR subscription_id has active subscription
    const { data, error } = await supabase
      .from('reviews')
      .insert(reviewData)
      .select()
      .single()
    
    if (error) {
      // Check if it's an RLS policy violation
      if (error.code === '42501' || error.message.includes('policy') || error.message.includes('row-level security')) {
        // RLS blocked the insert - user doesn't have active subscription
        // Try to provide helpful error message by checking subscriptions
        const { data: anySubs, error: subQueryError } = await supabase
          .from('subscriptions')
          .select('id, status, expires_at, user_id, phone')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        console.error('RLS blocked review insert:', {
          userId: user.id,
          errorCode: error.code,
          errorMessage: error.message,
          subscriptionsFound: anySubs?.length || 0,
          subQueryError
        })
        
        if (anySubs && anySubs.length > 0) {
          const activeSubs = anySubs.filter(sub => sub.status === 'active')
          const now = new Date()
          
          if (activeSubs.length === 0) {
            return { data: null, error: `Your subscription status is "${anySubs[0].status}". Please contact support if you believe this is an error.` }
          }
          
          const nonExpiredSubs = activeSubs.filter(sub => {
            if (!sub.expires_at) return true
            return new Date(sub.expires_at) > now
          })
          
          if (nonExpiredSubs.length === 0) {
            return { data: null, error: 'Your subscription has expired. Please renew to continue leaving reviews.' }
          }
          
          // User has active, non-expired subscription but RLS blocked it
          // This might be a phone matching issue in the RLS policy
          return { 
            data: null, 
            error: 'Your subscription appears active, but the system cannot verify it. Please contact support or try refreshing your session.' 
          }
        }
        
        return { data: null, error: 'Active subscription required to leave reviews. Please ensure your subscription is active and not expired.' }
      }
      return { data: null, error: error.message }
    }
    
    return { data: data as Review, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to create review'
    }
  }
}

/**
 * Update a review
 */
export async function updateReview(
  reviewId: string,
  rating: number,
  comment?: string
): Promise<{
  data: Review | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user?.id) {
      return { data: null, error: 'Authentication required' }
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return { data: null, error: 'Rating must be between 1 and 5' }
    }
    
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        comment: comment || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .eq('user_id', user.id) // Only allow updating own reviews
      .select()
      .single()
    
    if (error) {
      return { data: null, error: error.message }
    }
    
    return { data: data as Review, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to update review'
    }
  }
}

/**
 * Delete a review
 */
export async function deleteReview(reviewId: string): Promise<{
  error: string | null
}> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    
    if (!user?.id) {
      return { error: 'Authentication required' }
    }
    
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id) // Only allow deleting own reviews
    
    if (error) {
      return { error: error.message }
    }
    
    return { error: null }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete review'
    }
  }
}
