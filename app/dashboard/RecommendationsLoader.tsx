import { generateRecommendations } from '@/lib/recommendations/generate'
import dynamic from 'next/dynamic'

// Dynamically import RecommendedSection to reduce initial bundle size
const RecommendedSection = dynamic(() => import('./RecommendedSection'), {
  ssr: true
})

export default async function RecommendationsLoader() {
  // Load recommendations server-side but allow it to be deferred
  const recommendationsResult = await generateRecommendations(6)
  const recommendedHostels = recommendationsResult.data || []

  return <RecommendedSection recommendedHostels={recommendedHostels} loading={false} />
}
