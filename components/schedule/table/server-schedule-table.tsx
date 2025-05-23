// components/schedule/table/server-schedule-table.tsx
'use client'

import { useState } from 'react'
import { ScheduledJob, deleteScheduledJobs } from '@/actions/schedule'
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
import { useCallback } from 'react'
import { toast } from '@/components/ui/toast'
import { DeleteConfirmationDialog } from '../delete-confirmation-dialog'
import { useScheduleRefresh } from '@/hooks/use-schedule-refresh'

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

  // Replace the old refresh logic with the new hook
  const { refresh, isRefreshing } = useScheduleRefresh({
    jobType,
    showErrorToast: true,
  })

  // Add state for delete dialog and loading
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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

  // Update the batch delete function to open the confirmation dialog
  const handleBatchDelete = () => {
    if (selectionCount === 0) return
    setIsDeleteDialogOpen(true)
  }

  // Update the function to handle delete confirmation with better refresh
  const handleConfirmDelete = async () => {
    const selectedIds = getSelectedIds()
    if (selectedIds.length === 0) return

    setIsDeleting(true)
    try {
      await deleteScheduledJobs(selectedIds)

      toast({
        title: t('successfullyDeleted'),
        description: `${selectedIds.length} jobs deleted successfully`,
        variant: 'success',
      })

      // Clear selection first
      clearSelection()

      // Close dialog
      setIsDeleteDialogOpen(false)

      // Force refresh with the new mechanism
      await refresh()
    } catch (error) {
      console.error('Error deleting jobs:', error)
      toast({
        title: t('errorDeleting'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle manual refresh using the new hook
  const handleManualRefresh = useCallback(() => {
    refresh()
  }, [refresh])

  return (
    <div className='space-y-4'>
      {/* Table actions row */}
      <div className='flex justify-between items-center'>
        <div className='flex space-x-2'>
          {/* Add upload modal component */}
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
      </div>

      {/* Selection info and actions - only shown when items are selected */}
      {selectionCount > 0 && (
        <div className='bg-muted p-3 rounded-md flex flex-wrap md:flex-nowrap items-center justify-between gap-2'>
          <div>
            <span className='font-medium'>{selectionCount}</span>{' '}
            {t('itemsSelected')}
          </div>
          <div className='flex items-center space-x-2 ml-auto'>
            <Button variant='outline' size='sm' onClick={clearSelection}>
              {t('clearSelection')}
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={handleBatchDelete}
              disabled={isDeleting}
              className='flex items-center gap-1 whitespace-nowrap'>
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

      {/* Show loading indicator when applying filters or refreshing */}
      {(isLoading || isRefreshing) && (
        <div className='py-2 text-sm text-muted-foreground'>
          {isLoading
            ? `${t('applyingFilters')}...`
            : `${t('refreshingData')}...`}
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

      {/* Add the delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        count={selectionCount}
        isDeleting={isDeleting}
      />
    </div>
  )
}
