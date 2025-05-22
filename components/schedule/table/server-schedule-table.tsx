// components/schedule/table/server-schedule-table.tsx
'use client'

import { ScheduledJob } from '@/actions/schedule'
import { useTranslations } from 'next-intl'
import { ServerDataTable } from '@/components/tables/server-data-table'
import { getTableColumns } from './column-definitions'
import { useTableSelection } from '@/hooks/use-table-selection'
import { Button } from '@/components/ui/button'
import { Trash2, RefreshCw } from 'lucide-react'
import { FilterDropdown } from '../filter/filter-dropdown'
import { ActiveFilters } from '../filter/active-filters'
import { useFilter } from '@/hooks/use-filter'
import { FilterItem } from '@/types/filter'
import { UploadJobModal } from '../upload/upload-job-modal'
import { useRouter } from 'next/navigation'
import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/toast'

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
  filterItems?: FilterItem[]
}

/**
 * Server-side rendered table component for displaying scheduled jobs
 * with multi-selection capability and filtering
 */
export function ServerScheduleTable({
  jobType,
  data,
  pagination,
  totalCount,
  searchValue,
  filterItems = [],
}: ServerScheduleTableProps) {
  const t = useTranslations('Schedule')
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  // Use the filter hook with initial filters
  const {
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    filterCount,
    isLoading,
  } = useFilter()

  // Get table columns configuration
  const columns = getTableColumns({
    isSelected,
    isAllSelected,
    toggleSelection,
    toggleSelectAll,
  })

  // Placeholder for batch delete function
  const handleBatchDelete = () => {
    console.log('Selected IDs for deletion:', getSelectedIds())
    alert(
      `${t('batchDeleteNotImplemented')}. ${selectionCount} ${t(
        'itemsSelected'
      )}.`
    )
  }

  // Handle manual refresh
  const handleManualRefresh = useCallback(() => {
    setIsRefreshing(true)
    router.refresh()

    // Reset the refreshing state after a short delay
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }, [router])

  return (
    <div className='space-y-4'>
      {/* Table actions row */}
      <div className='flex justify-between items-center'>
        <div className='flex space-x-2'>
          {/* Add upload modal component without callbacks */}
          <UploadJobModal jobType={jobType} />

          {/* Add refresh button */}
          <Button
            variant='outline'
            size='icon'
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            title={t('refreshData')}>
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            <span className='sr-only'>{t('refreshData')}</span>
          </Button>
        </div>

        {/* Selection action buttons will go here when items are selected */}
      </div>

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

      {/* Active filters display */}
      <ActiveFilters
        filters={filters}
        onRemoveFilter={removeFilter}
        onClearFilters={clearFilters}
      />

      {/* Show loading indicator when applying filters */}
      {isLoading && (
        <div className='py-2 text-sm text-muted-foreground'>
          {t('applyingFilters')}...
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
        filterComponent={
          <FilterDropdown onAddFilter={addFilter} filterCount={filterCount} />
        }
      />
    </div>
  )
}
