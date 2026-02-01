import { getHostels, type HostelFilters } from '@/lib/actions/hostels'
import { areFavorited, removeFavorite } from '@/lib/actions/favorites'
import { hasActiveSubscription } from '@/lib/actions/subscriptions'
import { getProfile } from '@/lib/actions/profile'
import HostelsPageClient from './HostelsPageClient'

// Hostels page must be dynamic because it contains user-specific data (favorites, profile, subscription)
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    school?: string
    sortBy?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    distance?: string
    amenities?: string
    roomTypes?: string
    gender?: string
    available?: string
  }>
}

export default async function HostelsPage({ searchParams }: PageProps) {
  // Require active subscription
  // No longer requiring subscription to browse, only to view contact details
  // await requireSubscription()
  const params = await searchParams

  // Parse filters from URL
  const filters: HostelFilters = {
    schoolId: params.school || undefined,
    search: params.search || undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    maxDistance: params.distance ? Number(params.distance) : undefined,
    amenities: params.amenities ? params.amenities.split(',') : undefined,
    roomTypes: params.roomTypes ? params.roomTypes.split(',') : undefined,
    genderRestriction: params.gender || undefined,
    isAvailable: params.available !== undefined ? params.available === 'true' : undefined,
    sortBy: (params.sortBy as any) || 'newest'
  }

  // Load hostels, favorites, profile, and subscription in parallel
  const [hostelsResult, favoritedResult, profileResult, hasSubscription] = await Promise.all([
    getHostels(filters).catch(() => ({ data: [], error: null })),
    areFavorited([]).catch(() => new Set<string>()), // Will be updated with actual IDs
    getProfile().catch(() => ({ data: null, error: null })),
    hasActiveSubscription().catch(() => false)
  ])

  const hostels = hostelsResult.data || []
  const favoritedSet = favoritedResult instanceof Set ? favoritedResult : new Set<string>()
  const defaultSchoolId = profileResult.data?.school_id || null

  // Get favorites for loaded hostels
  const hostelIds = hostels.map(h => h.id)
  const favorited = hostelIds.length > 0
    ? await areFavorited(hostelIds).catch(() => new Set<string>())
    : new Set<string>()

  const sortBy = (params.sortBy as any) || 'newest'

  // Parse initial filter values for FiltersSheet
  const initialFilters = {
    minPrice: params.minPrice ? Number(params.minPrice) : 0,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : 1000,
    distance: params.distance ? Number(params.distance) : 10,
    amenities: params.amenities ? params.amenities.split(',') : [],
    roomTypes: params.roomTypes ? params.roomTypes.split(',') : [],
    genderRestriction: params.gender || '',
    isAvailable: params.available !== undefined ? params.available === 'true' : undefined
  }

  return (
    <HostelsPageClient
      hostels={hostels}
      favorited={favorited}
      sortBy={sortBy}
      initialFilters={initialFilters}
      defaultSchoolId={defaultSchoolId}
      hasSubscription={hasSubscription}
    />
  )
}
