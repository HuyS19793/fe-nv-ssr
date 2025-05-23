'use server'

import { fetchWithPagination } from '../server-table'
import {
  ScheduledJobResponse,
  ScheduleQueryParams,
  ScheduledJob,
} from './types'

export async function fetchScheduledJobsWithParams({
  jobType,
  page = 1,
  limit = 20,
  search = '',
  filters = {},
}: ScheduleQueryParams): Promise<ScheduledJobResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error('API URL not configured')
  }

  const apiUrl = `${baseUrl}/job/scheduled-job/`

  const queryParams: Record<string, string> = {
    is_deleted: 'false',
    job_type: jobType,
    page: page.toString(),
    limit: limit.toString(),
  }

  if (search) {
    queryParams.search = search
  }

  Object.entries(filters).forEach(([key, value]) => {
    queryParams[key] = value
  })

  const filterHash = Object.entries(filters)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}-${value}`)
    .join('-')

  const cacheTag = `scheduledJobs-${jobType}${
    search ? `-search-${search}` : ''
  }${filterHash ? `-filters-${filterHash}` : ''}`

  try {
    return await fetchWithPagination<ScheduledJob>(
      apiUrl,
      page,
      limit,
      search,
      queryParams,
      {
        tag: cacheTag,
        revalidate: 60,
      }
    )
  } catch (error) {
    console.error('Error fetching scheduled jobs:', error)
    throw error
  }
}

/**
 * Utility function to build API query parameters
 */
export function buildScheduleQueryParams(
  jobType: 'NAVI' | 'CVER',
  page: number = 1,
  limit: number = 20,
  search: string = '',
  filters: Record<string, string> = {}
): Record<string, string> {
  const queryParams: Record<string, string> = {
    is_deleted: 'false',
    job_type: jobType,
    page: page.toString(),
    limit: limit.toString(),
  }

  if (search) {
    queryParams.search = search
  }

  Object.entries(filters).forEach(([key, value]) => {
    queryParams[key] = value
  })

  return queryParams
}

/**
 * Generate cache tag for scheduled jobs query
 */
export function generateScheduleCacheTag(
  jobType: 'NAVI' | 'CVER',
  search: string = '',
  filters: Record<string, string> = {}
): string {
  const filterHash = Object.entries(filters)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}-${value}`)
    .join('-')

  return `scheduledJobs-${jobType}${search ? `-search-${search}` : ''}${
    filterHash ? `-filters-${filterHash}` : ''
  }`
}
