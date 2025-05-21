// components/schedule/table/server-schedule-table.tsx
'use client'

import { ScheduledJob } from '@/actions/schedule'
import { useTranslations } from 'next-intl'
import { ServerDataTable } from '@/components/tables/server-data-table'
import { getTableColumns } from './column-definitions'
import { useTableSelection } from '@/hooks/use-table-selection'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

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
 * with multi-selection capability
 */
export function ServerScheduleTable({
  jobType,
  data,
  pagination,
  totalCount,
  searchValue,
}: ServerScheduleTableProps) {
  const t = useTranslations('Schedule')

  // Use the selection hook
  const {
    isSelected,
    isAllSelected,
    toggleSelection,
    toggleSelectAll,
    selectionCount,
    clearSelection,
    getSelectedIds,
  } = useTableSelection({
    data,
    idField: 'id',
  })

  // Get table columns configuration
  const columns = getTableColumns({
    isSelected,
    isAllSelected,
    toggleSelection,
    toggleSelectAll,
  })

  // Placeholder for future batch delete function
  const handleBatchDelete = () => {
    console.log('Selected IDs for deletion:', getSelectedIds())
    // This will be implemented later
    alert(
      `${t('batchDeleteNotImplemented')}. ${selectionCount} ${t(
        'itemsSelected'
      )}.`
    )
  }

  return (
    <div className='space-y-4'>
      {/* Selection info and actions */}
      {selectionCount > 0 && (
        <div className='bg-muted p-3 rounded-md flex items-center justify-between'>
          <div>
            <span className='font-medium'>{selectionCount}</span>{' '}
            {t('itemsSelected')}
          </div>
          <div className='space-x-2'>
            <Button variant='outline' size='sm' onClick={clearSelection}>
              {t('clearSelection')}
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={handleBatchDelete}
              className='flex items-center gap-1'>
              <Trash2 className='h-4 w-4' />
              {t('deleteSelected')}
            </Button>
          </div>
        </div>
      )}

      {/* Main data table */}
      <ServerDataTable
        columns={columns}
        data={data}
        pagination={pagination}
        totalCount={totalCount}
        searchPlaceholder={t('searchJobs')}
        searchValue={searchValue}
        maxHeight='70vh'
      />
    </div>
  )
}
