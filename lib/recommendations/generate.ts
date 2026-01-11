'use server'

import { cache } from 'react'
import { createClient } from '../supabase/server'
import { getUser } from '../auth'
import { getActiveSubscription } from '../actions/subscriptions'

interface RecommendationScore {
  hostel: any
  score: number
  reasons: string[]
}

/**
 * Calculate similarity score between two hostels
 */
function calculateSimilarity(viewedHostel: any, candidateHostel: any): { score: number; reasons: string[] } {
  let score = 0
  const reasons: string[] = []
  
  // Location similarity (40% weight)
  if (viewedHostel.address && candidateHostel.address) {
    const viewedLocation = viewedHostel.address.toLowerCase()
    const candidateLocation = candidateHostel.address.toLowerCase()
    
    // Check if same area/neighborhood
    const viewedWords = viewedHostel.address.split(/[,\s]+/).filter((w: string) => w.length > 2)
    const candidateWords = candidateHostel.address.split(/[,\s]+/).filter((w: string) => w.length > 2)
    const commonWords = viewedWords.filter((w: string) => candidateWords.includes(w.toLowerCase()))
    
    if (commonWords.length > 0) {
      score += 40 * (commonWords.length / Math.max(viewedWords.length, candidateWords.length))
      reasons.push(`Similar location (${commonWords.join(', ')})`)
    }
  }
  
  // Price similarity (25% weight)
  if (viewedHostel.price_min && candidateHostel.price_min) {
    const priceDiff = Math.abs(viewedHostel.price_min - candidateHostel.price_min)
    const priceRange = Math.max(viewedHostel.price_min, candidateHostel.price_min)
    const priceSimilarity = 1 - (priceDiff / priceRange)
    
    if (priceSimilarity > 0.7) {
      score += 25 * priceSimilarity
      reasons.push(`Similar price range (GHS ${candidateHostel.price_min})`)
    }
  }
  
  // School proximity (15% weight)
  if (viewedHostel.school_id && candidateHostel.school_id) {
    if (viewedHostel.school_id === candidateHostel.school_id) {
      score += 15
      reasons.push('Same school area')
    }
  }
  
  // Amenities similarity (10% weight)
  if (viewedHostel.amenities && candidateHostel.amenities) {
    const viewedAmenities = new Set(viewedHostel.amenities)
    const candidateAmenities = new Set(candidateHostel.amenities)
    const commonAmenities = Array.from(viewedAmenities).filter((a: any) => candidateAmenities.has(a))
    
    if (commonAmenities.length > 0) {
      score += 10 * (commonAmenities.length / Math.max(viewedAmenities.size, candidateAmenities.size))
      reasons.push(`Similar amenities (${commonAmenities.slice(0, 2).join(', ')})`)
    }
  }
  
  // Rating similarity (10% weight)
  if (viewedHostel.rating && candidateHostel.rating) {
    const ratingDiff = Math.abs(viewedHostel.rating - candidateHostel.rating)
    if (ratingDiff <= 1) {
      score += 10 * (1 - ratingDiff)
      if (candidateHostel.rating >= 4) {
        reasons.push(`Highly rated (${candidateHostel.rating.toFixed(1)})`)
      }
    }
  }
  
  return { score, reasons }
}

/**
 * Generate recommendations based on viewed hostels
 * Uses React cache() for request deduplication
 * Note: This is a heavy operation, consider deferring with Suspense
 */
