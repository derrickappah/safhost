import { getUser } from '@/lib/auth'
import { getNotifications } from '@/lib/notifications/get'
import { redirect } from 'next/navigation'
import NotificationsPageClient from './NotificationsPageClient'

export default async function NotificationsPage() {
  // Check authentication (middleware should handle this, but we need user object)
  const user = await getUser()
  if (!user) {
    redirect('/auth/login?redirect=/notifications')
  }

  // Load notifications on the server
  const result = await getNotifications(100).catch(() => ({ data: [], error: null }))
  const initialNotifications = result.data || []

  return <NotificationsPageClient initialNotifications={initialNotifications} />
}
