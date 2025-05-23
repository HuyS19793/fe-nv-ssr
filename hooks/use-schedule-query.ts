'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ScheduleQueryParams, ScheduledJobResponse } from '@/actions/schedule/types'
import { fetchScheduledJobsQuery, createScheduleQueryKey } from '@/actions/schedule/query-utils'

interface UseScheduleQueryOptions extends ScheduleQueryParams {
  enabled?: boolean
  staleTime?: number
  cacheTime?: number
}

/**
 * Hook for fetching scheduled jobs with React Query
 * Provides caching, background updates, and error handling
 */
export function useScheduleQuery({
  jobType,
  page = 1,
  limit = 20,
  search = '',
  filters = {},
  enabled = true,
  staleTime = 1000 * 60, // 1 minute
  cacheTime = 1000 * 60 * 5, // 5 minutes
}: UseScheduleQueryOptions) {
  const queryClient = useQueryClient()

  const queryKey = createScheduleQueryKey(jobType, page, limit, search, filters)

  const query = useQuery<ScheduledJobResponse>({
    queryKey,
    queryFn: () => fetchScheduledJobsQuery({
      jobType,
      page,
      limit,
      search,
      filters,
    }),
    enabled,
    staleTime,
    gcTime: cacheTime,
    retry: 2,
  })

  const invalidateQuery = () => {
    queryClient.invalidateQueries({
      queryKey: ['scheduled-jobs', jobType],
    })
  }

  const refetchQuery = () => {
    return query.refetch()
  }

  return {
    ...query,
    invalidateQuery,
    refetchQuery,
  }
} 