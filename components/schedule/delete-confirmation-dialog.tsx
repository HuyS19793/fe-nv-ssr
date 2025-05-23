'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface DeleteConfirmationDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
  isDeleting: boolean
  selectedCount: number
}

export function DeleteConfirmationDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isDeleting,
  selectedCount,
}: DeleteConfirmationDialogProps) {
  const t = useTranslations('Schedule')

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('confirmDelete')}</DialogTitle>
          <DialogDescription>
            {t('deleteConfirmation', { count: selectedCount })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}>
            {t('cancel')}
          </Button>
          <Button
            variant='destructive'
            onClick={onConfirm}
            disabled={isDeleting}>
            {isDeleting ? t('deleting') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
