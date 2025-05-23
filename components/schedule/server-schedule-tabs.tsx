// components/schedule/server-schedule-tabs.tsx
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { JobType } from './table/enhanced-server-schedule-table'
import { EnhancedServerScheduleTable } from './table/enhanced-server-schedule-table'
import { ScheduledJob } from '@/actions/schedule/types'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { createQueryString } from '@/lib/url-utils'
import { FilterItem } from '@/types/filter'

interface ServerScheduleTabsProps {
  jobType: JobType
  data: ScheduledJob[]
  pagination: {
    pageCount: number
    page: number
    limit: number
  }
  totalCount: number
  searchValue: string
  filterItems?: FilterItem[]
}

/**
 * Server-side rendered tabs component for switching between job types
 * Now uses enhanced table with sticky headers and pinned columns
 */
export function ServerScheduleTabs({
  jobType,
  data,
  pagination,
  totalCount,
  searchValue,
  filterItems = [],
}: ServerScheduleTabsProps) {
  const t = useTranslations('Schedule')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Handle tab change
  const handleTabChange = (newJobType: JobType) => {
    if (newJobType === jobType) return

    const queryString = createQueryString(searchParams, {
      jobType: newJobType,
      page: 1,
    })
    router.push(`${pathname}${queryString}`)
  }

  return (
    <div className='space-y-4'>
      {/* Tab navigation */}
      <div className='border-b flex'>
        <button
          onClick={() => handleTabChange('NAVI')}
          className={cn(
            'px-6 py-3 border-b-2 transition-all duration-200 font-medium',
            jobType === 'NAVI'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent hover:border-muted-foreground/40 hover:text-foreground'
          )}>
          {t('cadNavigator')}
        </button>
        <button
          onClick={() => handleTabChange('CVER')}
          className={cn(
            'px-6 py-3 border-b-2 transition-all duration-200 font-medium',
            jobType === 'CVER'
              ? 'border-primary text-primary bg-primary/5'
              : 'border-transparent hover:border-muted-foreground/40 hover:text-foreground'
          )}>
          {t('cVer')}
        </button>
      </div>

      {/* Enhanced table */}
      <EnhancedServerScheduleTable
        jobType={jobType}
        data={data}
        pagination={pagination}
        totalCount={totalCount}
        searchValue={searchValue}
        filterItems={filterItems}
      />
    </div>
  )
}
