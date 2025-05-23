// app/[locale]/schedule/page.tsx
import { ServerScheduleTabs } from '@/components/schedule/server-schedule-tabs'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { Toaster } from '@/components/ui/toast'
import { queryParamsToFilters } from '@/lib/filter-utils'
import {
  validateAuth,
  parseScheduleParams,
  extractFilterParams,
  createCacheTag,
  fetchScheduleData,
} from './schedule-handlers'
import { ScheduleErrorBoundary } from '@/components/schedule/schedule-error-boundary'

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
  const resolvedSearchParams = await searchParams

  await validateAuth()

  const { page, limit, search, jobType } =
    parseScheduleParams(resolvedSearchParams)
  const filterParams = extractFilterParams(resolvedSearchParams)
  const filterItems = queryParamsToFilters(new URLSearchParams(filterParams))
  const cacheTag = createCacheTag(filterParams)

  try {
    const jobsData = await fetchScheduleData(
      jobType,
      page,
      limit,
      search,
      filterParams
    )

    const pageCount = Math.ceil(jobsData.count / limit)

    return (
      <div className='space-y-6 w-full max-w-full'>
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
  } catch (error) {
    return <ScheduleErrorBoundary error={error} />
  }
}
