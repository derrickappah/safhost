import { getContactedHistory } from '@/lib/actions/contacts'
import ContactedPageClient from './ContactedPageClient'

export default async function ContactedPage() {
  // Middleware handles auth/subscription checks
  // Load initial data on the server
  const result = await getContactedHistory({
    limit: 20,
    offset: 0,
    sortBy: 'date_desc'
  }).catch(() => ({ data: [], total: 0, error: null }))

  const initialHostels = result.data || []
  const initialTotal = result.total || 0

  return <ContactedPageClient initialHostels={initialHostels} initialTotal={initialTotal} />
}
