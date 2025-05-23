'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'

interface UseScheduleRefreshOptions {
  jobType: 'NAVI' | 'CVER'
  showErrorToast?: boolean
}

/**
 * Hook for refreshing schedule data with proper cache invalidation
 */
export function useScheduleRefresh({
  jobType,
  showErrorToast = true,
}: UseScheduleRefreshOptions) {
  const t = useTranslations('Schedule')
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    if (isRefreshing) return

    setIsRefreshing(true)

    try {
      // Extract current filters from URL
      const filterParams: Record<string, string> = {}
      const nonFilterParams = ['page', 'limit', 'search', 'jobType']

      searchParams.forEach((value, key) => {
        if (!nonFilterParams.includes(key)) {
          filterParams[key] = value
        }
      })

      // Call the refresh API with current context
      const response = await fetch('/api/refresh-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobType,
          filters: filterParams,
          timestamp: Date.now(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh data')
      }

      // Force router refresh after API call
      router.refresh()
    } catch (error) {
      console.error('Error refreshing schedule data:', error)

      // Fallback: still try to refresh the router
      router.refresh()

      if (showErrorToast) {
        toast({
          title: 'Refresh Error',
          description: 'Failed to refresh data, but trying to reload...',
          variant: 'destructive',
          duration: 3000,
        })
      }
    } finally {
      // Add a small delay to ensure the refresh has time to complete
      setTimeout(() => {
        setIsRefreshing(false)
      }, 500)
    }
  }, [isRefreshing, router, searchParams, jobType, showErrorToast])

  return {
    refresh,
    isRefreshing,
  }
}
