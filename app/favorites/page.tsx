import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import { requireSubscription } from '@/lib/access/guard'
import { getFavorites } from '@/lib/actions/favorites'
import FavoritesList from './FavoritesList'
import styles from './page.module.css'

// Revalidate every 60 seconds for fresh data
export const revalidate = 60

export default async function FavoritesPage() {
  // Check authentication
  const user = await getUser()
  if (!user) {
    redirect('/auth/login?redirect=/favorites')
  }

  // Require active subscription
  await requireSubscription()

  // Load favorites on the server
  const favoritesResult = await getFavorites().catch(() => ({ data: [], error: null }))
  const favorites = favoritesResult.data || []

  return (
    <div className={styles.container}>
      <FavoritesList initialFavorites={favorites} />
    </div>
  )
}
