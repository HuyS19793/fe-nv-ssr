'use server'

import { auth } from '@/lib/auth'
import { revalidateTag, revalidatePath } from 'next/cache'
import { ScheduledJob, ScheduledJobUpdate } from './types'

async function getAuthHeaders() {
  const user = await auth.getCurrentUser()
  if (!user || !user.access) {
    throw new Error('Not authenticated')
  }

  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user.access}`,
  }
}

export async function invalidateScheduleCache() {
  revalidateTag('scheduledJobs-NAVI')
  revalidateTag('scheduledJobs-CVER')
  revalidateTag('scheduled-jobs-list')
  revalidatePath('/schedule', 'layout')
}

export async function updateScheduledJob(
  update: ScheduledJobUpdate
): Promise<ScheduledJob> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error('API URL not configured')
  }

  const headers = await getAuthHeaders()
  const apiUrl = `${baseUrl}/job/scheduled-job/${update.id}/`

  try {
    const response = await fetch(apiUrl, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(update),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Error updating scheduled job: ${response.status} ${errorText}`
      )
    }

    await invalidateScheduleCache()
    return await response.json()
  } catch (error) {
    console.error('Failed to update scheduled job:', error)
    throw error
  }
}

export async function deleteScheduledJob(id: string): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error('API URL not configured')
  }

  const headers = await getAuthHeaders()
  const apiUrl = `${baseUrl}/job/scheduled-job/${id}/`

  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Error deleting scheduled job: ${response.status} ${errorText}`
      )
    }

    await invalidateScheduleCache()
  } catch (error) {
    console.error('Failed to delete scheduled job:', error)
    throw error
  }
}

export async function deleteScheduledJobs(ids: string[]): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error('API URL not configured')
  }

  const headers = await getAuthHeaders()
  const apiUrl = `${baseUrl}/job/scheduled-job/delete-multi/`

  try {
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ scheduled_job_ids: ids }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Error deleting scheduled jobs: ${response.status} ${errorText}`
      )
    }

    await invalidateScheduleCache()
  } catch (error) {
    console.error('Failed to delete scheduled jobs:', error)
    throw error
  }
}

export async function createScheduledJob(
  jobData: Omit<ScheduledJob, 'id'>
): Promise<ScheduledJob> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error('API URL not configured')
  }

  const headers = await getAuthHeaders()
  const apiUrl = `${baseUrl}/job/scheduled-job/`

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(jobData),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Error creating scheduled job: ${response.status} ${errorText}`
      )
    }

    await invalidateScheduleCache()
    return await response.json()
  } catch (error) {
    console.error('Failed to create scheduled job:', error)
    throw error
  }
}
