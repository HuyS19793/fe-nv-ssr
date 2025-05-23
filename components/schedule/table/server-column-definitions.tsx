'use client'

import { ColumnDef, Row } from '@tanstack/react-table'
import { ScheduledJob } from '@/actions/schedule'
import { columnMapping } from './column-mapping'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface GetServerColumnsOptions {
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
 * Creates column definitions for ServerDataTable with 3 sticky columns
 */
export function getServerTableColumns({
  isSelected,
  isAllSelected,
  toggleSelection,
  toggleSelectAll,
  columnVisibility,
  translations: t,
}: GetServerColumnsOptions): ColumnDef<ScheduledJob>[] {
  // Selection column - sticky first (56px)
  const selectionColumn: ColumnDef<ScheduledJob> = {
    id: 'select',
    meta: {
      width: '56px',
      minWidth: '56px',
      maxWidth: '56px',
      isSticky: true,
      stickyPosition: 0,
    },
    header: () => (
      <div className='flex justify-center items-center h-full px-2'>
        <Checkbox
          checked={isAllSelected()}
          onCheckedChange={toggleSelectAll}
          aria-label={t.selectAll}
          className='h-5 w-5 border-2 border-primary/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary'
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
            className='h-5 w-5 border-2 border-primary/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary hover:border-primary/80 transition-colors'
          />
        </div>
      )
    },
    enableSorting: false,
    enableHiding: false,
  }

  // Job Name column - sticky second (256px)
  const jobNameColumn: ColumnDef<ScheduledJob> = {
    accessorKey: 'job_name',
    id: 'job_name',
    meta: {
      width: '256px',
      minWidth: '256px',
      maxWidth: '300px',
      isSticky: true,
      stickyPosition: 1,
    },
    header: () => (
      <div className='font-bold text-left px-4 text-foreground'>
        {t.job_name || 'Project'}
      </div>
    ),
    cell: ({ row }: { row: Row<ScheduledJob> }) => {
      const value = row.getValue('job_name') as string
      return (
        <div className='flex items-center px-4 py-3'>
          <div
            className='font-medium text-sm text-foreground truncate max-w-full'
            title={value}>
            {value}
          </div>
        </div>
      )
    },
  }

  // Job Status column - sticky third (128px)
  const jobStatusColumn: ColumnDef<ScheduledJob> = {
    accessorKey: 'job_status',
    id: 'job_status',
    meta: {
      width: '128px',
      minWidth: '128px',
      maxWidth: '160px',
      isSticky: true,
      stickyPosition: 2,
    },
    header: () => (
      <div className='font-bold text-center px-3 text-foreground'>
        {t.job_status || 'Status'}
      </div>
    ),
    cell: ({ row }: { row: Row<ScheduledJob> }) => {
      const value = row.getValue('job_status') as string

      const getStatusStyle = (status: string) => {
        switch (status?.toLowerCase()) {
          case 'success':
          case 'completed':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20'
          case 'failed':
          case 'error':
            return 'bg-red-50 text-red-700 border-red-200 ring-red-600/20'
          case 'running':
          case 'processing':
            return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20'
          case 'pending':
          case 'waiting':
            return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20'
          default:
            return 'bg-gray-50 text-gray-700 border-gray-200 ring-gray-600/20'
        }
      }

      return (
        <div className='flex justify-center px-3 py-3'>
          <div
            className={cn(
              'inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-semibold uppercase tracking-wide ring-1 ring-inset transition-all duration-200',
              getStatusStyle(value)
            )}>
            {value || 'N/A'}
          </div>
        </div>
      )
    },
  }

  // Generate other columns (non-sticky)
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
      // Default width for other columns
      const width = key === 'modified' ? '200px' : '180px'

      return {
        accessorKey: key,
        id: key,
        meta: {
          width,
          minWidth: '120px',
          maxWidth: '250px',
        },
        header: () => (
          <div className='font-semibold text-left px-4 text-muted-foreground'>
            {t[key] || header}
          </div>
        ),
        cell: ({ row }: { row: Row<ScheduledJob> }) => {
          const value = row.getValue(key)

          // Handle boolean values
          if (typeof value === 'boolean') {
            return (
              <div className='px-4 py-3'>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                    value
                      ? 'bg-green-50 text-green-800 border-green-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  )}>
                  {value ? t.yes || 'Yes' : t.no || 'No'}
                </span>
              </div>
            )
          }

          // Handle date values
          if (key === 'modified' && value) {
            return (
              <div className='px-4 py-3 text-sm text-muted-foreground'>
                {new Date(value as string).toLocaleString()}
              </div>
            )
          }

          // Handle array values
          if (Array.isArray(value)) {
            return (
              <div className='px-4 py-3'>
                <div className='flex flex-wrap gap-1 max-h-16 overflow-y-auto'>
                  {value.slice(0, 3).map((item, idx) => (
                    <span
                      key={idx}
                      className='inline-flex items-center px-2 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs'>
                      {item}
                    </span>
                  ))}
                  {value.length > 3 && (
                    <span className='text-xs text-muted-foreground'>
                      +{value.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )
          }

          // Handle status fields
          if (key === 'status') {
            const statusValue = value as string
            return (
              <div className='px-4 py-3'>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                    statusValue?.toLowerCase() === 'active'
                      ? 'bg-green-50 text-green-800 border-green-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200'
                  )}>
                  {statusValue || 'N/A'}
                </span>
              </div>
            )
          }

          // Default text content
          return (
            <div className='px-4 py-3'>
              <div
                className='text-sm text-foreground max-w-full overflow-hidden'
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

  // Return columns: select, job_name, job_status (all sticky), then others
  return [selectionColumn, jobNameColumn, jobStatusColumn, ...otherColumns]
}
