'use client'

import { ColumnDef, Row } from '@tanstack/react-table'
import { ScheduledJob } from '@/actions/schedule'
import { columnMapping } from './column-mapping'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface GetEnhancedColumnsOptions {
  isSelected: (job: ScheduledJob) => boolean
  isAllSelected: () => boolean
  toggleSelection: (job: ScheduledJob) => void
  toggleSelectAll: () => void
  columnVisibility: Record<string, boolean>
  translations: {
    [key: string]: string
  }
}

/**
 * Enhanced column definitions without actions column
 * All relevant columns shown by default based on job type
 */
export function getEnhancedTableColumns({
  isSelected,
  isAllSelected,
  toggleSelection,
  toggleSelectAll,
  columnVisibility,
  translations: t,
}: GetEnhancedColumnsOptions): ColumnDef<ScheduledJob>[] {
  // Selection column - Always pinned first
  const selectionColumn: ColumnDef<ScheduledJob> = {
    id: 'select',
    meta: {
      width: '60px',
      minWidth: '60px',
      maxWidth: '60px',
      isSticky: true,
      stickyPosition: 0,
    },
    header: () => (
      <div className='flex justify-center items-center h-full'>
        <Checkbox
          checked={isAllSelected()}
          onCheckedChange={toggleSelectAll}
          aria-label={t.selectAll}
          className='h-4 w-4 enhanced-selection-checkbox'
        />
      </div>
    ),
    cell: ({ row }: { row: Row<ScheduledJob> }) => {
      const job = row.original
      return (
        <div className='flex justify-center items-center h-full'>
          <Checkbox
            checked={isSelected(job)}
            onCheckedChange={() => toggleSelection(job)}
            aria-label={t.selectRow}
            className='h-4 w-4 enhanced-selection-checkbox'
          />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  }

  // Job Name column - Pinned second (most important)
  const jobNameColumn: ColumnDef<ScheduledJob> = {
    accessorKey: 'job_name',
    id: 'job_name',
    meta: {
      width: '240px',
      minWidth: '200px',
      maxWidth: '320px',
      isSticky: true,
      stickyPosition: 1,
    },
    header: () => (
      <div className='font-semibold text-left'>{t.job_name || 'Project'}</div>
    ),
    cell: ({ row }: { row: Row<ScheduledJob> }) => {
      const value = row.getValue('job_name') as string
      return (
        <div className='flex items-center h-full'>
          <div
            className='font-medium text-foreground truncate pr-2'
            title={value}>
            {value}
          </div>
        </div>
      )
    },
  }

  // Job Status column - Pinned third
  const jobStatusColumn: ColumnDef<ScheduledJob> = {
    accessorKey: 'job_status',
    id: 'job_status',
    meta: {
      width: '140px',
      minWidth: '120px',
      maxWidth: '160px',
      isSticky: true,
      stickyPosition: 2,
    },
    header: () => (
      <div className='font-semibold text-center'>
        {t.job_status || 'Result'}
      </div>
    ),
    cell: ({ row }: { row: Row<ScheduledJob> }) => {
      const value = row.getValue('job_status') as string
      const getStatusVariant = (status: string) => {
        switch (status?.toLowerCase()) {
          case 'success':
            return 'default'
          case 'failed':
            return 'destructive'
          case 'running':
            return 'secondary'
          case 'pending':
            return 'outline'
          default:
            return 'outline'
        }
      }

      const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
          case 'success':
            return 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950 dark:border-green-800'
          case 'failed':
            return 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-950 dark:border-red-800'
          case 'running':
            return 'text-blue-700 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-950 dark:border-blue-800'
          case 'pending':
            return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950 dark:border-yellow-800'
          default:
            return 'text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950 dark:border-gray-800'
        }
      }

      return (
        <div className='flex justify-center'>
          <Badge
            variant={getStatusVariant(value)}
            className={cn(
              'text-xs px-2 py-1 rounded-full enhanced-status-badge',
              getStatusColor(value)
            )}>
            {value}
          </Badge>
        </div>
      )
    },
  }

  // Generate other columns - show all visible columns
  const otherColumns: ColumnDef<ScheduledJob>[] = Object.entries(columnMapping)
    .filter(([key]) => {
      // Skip pinned columns and excluded fields
      const pinnedFields = ['job_name', 'job_status']
      const excludedFields = [
        'id',
        'latest_executor_id',
        'output_path',
        'raw_data_path',
        'media_off',
        'media_master_update_off',
      ]
      return (
        !pinnedFields.includes(key) &&
        !excludedFields.includes(key) &&
        columnVisibility[key]
      )
    })
    .map(([key, header]) => {
      const getColumnWidth = (columnKey: string) => {
        switch (columnKey) {
          case 'username':
            return { width: '160px', minWidth: '140px', maxWidth: '200px' }
          case 'external_linked':
            return { width: '140px', minWidth: '120px', maxWidth: '160px' }
          case 'setting_id':
            return { width: '150px', minWidth: '130px', maxWidth: '180px' }
          case 'status':
            return { width: '140px', minWidth: '120px', maxWidth: '160px' }
          case 'modified':
            return { width: '180px', minWidth: '160px', maxWidth: '220px' }
          case 'is_maintaining':
            return { width: '160px', minWidth: '140px', maxWidth: '180px' }
          case 'media':
            return { width: '180px', minWidth: '160px', maxWidth: '240px' }
          case 'media_master_update':
            return { width: '180px', minWidth: '160px', maxWidth: '220px' }
          case 'scheduler_weekday':
            return { width: '160px', minWidth: '140px', maxWidth: '200px' }
          case 'scheduler_time':
            return { width: '140px', minWidth: '120px', maxWidth: '160px' }
          case 'time':
            return { width: '120px', minWidth: '100px', maxWidth: '150px' }
          case 'cube_off':
            return { width: '120px', minWidth: '100px', maxWidth: '140px' }
          case 'conmane_off':
            return { width: '140px', minWidth: '120px', maxWidth: '160px' }
          case 'redownload_type':
            return { width: '160px', minWidth: '140px', maxWidth: '200px' }
          case 'redownload':
            return { width: '120px', minWidth: '100px', maxWidth: '140px' }
          case 'master_update_redownload_type':
            return { width: '220px', minWidth: '200px', maxWidth: '280px' }
          case 'master_update_redownload':
            return { width: '180px', minWidth: '160px', maxWidth: '220px' }
          case 'upload':
            return { width: '120px', minWidth: '100px', maxWidth: '140px' }
          case 'upload_opemane':
            return { width: '160px', minWidth: '140px', maxWidth: '180px' }
          case 'opemane':
            return { width: '140px', minWidth: '120px', maxWidth: '180px' }
          case 'split_medias':
            return { width: '160px', minWidth: '140px', maxWidth: '200px' }
          case 'split_days':
            return { width: '120px', minWidth: '100px', maxWidth: '150px' }
          case 'which_process':
            return { width: '160px', minWidth: '140px', maxWidth: '200px' }
          case 'cad_inform':
            return { width: '140px', minWidth: '120px', maxWidth: '160px' }
          case 'conmane_confirm':
            return { width: '160px', minWidth: '140px', maxWidth: '180px' }
          case 'group_by':
            return { width: '140px', minWidth: '120px', maxWidth: '160px' }
          case 'cad_id':
            return { width: '120px', minWidth: '100px', maxWidth: '150px' }
          case 'wait_time':
            return { width: '140px', minWidth: '120px', maxWidth: '160px' }
          case 'spreadsheet_id':
            return { width: '200px', minWidth: '180px', maxWidth: '280px' }
          case 'spreadsheet_sheet':
            return { width: '180px', minWidth: '160px', maxWidth: '220px' }
          case 'drive_folder':
            return { width: '200px', minWidth: '180px', maxWidth: '300px' }
          case 'old_drive_folder':
            return { width: '200px', minWidth: '180px', maxWidth: '300px' }
          case 'custom_info':
            return { width: '160px', minWidth: '140px', maxWidth: '240px' }
          case 'master_account':
            return { width: '160px', minWidth: '140px', maxWidth: '200px' }
          case 'skip_to':
            return { width: '140px', minWidth: '120px', maxWidth: '160px' }
          case 'use_api':
            return { width: '120px', minWidth: '100px', maxWidth: '140px' }
          case 'workplace':
            return { width: '140px', minWidth: '120px', maxWidth: '180px' }
          case 'chanel_id':
            return { width: '140px', minWidth: '120px', maxWidth: '160px' }
          case 'slack_id':
            return { width: '140px', minWidth: '120px', maxWidth: '160px' }
          default:
            return { width: '160px', minWidth: '120px', maxWidth: '200px' }
        }
      }

      const widthSettings = getColumnWidth(key)

      return {
        accessorKey: key,
        id: key,
        meta: widthSettings,
        header: () => (
          <div className='font-semibold text-left'>{t[key] || header}</div>
        ),
        cell: ({ row }: { row: Row<ScheduledJob> }) => {
          const value = row.getValue(key)

          // Handle different data types
          if (typeof value === 'boolean') {
            return (
              <div className='text-center'>
                <Badge
                  variant={value ? 'default' : 'outline'}
                  className='text-xs'>
                  {value ? t.yes || 'Yes' : t.no || 'No'}
                </Badge>
              </div>
            )
          }

          if (key === 'modified' && value) {
            return (
              <div className='text-sm text-muted-foreground'>
                {new Date(value as string).toLocaleString()}
              </div>
            )
          }

          if (Array.isArray(value)) {
            return (
              <div className='text-sm' title={value.join(', ')}>
                <span className='truncate block max-w-full'>
                  {value.join(', ')}
                </span>
              </div>
            )
          }

          // Special handling for status field
          if (key === 'status') {
            const statusValue = value as string
            const getStatusColor = (status: string) => {
              switch (status?.toLowerCase()) {
                case 'active':
                  return 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-950'
                case 'inactive':
                  return 'text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-950'
                case 'paused':
                  return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-400 dark:bg-yellow-950'
                default:
                  return 'text-gray-700 bg-gray-50 border-gray-200'
              }
            }

            return (
              <div className='flex justify-center'>
                <Badge
                  variant='outline'
                  className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    getStatusColor(statusValue)
                  )}>
                  {statusValue}
                </Badge>
              </div>
            )
          }

          return (
            <div
              className='truncate text-sm enhanced-table-cell'
              title={String(value || '')}>
              {value as React.ReactNode}
            </div>
          )
        },
      }
    })

  // Return columns in order: selection, pinned content columns, then other columns
  return [selectionColumn, jobNameColumn, jobStatusColumn, ...otherColumns]
}
