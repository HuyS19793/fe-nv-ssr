'use client'

import * as React from 'react'
import { useTranslations } from 'next-intl'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  count: number
  isDeleting: boolean
}

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  count,
  isDeleting,
}: DeleteConfirmationDialogProps) {
  const t = useTranslations('Schedule')

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('deleteJobConfirmation')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('deleteJobDescription')}
            {count > 1 && (
              <div className='mt-2 font-medium'>
                {count} {t('itemsSelected')}
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isDeleting}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
            {isDeleting ? (
              <>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'>
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                </svg>
                {t('deleting')}
              </>
            ) : (
              t('delete')
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
