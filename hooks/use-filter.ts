'use client'

import { useState, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FilterItem } from '@/types/filter'
import {
  filtersToQueryParams,
  queryParamsToFilters,
  debounce,
} from '@/lib/filter-utils'
import { createQueryString } from '@/lib/url-utils'

/**
 * Hook for managing filter state with URL synchronization
 */
export function useFilter() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize filters from URL parameters
  const [filters, setFilters] = useState<FilterItem[]>(
    queryParamsToFilters(searchParams)
  )

  // Track if filters are being applied (for loading state)
  const [isApplyingFilters, setIsApplyingFilters] = useState(false)

  // Apply filters to URL
  const applyFiltersToUrl = useCallback(
    (filtersToApply: FilterItem[]) => {
      setIsApplyingFilters(true)

      // Get current query parameters we want to keep (search, limit, jobType)
      const currentParams = new URLSearchParams()
      const keysToKeep = ['search', 'limit', 'jobType']

      for (const key of keysToKeep) {
        const value = searchParams.get(key)
        if (value) {
          currentParams.set(key, value)
        }
      }

      // Reset to page 1 when applying filters
      currentParams.set('page', '1')

      // Add filter parameters
      if (filtersToApply.length > 0) {
        const filterParams = filtersToQueryParams(filtersToApply)
        Object.entries(filterParams).forEach(([key, value]) => {
          currentParams.set(key, value)
        })
      }

      // Create the query string and navigate
      const query = currentParams.toString()
      router.push(`${pathname}${query ? `?${query}` : ''}`)

      // Use timeout to allow navigation to complete
      setTimeout(() => {
        setIsApplyingFilters(false)
      }, 300)
    },
    [pathname, router, searchParams]
  )

  // Add a new filter
  const addFilter = useCallback(
    (filter: FilterItem) => {
      // Check if filter with same key and include/exclude setting already exists
      const existingIndex = filters.findIndex(
        (f) => f.key === filter.key && f.include === filter.include
      )

      let updatedFilters: FilterItem[]

      if (existingIndex >= 0) {
        // Update existing filter
        updatedFilters = [...filters]
        updatedFilters[existingIndex] = filter
      } else {
        // Add new filter
        updatedFilters = [...filters, filter]
      }

      setFilters(updatedFilters)
      applyFiltersToUrl(updatedFilters)
    },
    [filters, applyFiltersToUrl]
  )

  // Remove a filter
  const removeFilter = useCallback(
    (index: number) => {
      const updatedFilters = [...filters]
      updatedFilters.splice(index, 1)
      setFilters(updatedFilters)

      // Force reapplication of filters to the URL
      applyFiltersToUrl(updatedFilters)
    },
    [filters, applyFiltersToUrl]
  )

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters([])

    // Create a URL with only non-filter parameters
    const currentParams = new URLSearchParams()
    const keysToKeep = ['search', 'limit', 'jobType']

    for (const key of keysToKeep) {
      const value = searchParams.get(key)
      if (value) {
        currentParams.set(key, value)
      }
    }

    // Reset to page 1
    currentParams.set('page', '1')

    // Navigate to the cleaned URL
    const query = currentParams.toString()
    router.push(`${pathname}${query ? `?${query}` : ''}`)
  }, [pathname, router, searchParams])

  // Update local state if URL params change externally
  useEffect(() => {
    if (!isApplyingFilters) {
      const urlFilters = queryParamsToFilters(searchParams)
      if (JSON.stringify(urlFilters) !== JSON.stringify(filters)) {
        setFilters(urlFilters)
      }
    }
  }, [searchParams, isApplyingFilters])

  return {
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    isLoading: isApplyingFilters,
    filterCount: filters.length,
  }
}
