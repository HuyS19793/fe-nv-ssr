'use server'

import type { ScheduleQueryParams } from './types'
import { getScheduledJobs } from './server-actions'

/**
 * Wrapper function that converts object parameters to individual parameters
 * This provides a cleaner API for components that prefer object destructuring
 */
export async function fetchScheduledJobsQuery(
  params: ScheduleQueryParams
) {
  const { jobType, page = 1, limit = 20, search = '', filters = {} } = params
  
  return getScheduledJobs(jobType, page, limit, search, filters)
}

/**
 * Create a query key for React Query caching
 */
export function createScheduleQueryKey(
  jobType: 'NAVI' | 'CVER',
  page: number = 1,
  limit: number = 20,
  search: string = '',
  filters: Record<string, string> = {}
): (string | number | Record<string, string | number>)[] {
  const baseKey = ['scheduled-jobs', jobType]
  
  const params: Record<string, string | number> = {
    page,
    limit,
    ...(search && { search }),
    ...filters,
  }

  return [...baseKey, params]
}

/**
 * Validate schedule query parameters
 */
export function validateScheduleParams(
  params: Partial<ScheduleQueryParams>
): ScheduleQueryParams {
  return {
    jobType: params.jobType || 'NAVI',
    page: Math.max(1, params.page || 1),
    limit: Math.min(100, Math.max(1, params.limit || 20)),
    search: (params.search || '').trim(),
    filters: params.filters || {},
  }
} 