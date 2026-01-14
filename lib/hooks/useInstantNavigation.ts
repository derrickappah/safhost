'use client'

import { useRouter } from 'next/navigation'
import { startTransition, useCallback, useRef } from 'react'

/**
 * Hook for instant navigation with prefetching
 * Uses startTransition to make navigation non-blocking
 * Prefetches routes on hover/touch for better perceived performance
 */
export function useInstantNavigation() {
  const router = useRouter()
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  /**
   * Prefetch a route (with debounce to avoid unnecessary prefetches)
   */
  const prefetch = useCallback((href: string) => {
    // Clear any existing timeout
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current)
    }

    // Debounce prefetch by 200ms to avoid prefetching on accidental hovers
    prefetchTimeoutRef.current = setTimeout(() => {
      router.prefetch(href)
    }, 200)
  }, [router])

  /**
   * Navigate instantly using startTransition
   * This makes navigation non-blocking and allows React to prioritize other updates
   */
  const navigate = useCallback((href: string) => {
    // Clear any pending prefetch
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current)
      prefetchTimeoutRef.current = null
    }

    // Use startTransition to mark navigation as non-urgent
    // This allows React to keep the UI responsive during navigation
    startTransition(() => {
      router.push(href)
    })
  }, [router])

  /**
   * Handle mouse enter for prefetching
   */
  const handleMouseEnter = useCallback((href: string) => {
    prefetch(href)
  }, [prefetch])

  /**
   * Handle touch start for prefetching (mobile)
   */
  const handleTouchStart = useCallback((href: string) => {
    prefetch(href)
  }, [prefetch])

  /**
   * Cleanup on unmount
   */
  const cleanup = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current)
    }
  }, [])

  return {
    navigate,
    prefetch,
    handleMouseEnter,
    handleTouchStart,
    cleanup,
    router // Expose router for advanced use cases
  }
}
