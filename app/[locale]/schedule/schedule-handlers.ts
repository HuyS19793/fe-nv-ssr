import { auth } from '@/lib/auth'
import { getScheduledJobs } from '@/actions/schedule/server-actions'
import { parseTableParams } from '@/lib/url-utils'
import { queryParamsToFilters } from '@/lib/filter-utils'

interface ScheduleParams {
  [key: string]: string | string[] | undefined
}

export async function validateAuth() {
  return auth.requireAuth('/login?callbackUrl=/schedule')
}

export function parseScheduleParams(searchParams: ScheduleParams) {
  const { page, limit, search } = parseTableParams(searchParams)

  let jobType: 'NAVI' | 'CVER' = 'NAVI'
  if (searchParams.jobType) {
    const jobTypeParam = Array.isArray(searchParams.jobType)
      ? searchParams.jobType[0]
      : searchParams.jobType

    if (jobTypeParam === 'CVER') {
      jobType = 'CVER'
    }
  }

  return { page, limit, search, jobType }
}

export function extractFilterParams(searchParams: ScheduleParams) {
  const filterParams: Record<string, string> = {}
  const nonFilterParams = ['page', 'limit', 'search', 'jobType']

  Object.entries(searchParams).forEach(([key, value]) => {
    if (!nonFilterParams.includes(key) && value !== undefined) {
      const paramValue = Array.isArray(value) ? value[0] : value
      if (paramValue) {
        filterParams[key] = paramValue
      }
    }
  })

  return filterParams
}

export function createCacheTag(filterParams: Record<string, string>) {
  const filterHash = Object.entries(filterParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}-${value}`)
    .join('-')

  return `scheduled-jobs-list${filterHash ? `-${filterHash}` : ''}`
}

export async function fetchScheduleData(
  jobType: 'NAVI' | 'CVER',
  page: number,
  limit: number,
  search: string,
  filterParams: Record<string, string>
) {
  try {
    return await getScheduledJobs(jobType, page, limit, search, filterParams)
  } catch (error) {
    console.error('Error fetching scheduled jobs:', error)
    throw error
  }
}
