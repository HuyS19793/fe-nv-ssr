'use client'

import type { ColumnDef, Row } from '@tanstack/react-table'

import type { ScheduledJob } from '@/actions/schedule/types'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

import { columnMapping } from './column-mapping'

interface GetServerColumnsOptions {
  isSelected: (job: ScheduledJob) => boolean
  isAllSelected: () => boolean
  toggleSelection: (job: ScheduledJob) => void
  toggleSelectAll: () => void
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
          className='h-4 w-4 border-2 border-primary/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary'
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
            className='h-4 w-4 border-2 border-primary/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary hover:border-primary/80 transition-colors'
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
        <div className='flex items-center px-3 py-2 h-full'>
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
      return (
        <div className='flex items-center justify-center px-3 py-2 h-full'>
          <div
            className='font-medium text-sm text-foreground truncate max-w-full'
            title={value}>
            {value}
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
      return !pinnedFields.includes(key) && !excludedFields.includes(key)
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
              <div className='px-3 py-2 h-full flex items-center'>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
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
              <div className='px-3 py-2 h-full flex items-center text-sm text-muted-foreground'>
                {new Date(value as string).toLocaleString()}
              </div>
            )
          }

          // Handle array values
          if (Array.isArray(value)) {
            return (
              <div className='px-3 py-2 h-full flex items-center'>
                <div className='flex flex-wrap gap-1'>
                  {value.slice(0, 2).map((item, idx) => (
                    <span
                      key={idx}
                      className='inline-flex items-center px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200 text-xs'>
                      {item}
                    </span>
                  ))}
                  {value.length > 2 && (
                    <span className='text-xs text-muted-foreground'>
                      +{value.length - 2} more
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
              <div className='px-3 py-2 h-full flex items-center'>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
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
            <div className='px-3 py-2 h-full flex items-center'>
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
