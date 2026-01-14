'use client'

import { useCallback, useState } from 'react'

interface OptimisticActionOptions<T> {
  onSuccess?: (result: T) => void
  onError?: (error: string) => void
  onRollback?: () => void
}

/**
 * Generic hook for optimistic actions
 * Updates UI immediately, then syncs with server in background
 * Automatically rolls back on error
 */
export function useOptimisticAction<T = any>(
  action: () => Promise<{ data?: T; error?: string | null }>,
  options: OptimisticActionOptions<T> = {}
) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = useCallback(async (
    optimisticUpdate: () => void,
    rollbackUpdate: () => void
  ) => {
    // Clear any previous error
    setError(null)
    setIsLoading(true)

    // Apply optimistic update immediately
    optimisticUpdate()

    try {
      // Execute action in background
      const result = await action()

      if (result.error) {
        // Rollback on error
        rollbackUpdate()
        setError(result.error)
        options.onError?.(result.error)
        options.onRollback?.()
      } else {
        // Success - keep optimistic update
        options.onSuccess?.(result.data as T)
      }
    } catch (err) {
      // Rollback on unexpected error
      rollbackUpdate()
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      options.onError?.(errorMessage)
      options.onRollback?.()
    } finally {
      setIsLoading(false)
    }
  }, [action, options])

  return {
    execute,
    isLoading,
    error
  }
}
