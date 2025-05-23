'use client'

import { useEffect } from 'react'
import type { FilterItem } from '@/types/filter'

interface UseFilterSyncOptions {
  urlFilters: FilterItem[]
  localFilters: FilterItem[]
  onSyncFilters: (filters: FilterItem[]) => void
}

/**
 * Hook to synchronize URL-based filters with local filter state
 * Ensures that server-side filters are reflected in client-side state
 */
export function useFilterSync({
  urlFilters,
  localFilters,
  onSyncFilters,
}: UseFilterSyncOptions) {
  useEffect(() => {
    // Only sync if URL filters exist and local filters are different
    if (urlFilters.length > 0) {
      const filtersMatch = 
        urlFilters.length === localFilters.length &&
        urlFilters.every((urlFilter, index) => {
          const localFilter = localFilters[index]
          return (
            localFilter &&
            localFilter.key === urlFilter.key &&
            localFilter.value === urlFilter.value &&
            localFilter.include === urlFilter.include
          )
        })

      if (!filtersMatch) {
        onSyncFilters(urlFilters)
      }
    }
  }, [urlFilters, localFilters, onSyncFilters])
} 