'use server'

import { cache } from 'react'
import { createClient } from '../supabase/server'

export interface AnalyticsData {
  totalHostels: number
  totalSchools: number
  activeSubscriptions: number
  totalSubscriptions: number
  totalRevenue: number
  revenuePerSchool: Array<{ schoolId: string; schoolName: string; revenue: number }>
  revenuePerRegion: Array<{ region: string; revenue: number }>
  popularHostels: Array<{ hostelId: string; hostelName: string; views: number; contacts: number }>
  recentPayments: any[]
  subscriptionStatus: {
    active: number
    expired: number
    pending: number
    cancelled: number
  }
  hostelViews: number
  filtersUsed: number
  reviewsCount: number
  promoCodeUsage: Array<{ code: string; uses: number; discount: number }>
  viewsPerUser: Array<{ userId: string; userEmail: string; views: number; uniqueHostels: number }>
  contactsPerUser: Array<{ userId: string; userEmail: string; contacts: number; uniqueHostels: number }>
  viewsOverTime: Array<{ date: string; views: number; uniqueViews: number }>
  contactsOverTime: Array<{ date: string; contacts: number; uniqueContacts: number }>
  totalContacts: number
}

/**
 * Generate comprehensive analytics for admin dashboard
 * Uses React cache() for request deduplication
 */
