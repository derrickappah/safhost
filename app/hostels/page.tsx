import { getHostels, type HostelFilters } from '@/lib/actions/hostels'
import { areFavorited } from '@/lib/actions/favorites'
import { requireSubscription } from '@/lib/access/guard'
import { getProfile } from '@/lib/actions/profile'
import HostelsPageClient from './HostelsPageClient'

// Enable ISR - revalidate every 10 minutes (600 seconds)
// Optimized for better performance while maintaining reasonable freshness
export const revalidate = 600

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
  await requireSubscription()
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

  // Load hostels, favorites, and profile in parallel
  const [hostelsResult, favoritedResult, profileResult] = await Promise.all([
    getHostels(filters).catch(() => ({ data: [], error: null })),
    areFavorited([]).catch(() => new Set<string>()), // Will be updated with actual IDs
    getProfile().catch(() => ({ data: null, error: null }))
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
    />
  )
}
