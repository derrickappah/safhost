/**
 * Safe formatting utilities for SafHost dashboard
 */

/**
 * Formats a Ghana Cedi price string: GH₵ X,XXX / semester
 */
export function formatCediPrice(price?: number | null): string {
  const num = typeof price === 'number' && !isNaN(price) ? price : 0
  return `GH₵ ${num.toLocaleString()} / semester`
}

/**
 * Formats rating to 1 decimal place and review count in parentheses
 */
export function formatRatingBadge(
  rating?: number | null,
  reviewCount?: number | null
): {
  ratingText: string
  reviewCountText: string
} {
  const r = typeof rating === 'number' && !isNaN(rating) ? rating.toFixed(1) : '0.0'
  const count = typeof reviewCount === 'number' && !isNaN(reviewCount) ? reviewCount : 0
  return {
    ratingText: r,
    reviewCountText: `(${count})`
  }
}

/**
 * Formats distance in km to 1 decimal place. Returns null if invalid or missing.
 */
export function formatDistance(distance?: number | null): string | null {
  if (distance === null || distance === undefined || isNaN(Number(distance))) {
    return null
  }
  return `${Number(distance).toFixed(1)}km`
}
