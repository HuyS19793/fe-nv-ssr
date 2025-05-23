'use client'

import { useState, useMemo } from 'react'
import { ScheduledJob, deleteScheduledJobs } from '@/actions/schedule'
import { useTranslations } from 'next-intl'
import { EnhancedServerDataTable } from '@/components/tables/enhanced-server-data-table'
import { getEnhancedTableColumns } from './enhanced-column-definitions'
import { useTableSelection } from '@/hooks/use-table-selection'
import { useColumnVisibility } from '@/hooks/use-column-visibility'
import { Button } from '@/components/ui/button'
import { Trash2, RefreshCw, Settings, Eye, EyeOff } from 'lucide-react'
import { FilterDropdown } from '../filter/filter-dropdown'
import { ActiveFilters } from '../filter/active-filters'
import { useFilter } from '@/hooks/use-filter'
import { FilterItem } from '@/types/filter'
import { UploadJobModal } from '../upload/upload-job-modal'
import { toast } from '@/components/ui/toast'
import { DeleteConfirmationDialog } from '../delete-confirmation-dialog'
import { useScheduleRefresh } from '@/hooks/use-schedule-refresh'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

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
  username: string
  external_linked: string
  setting_id: string
  status: string
  modified: string
  is_maintaining: string
  media: string
  media_master_update: string
  scheduler_weekday: string
  scheduler_time: string
  time: string
  cube_off: string
  conmane_off: string
  redownload_type: string
  redownload: string
  master_update_redownload_type: string
  master_update_redownload: string
  upload: string
  upload_opemane: string
  opemane: string
  split_medias: string
  split_days: string
  which_process: string
  cad_inform: string
  conmane_confirm: string
  group_by: string
  cad_id: string
  wait_time: string
  spreadsheet_id: string
  spreadsheet_sheet: string
  drive_folder: string
  old_drive_folder: string
  custom_info: string
  master_account: string
  skip_to: string
  use_api: string
  workplace: string
  chanel_id: string
  slack_id: string
  yes: string
  no: string
}

/**
 * Enhanced server-side rendered table without actions column
 * Shows all relevant columns by default
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

  // Create translations object to pass to column definitions
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

  // Column visibility management - now shows all columns by default
  const { columnVisibility } = useColumnVisibility({ jobType })
  const [customColumnVisibility, setCustomColumnVisibility] = useState<
    Record<string, boolean>
  >({})

  // Merge default and custom visibility
  const finalColumnVisibility = useMemo(
    () => ({
      ...columnVisibility,
      ...customColumnVisibility,
    }),
    [columnVisibility, customColumnVisibility]
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

  // Filter management
  const {
    filters,
    addFilter,
    removeFilter,
    clearFilters,
    filterCount,
    isLoading,
  } = useFilter()

  // Column definitions without actions
  const columns = useMemo(
    () =>
      getEnhancedTableColumns({
        isSelected,
        isAllSelected,
        toggleSelection,
        toggleSelectAll,
        columnVisibility: finalColumnVisibility,
        translations,
      }),
    [
      isSelected,
      isAllSelected,
      toggleSelection,
      toggleSelectAll,
      finalColumnVisibility,
      translations,
    ]
  )

  // Toggle column visibility
  const toggleColumnVisibility = (columnKey: string) => {
    setCustomColumnVisibility((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }))
  }

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

  // Get visible columns for column selector
  const availableColumns = useMemo(() => {
    const coreColumns = ['job_name', 'job_status'] // Can't be hidden
    return Object.entries(columnVisibility)
      .filter(([key]) => !['select'].includes(key))
      .map(([key, defaultVisible]) => ({
        key,
        label: translations[key] || key,
        visible: customColumnVisibility[key] ?? defaultVisible,
        canToggle: !coreColumns.includes(key),
      }))
      .sort((a, b) => {
        // Sort core columns first, then alphabetically
        if (coreColumns.includes(a.key) && !coreColumns.includes(b.key))
          return -1
        if (!coreColumns.includes(a.key) && coreColumns.includes(b.key))
          return 1
        return a.label.localeCompare(b.label)
      })
  }, [columnVisibility, customColumnVisibility, translations])

  return (
    <div className='space-y-4 w-full'>
      {/* Enhanced table controls */}
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

          {/* Column visibility selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className='flex items-center gap-2'>
                <Settings className='h-4 w-4' />
                Columns ({availableColumns.filter((col) => col.visible).length})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='end'
              className='w-64 max-h-96 overflow-y-auto'>
              <DropdownMenuLabel>Show/Hide Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {availableColumns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={column.visible}
                  onCheckedChange={() =>
                    column.canToggle && toggleColumnVisibility(column.key)
                  }
                  disabled={!column.canToggle}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2',
                    !column.canToggle && 'opacity-75'
                  )}>
                  <div className='flex items-center gap-2 flex-1'>
                    {column.visible ? (
                      <Eye className='h-3 w-3' />
                    ) : (
                      <EyeOff className='h-3 w-3' />
                    )}
                    <span className='truncate'>{column.label}</span>
                    {!column.canToggle && (
                      <span className='text-xs text-muted-foreground'>
                        (core)
                      </span>
                    )}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className='flex items-center gap-2'>
          <FilterDropdown onAddFilter={addFilter} filterCount={filterCount} />
        </div>
      </div>

      {/* Selection info bar */}
      {selectionCount > 0 && (
        <div className='bg-primary/5 border border-primary/20 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 animate-fade-in'>
          <div className='flex items-center gap-2'>
            <span className='font-medium text-primary'>
              {selectionCount} {t('itemsSelected')}
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={clearSelection}>
              {t('clearSelection')}
            </Button>
            <Button
              variant='destructive'
              size='sm'
              onClick={handleBatchDelete}
              disabled={isDeleting}
              className='flex items-center gap-1'>
              <Trash2 className='h-4 w-4' />
              {t('deleteSelected')}
            </Button>
          </div>
        </div>
      )}

      {/* Active filters */}
      <ActiveFilters
        filters={filters}
        onRemoveFilter={removeFilter}
        onClearFilters={clearFilters}
      />

      {/* Loading indicator */}
      {(isLoading || isRefreshing) && (
        <div className='py-2 text-sm text-muted-foreground flex items-center gap-2'>
          <RefreshCw className='h-4 w-4 animate-spin' />
          {isLoading ? t('applyingFilters') : t('refreshingData')}
        </div>
      )}

      {/* Enhanced data table */}
      <div className='enhanced-sticky-table'>
        <EnhancedServerDataTable
          columns={columns}
          data={data}
          pagination={pagination}
          totalCount={totalCount}
          searchPlaceholder={t('searchJobs')}
          searchValue={searchValue}
          maxHeight='calc(100vh - 280px)'
        />
      </div>

      {/* Delete confirmation dialog */}
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
