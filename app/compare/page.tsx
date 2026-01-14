import { getHostelById, type Hostel } from '@/lib/actions/hostels'
import ComparePageClient from './ComparePageClient'

const MAX_COMPARE = 4

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  // Middleware handles auth/subscription checks
  const { ids } = await searchParams
  const initialIds = ids?.split(',').filter(Boolean) || []

  if (initialIds.length === 0) {
    return <ComparePageClient initialHostels={[]} initialIds={[]} />
  }

  // Load hostel data on the server
  const hostelResults = await Promise.all(
    initialIds.slice(0, MAX_COMPARE).map(async (id) => {
      const result = await getHostelById(id).catch(() => ({ data: null, error: null }))
      return result.data
    })
  )

  return <ComparePageClient initialHostels={hostelResults} initialIds={initialIds} />
}
