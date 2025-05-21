// components/schedule/table/server-schedule-table.tsx
'use client'

import { ScheduledJob } from '@/actions/schedule'
import { useTranslations } from 'next-intl'
import { ServerDataTable } from '@/components/tables/server-data-table'
import { getTableColumns } from './column-definitions'
import { useActionHandlers } from './action-handlers'

export type JobType = 'NAVI' | 'CVER'

interface ServerScheduleTableProps {
  jobType: JobType
  data: ScheduledJob[]
  pagination: {
    pageCount: number
    page: number
    limit: number
  }
  totalCount: number
  searchValue: string
}

/**
 * Server-side rendered table component for displaying scheduled jobs
 */
export function ServerScheduleTable({
  jobType,
  data,
  pagination,
  totalCount,
  searchValue,
}: ServerScheduleTableProps) {
  const t = useTranslations('Schedule')

  // Get action handlers
  const { handleUpdateJob, handleEditJob, handleDeleteJob, isLoading } =
    useActionHandlers({ jobType })

  // Get table columns configuration
  const columns = getTableColumns({
    onUpdateJob: handleUpdateJob,
    onEditJob: handleEditJob,
    onDeleteJob: handleDeleteJob,
    isLoading,
  })

  return (
    <ServerDataTable
      columns={columns}
      data={data}
      pagination={pagination}
      totalCount={totalCount}
      searchPlaceholder={t('searchJobs')}
      searchValue={searchValue}
      maxHeight='70vh'
    />
  )
}
