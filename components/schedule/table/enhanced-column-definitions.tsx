'use client'

import { ColumnDef, Row, RowData } from '@tanstack/react-table'
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

interface CustomColumnMeta {
  className?: string
  isSticky?: boolean
  stickyLeft?: string
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue>
    extends CustomColumnMeta {}
}

// Define exact width mapping theo specification
const COLUMN_WIDTHS = {
  // Pinned columns
  select: 'w-12', // 48px
  actions: 'w-28', // 112px
  job_name: 'w-52', // 208px
  job_status: 'w-28', // 112px

  // Assignment & Management
  username: 'w-32', // 128px - Task assign
  setting_id: 'w-32', // 128px
  status: 'w-32', // 128px

  // Scheduling
  modified: 'w-36', // 144px
  scheduler_weekday: 'w-48', // 192px
  scheduler_time: 'w-48', // 192px
  time: 'w-48', // 192px

  // Media & Process
  media: 'w-48', // 192px
  redownload_type: 'w-44', // 176px
  redownload: 'w-36', // 144px
  which_process: 'w-40', // 160px

  // Monitoring
  is_maintaining: 'w-48', // 192px

  // Navigator specific
  external_linked: 'w-36', // 144px - External CVer
  cad_inform: 'w-36', // 144px
  conmane_confirm: 'w-36', // 144px
  group_by: 'w-32', // 128px
  cad_id: 'w-32', // 128px
  wait_time: 'w-36', // 144px
  spreadsheet_id: 'w-44', // 176px
  spreadsheet_sheet: 'w-44', // 176px
  drive_folder: 'w-44', // 176px
  old_drive_folder: 'w-44', // 176px
  custom_info: 'w-36', // 144px
  master_account: 'w-40', // 160px
  use_api: 'w-28', // 112px
  workplace: 'w-40', // 160px
  chanel_id: 'w-32', // 128px
  slack_id: 'w-32', // 128px

  // CVer specific
  upload: 'w-24', // 96px
  upload_opemane: 'w-24', // 96px
  opemane: 'w-24', // 96px
  media_master_update: 'w-48', // 192px
  master_update_redownload_type: 'w-44', // 176px
  master_update_redownload: 'w-36', // 144px
  split_medias: 'w-48', // 192px
  split_days: 'w-32', // 128px
  skip_to: 'w-36', // 144px

  // Shared process
  cube_off: 'w-48', // 192px
  conmane_off: 'w-48', // 192px
} as const

