'use client'

import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { uploadScheduledJobFile } from '@/actions/uploadJob'
import { useRouter } from 'next/navigation'

interface UseFileUploadProps {
  jobType: 'NAVI' | 'CVER'
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface FileError {
  type?: string
  size?: string
}

/**
 * Validates if a file has a valid type based on both MIME type and extension
 */
function isValidFileType(file: File): boolean {
  // Check MIME type
  const validMimeTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
  ]

  // Check file extension
  const filename = file.name.toLowerCase()
  const validExtensions = ['.csv', '.xlsx', '.xls', '.xlsm']

  // Return true if either MIME type or extension is valid
  return (
    validMimeTypes.includes(file.type) ||
    validExtensions.some((ext) => filename.endsWith(ext))
  )
}

export function useFileUpload({
  jobType,
  onSuccess,
  onError,
}: UseFileUploadProps) {
  const t = useTranslations('Schedule')
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState<FileError>({})

  // File validation
  const validateFile = useCallback(
    (file: File): FileError => {
      const errors: FileError = {}

      // Check file type using the new function
      if (!isValidFileType(file)) {
        errors.type = t('invalidFileType')
      }

      // Check file size (50MB max)
      const maxSize = 50 * 1024 * 1024 // 50MB in bytes
      if (file.size > maxSize) {
        errors.size = t('fileSizeTooLarge', { maxSize: '50MB' })
      }

      return errors
    },
    [t]
  )

  // Handle file selection
  const handleFileChange = useCallback(
    (newFile: File | null) => {
      setErrors({})

      if (!newFile) {
        setFile(null)
        return
      }

      const validationErrors = validateFile(newFile)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        // Don't set the file if it's invalid
        return
      }

      setFile(newFile)
    },
    [validateFile]
  )

  // Clear the selected file
  const clearFile = useCallback(() => {
    setFile(null)
    setErrors({})
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('jobType', jobType)

      const result = await uploadScheduledJobFile(formData)

      if (result.success) {
        toast({
          title: t('uploadSuccess'),
          description: result.message || t('jobsCreatedSuccessfully'),
          variant: 'success',
        })

        clearFile()

        // Force refresh server data
        router.refresh()

        // Small delay before calling onSuccess to ensure the refresh is triggered
        setTimeout(() => {
          if (onSuccess) onSuccess()
        }, 100)
      } else {
        const errorMessage = result.error || t('uploadFailed')
        toast({
          title: t('uploadError'),
          description: errorMessage,
          variant: 'destructive',
        })

        if (onError) onError(errorMessage)
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('unexpectedError')

      toast({
        title: t('uploadError'),
        description: errorMessage,
        variant: 'destructive',
      })

      if (onError) onError(errorMessage)
    } finally {
      setIsUploading(false)
    }
  }, [file, jobType, t, clearFile, onSuccess, onError, router])

  return {
    file,
    isUploading,
    errors,
    handleFileChange,
    clearFile,
    handleSubmit,
    hasErrors: Object.keys(errors).length > 0,
  }
}
