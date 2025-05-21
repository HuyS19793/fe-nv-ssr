// components/schedule/table/action-buttons.tsx
'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Play, Pause, Trash2, Edit } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ScheduledJob } from '@/actions/schedule'

interface ActionButtonsProps {
  job: ScheduledJob
  onUpdate: (id: string, status: string) => Promise<void>
  onEdit: (id: string) => void
  onDelete: (id: string) => Promise<void>
  isLoading: {
    update: boolean
    delete: boolean
  }
}

/**
 * Renders the action buttons for each row in the scheduled jobs table
 */
export function ActionButtons({
  job,
  onUpdate,
  onEdit,
  onDelete,
  isLoading,
}: ActionButtonsProps) {
  const t = useTranslations('Schedule')
  const isActive = job.status === 'ACTIVE'

  return (
    <div className='flex justify-end space-x-2'>
      {/* Activate/Deactivate Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => onUpdate(job.id, isActive ? 'INACTIVE' : 'ACTIVE')}
        disabled={isLoading.update}
        title={isActive ? t('deactivateJob') : t('activateJob')}>
        {isActive ? (
          <Pause className='h-4 w-4' />
        ) : (
          <Play className='h-4 w-4' />
        )}
      </Button>

      {/* Edit Button */}
      <Button
        variant='outline'
        size='sm'
        onClick={() => onEdit(job.id)}
        title={t('editJob')}>
        <Edit className='h-4 w-4' />
      </Button>

      {/* Delete Button with Confirmation Dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant='destructive' size='sm' title={t('deleteJob')}>
            <Trash2 className='h-4 w-4' />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteJobConfirmation')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteJobDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(job.id)}
              disabled={isLoading.delete}>
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
