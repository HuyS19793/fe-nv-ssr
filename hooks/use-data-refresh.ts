'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/ui/toast'

interface UseDataRefreshOptions {
  refreshMessage?: string
  showToast?: boolean
  onRefreshStart?: () => void
  onRefreshComplete?: () => void
  apiPath?: string // Optional API path for server invalidation
  cacheKeys?: string[] // Optional cache keys to invalidate
}

/**
 * Hook for refreshing data from client components
 */
export function useDataRefresh(options: UseDataRefreshOptions = {}) {
  const {
    refreshMessage = 'Refreshing data...',
    showToast = false,
    onRefreshStart,
    onRefreshComplete,
    apiPath = '/api/refresh-data',
    cacheKeys,
  } = options

  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = useCallback(
    async (customMessage?: string) => {
      if (isRefreshing) return

      setIsRefreshing(true)
      if (onRefreshStart) onRefreshStart()

      if (showToast) {
        toast({
          title: 'Refreshing',
          description: customMessage || refreshMessage,
          duration: 2000,
        })
      }

      try {
        // If cache keys are provided, call the API to invalidate specific caches
        if (cacheKeys && cacheKeys.length > 0 && apiPath) {
          await fetch(apiPath, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              keys: cacheKeys,
              timestamp: Date.now(),
            }),
          })
        }

        // Refresh the router regardless of API call
        router.refresh()
      } catch (error) {
        console.error('Error refreshing data:', error)
        // Still try to refresh the router even if API call fails
        router.refresh()
      } finally {
        // Add a small delay to ensure the UI feels responsive
        setTimeout(() => {
          setIsRefreshing(false)
          if (onRefreshComplete) onRefreshComplete()
        }, 500)
      }
    },
    [
      isRefreshing,
      router,
      showToast,
      refreshMessage,
      onRefreshStart,
      onRefreshComplete,
      apiPath,
      cacheKeys,
    ]
  )

  return {
    refresh,
    isRefreshing,
  }
}