export const generateAnalytics = cache(async (): Promise<{
  data: AnalyticsData | null
  error: string | null
}> => {
  try {
    const supabase = await createClient()
    
    // Basic counts - handle errors gracefully
    const [hostelsResult, schoolsResult, subscriptionsResult, paymentsResult] = await Promise.all([
      supabase.from('hostels').select('id', { count: 'exact', head: true }),
      supabase.from('schools').select('id', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('id', { count: 'exact', head: true }),
    ])
    
    const hostelsCount = hostelsResult.error ? { count: 0 } : hostelsResult
    const schoolsCount = schoolsResult.error ? { count: 0 } : schoolsResult
    const subscriptionsCount = subscriptionsResult.error ? { count: 0 } : subscriptionsResult
    const paymentsCount = paymentsResult.error ? { count: 0 } : paymentsResult
    
    // Active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
    
    // Total revenue (successful payments only)
    // Get all successful payments first to ensure accurate total
    const { data: allPayments, error: allPaymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'success')
    
    if (allPaymentsError) {
      console.error('Error fetching all payments:', allPaymentsError)
    }
    
    const totalRevenue = allPayments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0
    
    // Get payments with subscription and school data for breakdowns
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount, subscription:subscriptions(school:schools(id, name, location))')
      .eq('status', 'success')
    
    if (paymentsError) {
      console.error('Error fetching payments with subscriptions:', paymentsError)
    }
    
    // Revenue per school
    const revenuePerSchoolMap = new Map<string, { schoolName: string; revenue: number }>()
    payments?.forEach((payment: any) => {
      const school = payment.subscription?.school
      if (school) {
        const existing = revenuePerSchoolMap.get(school.id) || { schoolName: school.name, revenue: 0 }
        existing.revenue += Number(payment.amount || 0)
        revenuePerSchoolMap.set(school.id, existing)
      }
    })
    const revenuePerSchool = Array.from(revenuePerSchoolMap.entries()).map(([schoolId, data]) => ({
      schoolId,
      schoolName: data.schoolName,
      revenue: data.revenue,
    }))
    
    // Revenue per region (group by school location)
    const revenuePerRegionMap = new Map<string, number>()
    payments?.forEach((payment: any) => {
      const location = payment.subscription?.school?.location || 'Unknown'
      const region = location.split(',')[0] || 'Unknown' // Simple region extraction
      const existing = revenuePerRegionMap.get(region) || 0
      revenuePerRegionMap.set(region, existing + Number(payment.amount || 0))
    })
    const revenuePerRegion = Array.from(revenuePerRegionMap.entries()).map(([region, revenue]) => ({
      region,
      revenue,
    }))
    
    // Popular hostels (by views and contacts)
    const { data: hostelViews } = await supabase
      .from('hostel_views')
      .select('hostel_id')
    
    const { data: contactLogs } = await supabase
      .from('contact_logs')
      .select('hostel_id')
    
    const viewsMap = new Map<string, number>()
    const contactsMap = new Map<string, number>()
    
    hostelViews?.forEach((view: any) => {
      viewsMap.set(view.hostel_id, (viewsMap.get(view.hostel_id) || 0) + 1)
    })
    
    contactLogs?.forEach((log: any) => {
      contactsMap.set(log.hostel_id, (contactsMap.get(log.hostel_id) || 0) + 1)
    })
    
    // Get hostel details for popular ones
    const allHostelIds = new Set([...viewsMap.keys(), ...contactsMap.keys()])
    const popularHostelsData = await Promise.all(
      Array.from(allHostelIds).slice(0, 10).map(async (hostelId) => {
        const { data: hostel } = await supabase
          .from('hostels')
          .select('id, name')
          .eq('id', hostelId)
          .single()
        
        return {
          hostelId,
          hostelName: hostel?.name || 'Unknown',
          views: viewsMap.get(hostelId) || 0,
          contacts: contactsMap.get(hostelId) || 0,
        }
      })
    )
    
    const popularHostels = popularHostelsData
      .sort((a, b) => (b.views + b.contacts) - (a.views + a.contacts))
      .slice(0, 5)
    
    // Recent payments
    const { data: recentPayments } = await supabase
      .from('payments')
      .select('*, subscription:subscriptions(*)')
      .eq('status', 'success')
      .order('created_at', { ascending: false })
      .limit(10)
    
    // Subscription status breakdown
    const { data: subscriptionsByStatus } = await supabase
      .from('subscriptions')
      .select('status')
    
    const subscriptionStatus = {
      active: subscriptionsByStatus?.filter(s => s.status === 'active').length || 0,
      expired: subscriptionsByStatus?.filter(s => s.status === 'expired').length || 0,
      pending: subscriptionsByStatus?.filter(s => s.status === 'pending').length || 0,
      cancelled: subscriptionsByStatus?.filter(s => s.status === 'cancelled').length || 0,
    }
    
    // Total hostel views
    const { count: totalViews } = await supabase
      .from('hostel_views')
      .select('id', { count: 'exact', head: true })
    
    // Reviews count
    const { count: reviewsCount } = await supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
    
    // Promo code usage
    const { data: promoUsage } = await supabase
      .from('promo_code_usage')
      .select('promo_code_id, discount_amount, promo_code:promo_codes(code)')
    
    const promoUsageMap = new Map<string, { uses: number; discount: number }>()
    promoUsage?.forEach((usage: any) => {
      const code = usage.promo_code?.code || 'Unknown'
      const existing = promoUsageMap.get(code) || { uses: 0, discount: 0 }
      existing.uses += 1
      existing.discount += Number(usage.discount_amount || 0)
      promoUsageMap.set(code, existing)
    })
    
    const promoCodeUsage = Array.from(promoUsageMap.entries()).map(([code, data]) => ({
      code,
      uses: data.uses,
      discount: data.discount,
    }))
    
    // Views per user
    const { data: viewsWithUsers } = await supabase
      .from('hostel_views')
      .select('user_id, hostel_id, viewed_at')
      .not('user_id', 'is', null)
    
    const userViewsMap = new Map<string, { views: number; uniqueHostels: Set<string> }>()
    viewsWithUsers?.forEach((view: any) => {
      if (view.user_id) {
        const existing = userViewsMap.get(view.user_id) || { views: 0, uniqueHostels: new Set<string>() }
        existing.views += 1
        existing.uniqueHostels.add(view.hostel_id)
        userViewsMap.set(view.user_id, existing)
      }
    })
    
    // Get user emails for views per user
    const viewsPerUserData = await Promise.all(
      Array.from(userViewsMap.entries()).slice(0, 10).map(async ([userId, data]) => {
        const { data: user } = await supabase.auth.admin.getUserById(userId).catch(() => ({ data: { user: null } }))
        return {
          userId,
          userEmail: user?.user?.email || 'Unknown',
          views: data.views,
          uniqueHostels: data.uniqueHostels.size
        }
      })
    )
    const viewsPerUser = viewsPerUserData.sort((a, b) => b.views - a.views).slice(0, 5)
    
    // Contacts per user
    const { data: contactsWithUsers } = await supabase
      .from('contact_logs')
      .select('user_id, hostel_id, created_at')
      .not('user_id', 'is', null)
    
    const userContactsMap = new Map<string, { contacts: number; uniqueHostels: Set<string> }>()
    contactsWithUsers?.forEach((contact: any) => {
      if (contact.user_id) {
        const existing = userContactsMap.get(contact.user_id) || { contacts: 0, uniqueHostels: new Set<string>() }
        existing.contacts += 1
        existing.uniqueHostels.add(contact.hostel_id)
        userContactsMap.set(contact.user_id, existing)
      }
    })
    
    // Get user emails for contacts per user
    const contactsPerUserData = await Promise.all(
      Array.from(userContactsMap.entries()).slice(0, 10).map(async ([userId, data]) => {
        const { data: user } = await supabase.auth.admin.getUserById(userId).catch(() => ({ data: { user: null } }))
        return {
          userId,
          userEmail: user?.user?.email || 'Unknown',
          contacts: data.contacts,
          uniqueHostels: data.uniqueHostels.size
        }
      })
    )
    const contactsPerUser = contactsPerUserData.sort((a, b) => b.contacts - a.contacts).slice(0, 5)
    
    // Total contacts
    const { count: totalContacts } = await supabase
      .from('contact_logs')
      .select('id', { count: 'exact', head: true })
    
    // Views over time (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const { data: recentViews } = await supabase
      .from('hostel_views')
      .select('viewed_at, hostel_id')
      .gte('viewed_at', thirtyDaysAgo.toISOString())
    
    const viewsByDate = new Map<string, { views: number; uniqueHostels: Set<string> }>()
    recentViews?.forEach((view: any) => {
      const date = new Date(view.viewed_at).toISOString().split('T')[0]
      const existing = viewsByDate.get(date) || { views: 0, uniqueHostels: new Set<string>() }
      existing.views += 1
      existing.uniqueHostels.add(view.hostel_id)
      viewsByDate.set(date, existing)
    })
    
    const viewsOverTime = Array.from(viewsByDate.entries())
      .map(([date, data]) => ({
        date,
        views: data.views,
        uniqueViews: data.uniqueHostels.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    // Contacts over time (last 30 days)
    const { data: recentContacts } = await supabase
      .from('contact_logs')
      .select('created_at, hostel_id')
      .gte('created_at', thirtyDaysAgo.toISOString())
    
    const contactsByDate = new Map<string, { contacts: number; uniqueHostels: Set<string> }>()
    recentContacts?.forEach((contact: any) => {
      const date = new Date(contact.created_at).toISOString().split('T')[0]
      const existing = contactsByDate.get(date) || { contacts: 0, uniqueHostels: new Set<string>() }
      existing.contacts += 1
      existing.uniqueHostels.add(contact.hostel_id)
      contactsByDate.set(date, existing)
    })
    
    const contactsOverTime = Array.from(contactsByDate.entries())
      .map(([date, data]) => ({
        date,
        contacts: data.contacts,
        uniqueContacts: data.uniqueHostels.size
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    return {
      data: {
        totalHostels: hostelsCount.count || 0,
        totalSchools: schoolsCount.count || 0,
        activeSubscriptions: activeSubscriptions || 0,
        totalSubscriptions: subscriptionsCount.count || 0,
        totalRevenue: pesewasToGhs(totalRevenue),
        revenuePerSchool,
        revenuePerRegion,
        popularHostels,
        recentPayments: recentPayments || [],
        subscriptionStatus,
        hostelViews: totalViews || 0,
        filtersUsed: 0, // Would need to track this separately
        reviewsCount: reviewsCount || 0,
        promoCodeUsage,
        viewsPerUser,
        contactsPerUser,
        viewsOverTime,
        contactsOverTime,
        totalContacts: totalContacts || 0,
      },
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to generate analytics',
    }
  }
})

function pesewasToGhs(pesewas: number): number {
  return pesewas / 100
}
