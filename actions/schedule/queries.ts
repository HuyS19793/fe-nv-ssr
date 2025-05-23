'use server'

import { fetchWithPagination } from '../server-table'
import {
  ScheduledJobResponse,
  ScheduleQueryParams,
  ScheduledJob,
} from './types'

export async function getScheduledJobs({
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
