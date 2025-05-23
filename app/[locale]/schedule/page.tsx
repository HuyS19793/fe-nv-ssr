// app/[locale]/schedule/page.tsx
import { ServerScheduleTabs } from '@/components/schedule/server-schedule-tabs'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { Toaster } from '@/components/ui/toast'
import { auth } from '@/lib/auth'
import { getScheduledJobs } from '@/actions/schedule/server-actions'
import { parseTableParams } from '@/lib/url-utils'
import { queryParamsToFilters } from '@/lib/filter-utils'

// Force the page to be dynamic
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Schedule')

  return {
    title: `${t('scheduleJob')} - Navigator`,
    description: t('scheduleJobDescription'),
  }
}

interface SchedulePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SchedulePage({
  searchParams,
}: SchedulePageProps) {
  const t = await getTranslations('Schedule')
  const resolvedSearchParams = await searchParams

  // Verify the user is authenticated with a valid session
  await auth.requireAuth('/login?callbackUrl=/schedule')

  // Parse search parameters directly from searchParams
  const { page, limit, search } = parseTableParams(resolvedSearchParams)

  // Get job type from search params or default to 'NAVI'
  // Handle both string and string[] cases
  let jobType: 'NAVI' | 'CVER' = 'NAVI'
  if (resolvedSearchParams.jobType) {
    const jobTypeParam = Array.isArray(resolvedSearchParams.jobType)
      ? resolvedSearchParams.jobType[0]
      : resolvedSearchParams.jobType

    if (jobTypeParam === 'CVER') {
      jobType = 'CVER'
    }
  }

  // Extract filter parameters from search params
  const filterParams: Record<string, string> = {}

  // These are the non-filter params we want to exclude
  const nonFilterParams = ['page', 'limit', 'search', 'jobType']

  // Extract filter parameters
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (!nonFilterParams.includes(key) && value !== undefined) {
      // If it's an array, use the first value
      const paramValue = Array.isArray(value) ? value[0] : value
      if (paramValue) {
        filterParams[key] = paramValue
      }
    }
  })

  // Convert URL parameters to filter objects for UI display
  const filterItems = queryParamsToFilters(new URLSearchParams(filterParams))

  // Create a cache tag that includes the filters
  const filterHash = Object.entries(filterParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}-${value}`)
    .join('-')

  const cacheTag = `scheduled-jobs-list${filterHash ? `-${filterHash}` : ''}`

  // Fetch data using server action with filters
  let jobsData
  try {
    jobsData = await getScheduledJobs(
      jobType,
      page,
      limit,
      search,
      filterParams
    )
  } catch (error) {
    console.error('Error fetching scheduled jobs:', error)
    // Return an error state that can be displayed
    return (
      <div className='space-y-6'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            {t('scheduleJob')}
          </h1>
          <p className='text-muted-foreground'>{t('scheduleJobDescription')}</p>
        </div>
        <div className='p-8 text-center'>
          <p className='text-destructive mb-4'>{t('errorFetchingData')}</p>
          <form action='/schedule' method='GET'>
            <button
              type='submit'
              className='px-4 py-2 bg-primary text-white rounded hover:bg-primary/90'>
              {t('tryAgain')}
            </button>
          </form>
        </div>
        <Toaster />
      </div>
    )
  }

  // Calculate page count
  const pageCount = Math.ceil(jobsData.count / limit)

  return (
    <div className='space-y-6 w-full max-w-full'>
      {/* Add a hidden div with data-cache-tag for more targeted revalidation */}
      <div data-cache-tag={cacheTag} className='hidden' />

      <ServerScheduleTabs
        jobType={jobType}
        data={jobsData.results}
        pagination={{
          pageCount,
          page,
          limit,
        }}
        totalCount={jobsData.count}
        searchValue={search}
        filterItems={filterItems}
      />
      <Toaster />
    </div>
  )
}
