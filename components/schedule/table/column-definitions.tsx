// components/schedule/table/column-definitions.tsx
'use client'

import { ColumnDef, Row } from '@tanstack/react-table'
import { ScheduledJob } from '@/actions/schedule'
import { useTranslations } from 'next-intl'
import { ActionButtons } from './action-buttons'
import { columnMapping, columnWidths, excludedFields } from './column-mapping'

interface GetColumnsOptions {
  onUpdateJob: (id: string, status: string) => Promise<void>
  onEditJob: (id: string) => void
  onDeleteJob: (id: string) => Promise<void>
  isLoading: {
    update: boolean
    delete: boolean
  }
}

/**
 * Creates column definitions for the scheduled jobs table
 */
export function getTableColumns({
  onUpdateJob,
  onEditJob,
  onDeleteJob,
  isLoading,
}: GetColumnsOptions): ColumnDef<ScheduledJob>[] {
  const t = useTranslations('Schedule')

  // Create the actions column that will be fixed first
  const actionsColumn: ColumnDef<ScheduledJob> = {
    id: 'actions',
    meta: {
      width: '120px',
      minWidth: '100px',
      maxWidth: '150px',
      isSticky: true, // Add this to indicate it's a sticky column
      stickyPosition: 0, // Position 0 (first)
    },
    header: () => (
      <div className='text-right font-semibold'>{t('actions')}</div>
    ),
    cell: ({ row }: { row: Row<ScheduledJob> }) => {
      const job = row.original

      return (
        <ActionButtons
          job={job}
          onUpdate={onUpdateJob}
          onEdit={onEditJob}
          onDelete={onDeleteJob}
          isLoading={isLoading}
        />
      )
    },
  }

  // Extract and customize job_name column (Project)
  const jobNameColumn: ColumnDef<ScheduledJob> = {
    accessorKey: 'job_name',
    id: 'job_name',
    meta: {
      width: '300px',
      minWidth: '200px',
      maxWidth: '400px',
      isSticky: true, // Mark as sticky
      stickyPosition: 1, // Position 1 (second)
    },
    header: () => (
      <div className='font-semibold text-foreground'>
        {t('job_name', { defaultValue: 'Project' })}
      </div>
    ),
    cell: ({ row }: { row: Row<ScheduledJob> }) => {
      const value = row.getValue('job_name')
      return (
        <div className='truncate' title={String(value || '')}>
          {value as React.ReactNode}
        </div>
      )
    },
  }

  // Extract and customize job_status column (Result)
  const jobStatusColumn: ColumnDef<ScheduledJob> = {
    accessorKey: 'job_status',
    id: 'job_status',
    meta: {
      width: '150px',
      minWidth: '120px',
      maxWidth: '180px',
      isSticky: true, // Mark as sticky
      stickyPosition: 2, // Position 2 (third)
    },
    header: () => (
      <div className='font-semibold text-foreground'>
        {t('job_status', { defaultValue: 'Result' })}
      </div>
    ),
    cell: ({ row }: { row: Row<ScheduledJob> }) => {
      const value = row.getValue('job_status')
      return (
        <div className='truncate' title={String(value || '')}>
          {value as React.ReactNode}
        </div>
      )
    },
  }

  // Create all other columns
  const otherColumns = Object.entries(columnMapping)
    .filter(([key]) => {
      // Filter out excluded fields and manually defined columns
      const skipFields = [
        ...excludedFields,
        'job_name', // Skip as we've defined it manually
        'job_status', // Skip as we've defined it manually
      ]
      return !skipFields.includes(key)
    })
    .map(([key, header]) => {
      // Get width settings for this column
      const widthSettings = columnWidths[key] || {
        width: '180px',
        minWidth: '120px',
        maxWidth: '250px',
      }

      // Return the column definition
      return {
        accessorKey: key,
        id: key,
        meta: {
          width: widthSettings.width,
          minWidth: widthSettings.minWidth,
          maxWidth: widthSettings.maxWidth,
        },
        header: () => (
          <div className='font-semibold text-foreground'>
            {t(key, { defaultValue: header })}
          </div>
        ),
        cell: ({ row }: { row: Row<ScheduledJob> }) => {
          const value = row.getValue(key)

          // Handle different types of data
          if (typeof value === 'boolean') {
            return value ? t('yes') : t('no')
          } else if (key === 'modified') {
            // Format date
            return new Date(value as string).toLocaleString()
          } else if (Array.isArray(value)) {
            return value.join(', ')
          }

          return (
            <div className='truncate' title={String(value || '')}>
              {value as React.ReactNode}
            </div>
          )
        },
      }
    })

  // Return columns in the desired order
  return [actionsColumn, jobNameColumn, jobStatusColumn, ...otherColumns]
}
