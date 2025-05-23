'use client'

import { useMemo,useState, useEffect } from 'react'

import { RefreshCw,Trash2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { deleteScheduledJobs } from '@/actions/schedule/server-actions'
import type { ScheduledJob } from '@/actions/schedule/types'
import { ServerDataTable } from '@/components/tables/server-data-table'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { useFilter } from '@/hooks/use-filter'
import { useScheduleRefresh } from '@/hooks/use-schedule-refresh'
import { useTableSelection } from '@/hooks/use-table-selection'
import { useEnhancedFilter } from '@/hooks/use-enhanced-filter'

import { DeleteConfirmationDialog } from '../delete-confirmation-dialog'
import { DownloadAllButton } from '../download-all-button'
import { ActiveFilters } from '../filter/active-filters'
import { FilterDropdown } from '../filter/filter-dropdown'
import { UploadJobModal } from '../upload/upload-job-modal'

import { getServerTableColumns } from './server-column-definitions'
import type { FilterItem } from '@/types/filter'

export type JobType = 'NAVI' | 'CVER'

interface EnhancedServerScheduleTableProps {
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

// Define translations type
type Translations = {
  [key: string]: string
  selectAll: string
  selectRow: string
  job_name: string
  job_status: string
  yes: string
  no: string
}

/**
 * Enhanced server-side rendered table using ServerDataTable
 */
export function EnhancedServerScheduleTable({
  jobType,
  data,
  pagination,
  totalCount,
  searchValue,
  filterItems = [],
}: EnhancedServerScheduleTableProps) {
  const t = useTranslations('Schedule')

  const translations = useMemo<Translations>(
    () => ({
      selectAll: t('selectAll'),
      selectRow: t('selectRow'),
      job_name: t('job_name'),
      job_status: t('job_status'),
      username: t('username'),
      external_linked: t('external_linked'),
      setting_id: t('setting_id'),
      status: t('status'),
      modified: t('modified'),
      is_maintaining: t('is_maintaining'),
      media: t('media'),
      media_master_update: t('media_master_update'),
      scheduler_weekday: t('scheduler_weekday'),
      scheduler_time: t('scheduler_time'),
      time: t('time'),
      cube_off: t('cube_off'),
      conmane_off: t('conmane_off'),
      redownload_type: t('redownload_type'),
      redownload: t('redownload'),
      master_update_redownload_type: t('master_update_redownload_type'),
      master_update_redownload: t('master_update_redownload'),
      upload: t('upload'),
      upload_opemane: t('upload_opemane'),
      opemane: t('opemane'),
      split_medias: t('split_medias'),
      split_days: t('split_days'),
      which_process: t('which_process'),
      cad_inform: t('cad_inform'),
      conmane_confirm: t('conmane_confirm'),
      group_by: t('group_by'),
      cad_id: t('cad_id'),
      wait_time: t('wait_time'),
      spreadsheet_id: t('spreadsheet_id'),
      spreadsheet_sheet: t('spreadsheet_sheet'),
      drive_folder: t('drive_folder'),
      old_drive_folder: t('old_drive_folder'),
      custom_info: t('custom_info'),
      master_account: t('master_account'),
      skip_to: t('skip_to'),
      use_api: t('use_api'),
      workplace: t('workplace'),
      chanel_id: t('chanel_id'),
      slack_id: t('slack_id'),
      yes: t('yes'),
      no: t('no'),
    }),
    [t]
  )

  // Refresh functionality
  const { refresh, isRefreshing } = useScheduleRefresh({
    jobType,
    showErrorToast: true,
  })

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Selection management
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

  // Filter management using enhanced hook
  const {
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    setFilters,
    isLoading,
    filterCount,
  } = useEnhancedFilter({
    initialFilters: filterItems,
    syncWithUrl: true,
  })

  // Initialize filters from filterItems if provided and filters are empty
  useEffect(() => {
    if (filterItems.length > 0 && filters.length === 0) {
      setFilters(filterItems)
    }
  }, [filterItems, filters.length, setFilters])

  // Column definitions using ServerDataTable columns
  const columns = useMemo(
    () =>
      getServerTableColumns({
        isSelected,
        isAllSelected,
        toggleSelection,
        toggleSelectAll,
        translations,
      }),
    [isSelected, isAllSelected, toggleSelection, toggleSelectAll, translations]
  )

  // Batch delete handler
  const handleBatchDelete = () => {
    if (selectionCount === 0) return
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete handler
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

      clearSelection()
      setIsDeleteDialogOpen(false)
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

  return (
    <div className='space-y-4 w-full'>
      {/* Table controls */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='flex flex-wrap items-center gap-2'>
          <UploadJobModal jobType={jobType} />

          <Button
            variant='outline'
            size='sm'
            onClick={refresh}
            disabled={isRefreshing}
            className='flex items-center gap-2'>
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            {t('refreshData')}
          </Button>

          {/* Add Download All Button */}
          <DownloadAllButton
            jobType={jobType}
            disabled={isRefreshing || isLoading}
            showText={true}
          />
        </div>

        <div className='flex items-center gap-2'>
          <FilterDropdown onAddFilter={addFilter} filterCount={filterCount} />
        </div>
      </div>

      {/* Active filters */}
      {filters.length > 0 && (
        <ActiveFilters
          filters={filters}
          onRemoveFilter={removeFilter}
          onClearFilters={clearFilters}
        />
      )}

      {/* Selection info */}
      {selectionCount > 0 && (
        <div className='flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-md'>
          <span className='text-sm font-medium'>
            {selectionCount} {t('itemsSelected')}
          </span>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={clearSelection}>
              {t('clearSelection')}
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={handleBatchDelete}
              className='flex items-center gap-2'>
              <Trash2 className='h-4 w-4' />
              {t('deleteSelected')}
            </Button>
          </div>
        </div>
      )}

      {/* Data table */}
      <ServerDataTable
        columns={columns}
        data={data}
        pagination={pagination}
        totalCount={totalCount}
        searchValue={searchValue}
        searchPlaceholder={t('searchPlaceholder')}
        maxHeight='calc(100vh - 16rem)'
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        selectedCount={selectionCount}
      />
    </div>
  )
}
