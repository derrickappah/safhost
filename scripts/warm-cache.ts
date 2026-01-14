/**
 * Cache warming script
 * Run this after deployments or on schedule to pre-populate cache
 */

import { warmAllCaches } from '../lib/cache/warm'

async function main() {
  console.log('Starting cache warming...')
  await warmAllCaches()
  console.log('Cache warming complete')
  process.exit(0)
}

main().catch((error) => {
  console.error('Cache warming failed:', error)
  process.exit(1)
})
