'use client'

import { useState, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
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

interface UploadJobModalProps {
  jobType: 'NAVI' | 'CVER'
}

export function UploadJobModal({ jobType }: UploadJobModalProps) {
  const t = useTranslations('Schedule')
  const router = useRouter()

  // Use refs to track state in event handlers without re-renders
  const isUploadingRef = useRef(false)

  // State for controlled components
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<{ type?: string; size?: string }>({})
  const [isOpen, setIsOpen] = useState(false)

  // Add the refresh hook
  const { refresh } = useScheduleRefresh({
    jobType,
    showErrorToast: true, // Only show error toasts
  })

  // Validate file
  const validateFile = (fileToValidate: File) => {
    const newErrors: { type?: string; size?: string } = {}

    // Check file type
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel.sheet.macroEnabled.12',
    ]

    const validExtensions = ['.csv', '.xlsx', '.xls', '.xlsm']
    const fileName = fileToValidate.name.toLowerCase()
    const hasValidExtension = validExtensions.some((ext) =>
      fileName.endsWith(ext)
    )

    if (!validTypes.includes(fileToValidate.type) && !hasValidExtension) {
      newErrors.type = t('invalidFileType')
    }

    // Check file size (50MB max)
    const maxSize = 50 * 1024 * 1024
    if (fileToValidate.size > maxSize) {
      newErrors.size = t('fileSizeTooLarge', { maxSize: '50MB' })
    }

    return newErrors
  }

  // File change handler
  const handleFileChange = (newFile: File | null) => {
    setErrors({})

    if (!newFile) {
      setFile(null)
      return
    }

    const validationErrors = validateFile(newFile)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setFile(newFile)
  }

  // Clear file handler
  const clearFile = () => {
    setFile(null)
    setErrors({})
  }

  // Reset all state
  const resetState = () => {
    setFile(null)
    setErrors({})
    setIsUploading(false)
    isUploadingRef.current = false
  }

  // Submit handler
  const handleSubmit = async () => {
    if (!file || isUploadingRef.current) return

    setIsUploading(true)
    isUploadingRef.current = true

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('jobType', jobType)

      const result = await uploadScheduledJobFile(formData)

      if (result.success) {
        // First close the modal
        setIsOpen(false)

        // Show success toast
        toast({
          title: t('uploadSuccess'),
          description: result.message || t('jobsCreatedSuccessfully'),
          variant: 'success',
        })

        // Reset state
        resetState()

        // Use the new refresh mechanism instead of the old one
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

  // We'll completely control the modal state to avoid any race conditions
  const openModal = () => setIsOpen(true)
  const closeModal = () => {
    if (isUploadingRef.current) return
    setIsOpen(false)
    // Reset the state after closing
    resetState()
  }

  // Check if we have any errors
  const hasErrors = Object.keys(errors).length > 0

  return (
    <>
      {/* Use a regular button instead of a trigger for better control */}
      <Button onClick={openModal} className='flex items-center gap-2'>
        <PlusIcon className='h-4 w-4' />
        {t('newJob')}
      </Button>

      {/* Control the dialog open state directly */}
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
