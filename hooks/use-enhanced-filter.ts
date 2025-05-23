'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { FilterItem } from '@/types/filter'
import {
  filtersToQueryParams,
  queryParamsToFilters,
} from '@/lib/filter-utils'
import { createQueryString } from '@/lib/url-utils'

interface UseEnhancedFilterOptions {
  initialFilters?: FilterItem[]
  syncWithUrl?: boolean
}

/**
 * Enhanced filter hook that can work with both URL-based and local filters
 */
export function useEnhancedFilter({
  initialFilters = [],
  syncWithUrl = true,
}: UseEnhancedFilterOptions = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filters from URL or provided initial filters
  const [filters, setFilters] = useState<FilterItem[]>(() => {
    if (syncWithUrl) {
      return queryParamsToFilters(searchParams)
    }
    return initialFilters
  })

  const [isApplyingFilters, setIsApplyingFilters] = useState(false)

  // Apply filters to URL if sync is enabled
  const applyFiltersToUrl = useCallback(
    (filtersToApply: FilterItem[]) => {
      if (!syncWithUrl) return

      setIsApplyingFilters(true)

      const currentParams = new URLSearchParams()
      const keysToKeep = ['search', 'limit', 'jobType']

      for (const key of keysToKeep) {
        const value = searchParams.get(key)
        if (value) {
          currentParams.set(key, value)
        }
      }

      currentParams.set('page', '1')

      if (filtersToApply.length > 0) {
        const filterParams = filtersToQueryParams(filtersToApply)
        Object.entries(filterParams).forEach(([key, value]) => {
          currentParams.set(key, value)
        })
      }

      const query = currentParams.toString()
      router.push(`${pathname}${query ? `?${query}` : ''}`)

      setTimeout(() => {
        setIsApplyingFilters(false)
      }, 300)
    },
    [pathname, router, searchParams, syncWithUrl]
  )

  // Add filter
  const addFilter = useCallback(
    (filter: FilterItem) => {
      const existingIndex = filters.findIndex(
        (f) => f.key === filter.key && f.include === filter.include
      )

      let updatedFilters: FilterItem[]

      if (existingIndex >= 0) {
        updatedFilters = [...filters]
        updatedFilters[existingIndex] = filter
      } else {
        updatedFilters = [...filters, filter]
      }

      setFilters(updatedFilters)
      applyFiltersToUrl(updatedFilters)
    },
    [filters, applyFiltersToUrl]
  )

  // Remove filter
  const removeFilter = useCallback(
    (index: number) => {
      const updatedFilters = [...filters]
      updatedFilters.splice(index, 1)
      setFilters(updatedFilters)
      applyFiltersToUrl(updatedFilters)
    },
    [filters, applyFiltersToUrl]
  )

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters([])
    applyFiltersToUrl([])
  }, [applyFiltersToUrl])

  // Set filters directly (useful for syncing from external sources)
  const setFiltersDirectly = useCallback((newFilters: FilterItem[]) => {
    setFilters(newFilters)
  }, [])

  // Update local state if URL params change externally
  useEffect(() => {
    if (syncWithUrl && !isApplyingFilters) {
      const urlFilters = queryParamsToFilters(searchParams)
      if (JSON.stringify(urlFilters) !== JSON.stringify(filters)) {
        setFilters(urlFilters)
      }
    }
  }, [searchParams, isApplyingFilters, syncWithUrl, filters])

  return {
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    setFilters: setFiltersDirectly,
    isLoading: isApplyingFilters,
    filterCount: filters.length,
  }
} 