// Calculate sticky positions based on actual widths
const STICKY_POSITIONS = {
  select: 0, // 0px
  actions: 48, // 48px (after select)
  job_name: 160, // 160px (after select + actions)
  job_status: 368, // 368px (after select + actions + job_name)
} as const

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
  // Selection column - pinned first
  const selectionColumn: ColumnDef<ScheduledJob> = {
    id: 'select',
    meta: {
      className: `flex-none ${COLUMN_WIDTHS.select}`,
      isSticky: true,
      stickyLeft: `${STICKY_POSITIONS.select}px`,
    },
    header: () => (
      <div className='flex justify-center items-center h-full px-2'>
        <Checkbox
          checked={isAllSelected()}
          onCheckedChange={toggleSelectAll}
          aria-label={t.selectAll}
          className='h-4 w-4'
        />
      </div>
    ),
    cell: ({ row }: { row: Row<ScheduledJob> }) => {
      const job = row.original
      return (
        <div className='flex justify-center items-center h-full px-2'>
          <Checkbox
            checked={isSelected(job)}
            onCheckedChange={() => toggleSelection(job)}
            aria-label={t.selectRow}
            className='h-4 w-4'
          />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  }

  // Actions column - pinned second (for future inline editing)
  const actionsColumn: ColumnDef<ScheduledJob> = {
    id: 'actions',
    meta: {
      className: `flex-none ${COLUMN_WIDTHS.actions}`,
      isSticky: true,
      stickyLeft: `${STICKY_POSITIONS.actions}px`,
    },
    header: () => <div className='font-semibold text-center px-2'>Actions</div>,
    cell: ({ row }: { row: Row<ScheduledJob> }) => {
      return (
        <div className='flex justify-center items-center gap-1 px-2'>
          {/* Placeholder for future Save/Undo buttons */}
          <div className='w-6 h-6' /> {/* Empty space for now */}
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  }

  // Job Name column - pinned third
  const jobNameColumn: ColumnDef<ScheduledJob> = {
    accessorKey: 'job_name',
    id: 'job_name',
    meta: {
      className: `flex-none ${COLUMN_WIDTHS.job_name}`,
      isSticky: true,
      stickyLeft: `${STICKY_POSITIONS.job_name}px`,
    },
    header: () => (
      <div className='font-semibold text-left px-3'>
        {t.job_name || 'Project'}
      </div>
    ),
    cell: ({ row }: { row: Row<ScheduledJob> }) => {
      const value = row.getValue('job_name') as string
      return (
        <div className='flex items-center px-3 py-2'>
          <div
            className='overflow-auto text-xs truncate max-w-full'
            title={value}>
            {value}
          </div>
        </div>
      )
    },
  }

  // Job Status column - pinned fourth
  const jobStatusColumn: ColumnDef<ScheduledJob> = {
    accessorKey: 'job_status',
    id: 'job_status',
    meta: {
      className: `flex-none ${COLUMN_WIDTHS.job_status}`,
      isSticky: true,
      stickyLeft: `${STICKY_POSITIONS.job_status}px`,
    },
    header: () => (
      <div className='font-semibold text-center px-2'>
        {t.job_status || 'Result'}
      </div>
    ),
    cell: ({ row }: { row: Row<ScheduledJob> }) => {
      const value = row.getValue('job_status') as string

      const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
          case 'success':
            return 'border-green-500 text-green-700 bg-green-50'
          case 'failed':
            return 'border-red-500 text-red-700 bg-red-50'
          case 'running':
            return 'border-blue-500 text-blue-700 bg-blue-50'
          case 'pending':
            return 'border-yellow-500 text-yellow-700 bg-yellow-50'
          default:
            return 'border-gray-500 text-gray-700 bg-gray-50'
        }
      }

      return (
        <div className='flex justify-center px-2 py-2'>
          <div
            className={`
              inline-flex items-center px-2 py-1 rounded-md border text-xs font-medium
              ${getStatusStyle(value)}
            `}>
            {value?.toLowerCase()}
          </div>
        </div>
      )
    },
  }

  // Generate other columns with proper widths
  const otherColumns: ColumnDef<ScheduledJob>[] = Object.entries(columnMapping)
    .filter(([key]) => {
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
      const widthClass =
        COLUMN_WIDTHS[key as keyof typeof COLUMN_WIDTHS] || 'w-32'

      return {
        accessorKey: key,
        id: key,
        meta: {
          className: `flex-none ${widthClass}`,
        },
        header: () => (
          <div className='font-semibold text-left px-3'>{t[key] || header}</div>
        ),
        cell: ({ row }: { row: Row<ScheduledJob> }) => {
          const value = row.getValue(key)

          // Handle boolean values
          if (typeof value === 'boolean') {
            return (
              <div className='px-3 py-2'>
                <span
                  className={`
                  inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border
                  ${
                    value
                      ? 'bg-green-50 text-green-800 border-green-200'
                      : 'bg-gray-50 text-gray-800 border-gray-200'
                  }
                `}>
                  {value ? t.yes || 'Yes' : t.no || 'No'}
                </span>
              </div>
            )
          }

          // Handle date values
          if (key === 'modified' && value) {
            return (
              <div className='px-3 py-2 text-xs text-gray-600'>
                {new Date(value as string).toLocaleString()}
              </div>
            )
          }

          // Handle array values (like media lists)
          if (Array.isArray(value)) {
            return (
              <div className='px-3 py-2'>
                <div className='flex flex-wrap gap-1 max-h-16 overflow-auto'>
                  {value.map((item, idx) => (
                    <span
                      key={idx}
                      className='inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs'>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )
          }

          // Handle status fields with special styling
          if (key === 'status') {
            const statusValue = value as string
            const getStatusStyle = (status: string) => {
              switch (status?.toLowerCase()) {
                case 'active':
                case 'on':
                  return 'bg-green-50 text-green-800 border-green-200'
                case 'inactive':
                case 'off':
                  return 'bg-gray-50 text-gray-800 border-gray-200'
                case 'paused':
                  return 'bg-yellow-50 text-yellow-800 border-yellow-200'
                default:
                  return 'bg-gray-50 text-gray-800 border-gray-200'
              }
            }

            return (
              <div className='px-3 py-2'>
                <span
                  className={`
                  inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border
                  ${getStatusStyle(statusValue)}
                `}>
                  {statusValue}
                </span>
              </div>
            )
          }

          // Default text content
          return (
            <div className='px-3 py-2'>
              <div
                className='text-xs overflow-auto max-w-full max-h-16'
                title={String(value || '')}>
                <span className='block truncate'>
                  {value as React.ReactNode}
                </span>
              </div>
            </div>
          )
        },
      }
    })

  // Return columns in order: selection, actions, job_name, job_status, then others
  return [
    selectionColumn,
    actionsColumn,
    jobNameColumn,
    jobStatusColumn,
    ...otherColumns,
  ]
}