export const generateRecommendations = cache(async (limit: number = 10): Promise<{
  data: any[] | null
  error: string | null
}> => {
  const startTime = Date.now()
  try {
    const supabase = await createClient()
    const user = await getUser()
    const { data: subscription } = await getActiveSubscription()
    
    if (!user && !subscription) {
      return { data: [], error: null }
    }
    
    // Get user's viewed hostels (reduced limit for performance)
    let viewsQuery = supabase
      .from('hostel_views')
      .select(`
        hostel_id,
        hostel:hostels(
          id,
          school_id,
          name,
          address,
          price_min,
          price_max,
          amenities,
          rating
        )
      `)
      .order('viewed_at', { ascending: false })
      .limit(10)
    
    if (user) {
      viewsQuery = viewsQuery.eq('user_id', user.id)
    } else if (subscription) {
      viewsQuery = viewsQuery.eq('subscription_id', subscription.id)
    }
    
    const { data: views, error: viewsError } = await viewsQuery
    
    if (viewsError || !views || views.length === 0) {
      return { data: [], error: null }
    }
    
    // Get unique viewed hostel IDs
    const viewedHostelIds = Array.from(new Set(views.map((v: any) => v.hostel_id)))
    const viewedHostels = views
      .map((v: any) => v.hostel)
      .filter((h: any) => h !== null)
      .slice(0, 3) // Use top 3 most recently viewed for recommendations (reduced for performance)
    
    if (viewedHostels.length === 0) {
      return { data: [], error: null }
    }
    
    // Extract common patterns from viewed hostels for database-side filtering
    const viewedSchoolIds = new Set(viewedHostels.map((h: any) => h.school_id).filter(Boolean))
    const priceMins = viewedHostels.map((h: any) => h.price_min).filter(Boolean)
    const avgPrice = priceMins.length > 0 
      ? priceMins.reduce((a: number, b: number) => a + b, 0) / priceMins.length 
      : null
    const priceRange = priceMins.length > 0 
      ? Math.max(...priceMins) - Math.min(...priceMins)
      : null
    
    // Build optimized query with database-side filtering
    let candidateQuery = supabase
      .from('hostels')
      .select(`
        id,
        school_id,
        name,
        description,
        price_min,
        price_max,
        rating,
        review_count,
        distance,
        address,
        hostel_manager_name,
        hostel_manager_phone,
        latitude,
        longitude,
        images,
        amenities,
        room_types,
        is_active,
        created_at,
        updated_at,
        view_count,
        gender_restriction,
        is_available,
        featured,
        categories,
        school:schools(id, name, location)
      `)
      .eq('is_active', true)
    
    // Exclude viewed hostels - fetch more than needed and filter in JS if needed
    // (Supabase .not('id', 'in', ...) has syntax limitations, so we'll filter after)
    
    // Filter by school_id if user has viewed hostels from specific schools (most important filter)
    if (viewedSchoolIds.size > 0 && viewedSchoolIds.size <= 3) {
      // If user viewed hostels from 1-3 schools, prioritize those schools
      candidateQuery = candidateQuery.in('school_id', Array.from(viewedSchoolIds))
    }
    
    // Filter by price range (±50% of average viewed price)
    if (avgPrice && priceRange !== null) {
      const priceMin = Math.max(0, avgPrice - (avgPrice * 0.5))
      const priceMax = avgPrice + (avgPrice * 0.5)
      candidateQuery = candidateQuery
        .gte('price_min', priceMin)
        .lte('price_min', priceMax)
    }
    
    // Only get highly rated hostels (rating >= 3.5) to reduce candidates
    candidateQuery = candidateQuery.gte('rating', 3.5)
    
    // Order by rating and view_count, limit to top 50 candidates (reduced for performance)
    candidateQuery = candidateQuery
      .order('rating', { ascending: false })
      .order('view_count', { ascending: false, nullsFirst: false })
      .limit(50)
    
    const { data: allHostels, error: hostelsError } = await candidateQuery
    
    if (hostelsError || !allHostels || allHostels.length === 0) {
      return { data: [], error: null }
    }
    
    // Filter out viewed hostels (since .not('id', 'in', ...) has syntax limitations)
    const candidateHostels = allHostels.filter((h: any) => !viewedHostelIds.includes(h.id))
    
    if (candidateHostels.length === 0) {
      return { data: [], error: null }
    }
    
    // Calculate similarity scores for each candidate hostel
    const recommendations: RecommendationScore[] = []
    
    for (const candidateHostel of candidateHostels) {
      let totalScore = 0
      const allReasons: string[] = []
      
      // Calculate similarity with each viewed hostel and take the best match
      for (const viewedHostel of viewedHostels) {
        const { score, reasons } = calculateSimilarity(viewedHostel, candidateHostel)
        if (score > totalScore) {
          totalScore = score
          allReasons.length = 0
          allReasons.push(...reasons)
        }
      }
      
      if (totalScore > 20) { // Minimum threshold
        recommendations.push({
          hostel: candidateHostel,
          score: totalScore,
          reasons: allReasons
        })
      }
    }
    
    // Sort by score and return top recommendations
    recommendations.sort((a, b) => b.score - a.score)
    
    const topRecommendations = recommendations
      .slice(0, limit)
      .map(rec => ({
        ...rec.hostel,
        recommendationScore: rec.score,
        recommendationReasons: rec.reasons
      }))
    
    const totalTime = Date.now() - startTime
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Recommendations] Generated ${topRecommendations.length} recommendations in ${totalTime}ms`)
    }
    
    return { data: topRecommendations, error: null }
  } catch (error) {
    const totalTime = Date.now() - startTime
    if (process.env.NODE_ENV === 'development') {
      console.error(`[Recommendations] Failed after ${totalTime}ms:`, error)
    }
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to generate recommendations'
    }
  }
})
