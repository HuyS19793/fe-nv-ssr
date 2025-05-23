'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { PlusIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { FileUploadArea } from './file-upload-area'
import { toast } from '@/components/ui/toast'
import { uploadScheduledJobFile } from '@/actions/uploadJob'
import { useScheduleRefresh } from '@/hooks/use-schedule-refresh'
import {
  validateUploadFile,
  createUploadFormData,
} from './upload-form-handlers'

interface UploadJobModalProps {
  jobType: 'NAVI' | 'CVER'
}

export function UploadJobModal({ jobType }: UploadJobModalProps) {
  const t = useTranslations('Schedule')
  const isUploadingRef = useRef(false)

  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<{ type?: string; size?: string }>({})
  const [isOpen, setIsOpen] = useState(false)

  const { refresh } = useScheduleRefresh({
    jobType,
    showErrorToast: true,
  })

  const handleFileChange = (newFile: File | null) => {
    setErrors({})

    if (!newFile) {
      setFile(null)
      return
    }

    const validation = validateUploadFile(newFile, {
      invalidFileType: t('invalidFileType'),
      fileSizeTooLarge: t('fileSizeTooLarge', { maxSize: '50MB' }),
    })

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setFile(newFile)
  }

  const clearFile = () => {
    setFile(null)
    setErrors({})
  }

  const resetState = () => {
    setFile(null)
    setErrors({})
    setIsUploading(false)
    isUploadingRef.current = false
  }

  const handleSubmit = async () => {
    if (!file || isUploadingRef.current) return

    setIsUploading(true)
    isUploadingRef.current = true

    try {
      const formData = createUploadFormData(file, jobType)
      const result = await uploadScheduledJobFile(formData)

      if (result.success) {
        setIsOpen(false)
        toast({
          title: t('uploadSuccess'),
          description: result.message || t('jobsCreatedSuccessfully'),
          variant: 'success',
        })
        resetState()
        await refresh()
      } else {
        toast({
          title: t('uploadError'),
          description: result.error || t('uploadFailed'),
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: t('uploadError'),
        description:
          error instanceof Error ? error.message : t('unexpectedError'),
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      isUploadingRef.current = false
    }
  }

  const closeModal = () => {
    if (isUploadingRef.current) return
    setIsOpen(false)
    resetState()
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className='flex items-center gap-2'>
        <PlusIcon className='h-4 w-4' />
        {t('newJob')}
      </Button>

      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open && !isUploadingRef.current) {
            closeModal()
          }
        }}>
        <AlertDialogContent className='sm:max-w-[500px]'>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('addNewJob')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('uploadJobDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className='py-4'>
            <FileUploadArea
              file={file}
              onChange={handleFileChange}
              onClear={clearFile}
              errors={errors}
              disabled={isUploading}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isUploading}
              onClick={() => {
                if (isUploading) return
                closeModal()
              }}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              disabled={!file || hasErrors || isUploading}
              className={isUploading ? 'opacity-80 cursor-wait' : ''}>
              {isUploading ? (
                <>
                  <div className='animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
                  {t('uploading')}
                </>
              ) : (
                t('submit')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
