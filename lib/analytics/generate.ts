'use server'

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
}

/**
 * Generate comprehensive analytics for admin dashboard
 */
export async function generateAnalytics(): Promise<{
  data: AnalyticsData | null
  error: string | null
}> {
  try {
    const supabase = await createClient()
    
    // Basic counts
    const [hostelsCount, schoolsCount, subscriptionsCount, paymentsCount] = await Promise.all([
      supabase.from('hostels').select('id', { count: 'exact', head: true }),
      supabase.from('schools').select('id', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('id', { count: 'exact', head: true }),
      supabase.from('payments').select('id', { count: 'exact', head: true }),
    ])
    
    // Active subscriptions
    const { count: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .gt('expires_at', new Date().toISOString())
    
    // Total revenue (successful payments only)
    // Get all successful payments first to ensure accurate total
    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'success')
    
    const totalRevenue = allPayments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0
    
    // Get payments with subscription and school data for breakdowns
    const { data: payments } = await supabase
      .from('payments')
      .select('amount, subscription:subscriptions(school:schools(id, name, location))')
      .eq('status', 'success')
    
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
      },
      error: null,
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to generate analytics',
    }
  }
}

function pesewasToGhs(pesewas: number): number {
  return pesewas / 100
}
