import { getViewedHistory } from '@/lib/actions/views'
import ViewedPageClient from './ViewedPageClient'

export default async function ViewedPage() {
  // Middleware handles auth/subscription checks
  // Load initial data on the server
  const result = await getViewedHistory({
    limit: 20,
    offset: 0,
    sortBy: 'date_desc'
  }).catch(() => ({ data: [], total: 0, error: null }))

  const initialHostels = result.data || []
  const initialTotal = result.total || 0

  return <ViewedPageClient initialHostels={initialHostels} initialTotal={initialTotal} />
}
