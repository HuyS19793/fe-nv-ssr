'use server'

import { auth } from '@/lib/auth'
import { revalidateTag } from 'next/cache'
import { fetchWithPagination } from '../server-table'
import { ScheduledJob, ScheduledJobResponse, ScheduledJobUpdate } from './types'

/**
 * Fetch scheduled jobs from the API with server-side pagination, search, and filtering
 */
export async function getScheduledJobs(
  jobType: 'NAVI' | 'CVER',
  page: number = 1,
  limit: number = 20,
  search: string = '',
  filters: Record<string, string> = {}
): Promise<ScheduledJobResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error('API URL not configured')
  }
  const apiUrl = `${baseUrl}/job/scheduled-job/`

  // Create query parameters
  const queryParams: Record<string, string> = {
    is_deleted: 'false',
    job_type: jobType,
    page: page.toString(),
    limit: limit.toString(),
  }

  // Add search parameter if provided
  if (search) {
    queryParams.search = search
  }

  // Add filter parameters
  Object.entries(filters).forEach(([key, value]) => {
    queryParams[key] = value
  })

  // Create a cache tag that includes filter hash for proper cache invalidation
  const filterHash = Object.entries(filters)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}-${value}`)
    .join('-')

  const cacheTag = `scheduledJobs-${jobType}${
    search ? `-search-${search}` : ''
  }${filterHash ? `-filters-${filterHash}` : ''}`

  // Use the fetchWithPagination utility with all parameters
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
    console.error('Error fetching scheduled jobs with filters:', error)
    throw error
  }
}

/**
 * Update a scheduled job
 */
export async function updateScheduledJob(
  update: ScheduledJobUpdate
): Promise<ScheduledJob> {
  const user = await auth.getCurrentUser()
  if (!user || !user.access) {
    throw new Error('Not authenticated')
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error('API URL not configured')
  }

  const apiUrl = `${baseUrl}/job/scheduled-job/${update.id}/`

  try {
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.access}`,
      },
      body: JSON.stringify(update),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Error updating scheduled job: ${response.status} ${errorText}`
      )
    }

    // Revalidate all scheduled job tags to ensure consistent data
    revalidateTag(`scheduledJobs-NAVI`)
    revalidateTag(`scheduledJobs-CVER`)

    return await response.json()
  } catch (error) {
    console.error('Failed to update scheduled job:', error)
    throw error
  }
}

/**
 * Delete a scheduled job
 */
export async function deleteScheduledJob(id: string): Promise<void> {
  const user = await auth.getCurrentUser()
  if (!user || !user.access) {
    throw new Error('Not authenticated')
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error('API URL not configured')
  }

  const apiUrl = `${baseUrl}/job/scheduled-job/${id}/`

  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.access}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Error deleting scheduled job: ${response.status} ${errorText}`
      )
    }

    // Revalidate all scheduled job tags to ensure consistent data
    revalidateTag(`scheduledJobs-NAVI`)
    revalidateTag(`scheduledJobs-CVER`)
  } catch (error) {
    console.error('Failed to delete scheduled job:', error)
    throw error
  }
}

/**
 * Create a new scheduled job
 */
export async function createScheduledJob(
  jobData: Omit<ScheduledJob, 'id'>
): Promise<ScheduledJob> {
  const user = await auth.getCurrentUser()
  if (!user || !user.access) {
    throw new Error('Not authenticated')
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error('API URL not configured')
  }

  const apiUrl = `${baseUrl}/job/scheduled-job/`

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.access}`,
      },
      body: JSON.stringify(jobData),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Error creating scheduled job: ${response.status} ${errorText}`
      )
    }

    // Revalidate all scheduled job tags to ensure consistent data
    revalidateTag(`scheduledJobs-NAVI`)
    revalidateTag(`scheduledJobs-CVER`)

    return await response.json()
  } catch (error) {
    console.error('Failed to create scheduled job:', error)
    throw error
  }
}

/**
 * Delete multiple scheduled jobs
 */
export async function deleteScheduledJobs(ids: string[]): Promise<void> {
  const user = await auth.getCurrentUser()
  if (!user || !user.access) {
    throw new Error('Not authenticated')
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error('API URL not configured')
  }

  const apiUrl = `${baseUrl}/job/scheduled-job/delete-multi/`

  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user.access}`,
      },
      body: JSON.stringify({ scheduled_job_ids: ids }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Error deleting scheduled jobs: ${response.status} ${errorText}`
      )
    }

    // Revalidate all scheduled job tags to ensure consistent data
    revalidateTag(`scheduledJobs-NAVI`)
    revalidateTag(`scheduledJobs-CVER`)
    revalidateTag('scheduled-jobs-list')
  } catch (error) {
    console.error('Failed to delete scheduled jobs:', error)
    throw error
  }
}
