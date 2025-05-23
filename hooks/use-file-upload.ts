'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { validateFile } from '@/utils/file-validation'
import { useToastHandler } from '@/hooks/use-toast-handler'
import { useLoadingState } from '@/hooks/use-loading-state'
import { uploadScheduledJobFile } from '@/actions/uploadJob'

interface UseFileUploadProps {
  jobType: 'NAVI' | 'CVER'
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function useFileUpload({
  jobType,
  onSuccess,
  onError,
}: UseFileUploadProps) {
  const router = useRouter()
  const toast = useToastHandler('Schedule')
  const { isLoading, withLoading } = useLoadingState()

  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<{ type?: string; size?: string }>({})

  // File validation and change handler
  const handleFileChange = useCallback((newFile: File | null) => {
    setErrors({})

    if (!newFile) {
      setFile(null)
      return
    }

    const validation = validateFile(
      newFile,
      {},
      {
        invalidType: 'Invalid file type. Please upload a CSV or Excel file.',
        fileTooLarge: 'File size exceeds the 50MB limit.',
      }
    )

    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setFile(newFile)
  }, [])

  // Clear file handler
  const clearFile = useCallback(() => {
    setFile(null)
    setErrors({})
  }, [])

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (!file) return

    await withLoading(async () => {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('jobType', jobType)

        const result = await uploadScheduledJobFile(formData)

        if (result.success) {
          toast.success('uploadSuccess', 'jobsCreatedSuccessfully')
          clearFile()
          router.refresh()
          setTimeout(() => onSuccess?.(), 100)
        } else {
          toast.error('uploadError', result.error)
          onError?.(result.error || 'Upload failed')
        }
      } catch (error) {
        toast.error('uploadError', error)
        onError?.(
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred'
        )
      }
    })
  }, [file, jobType, toast, withLoading, clearFile, onSuccess, onError, router])

  return {
    file,
    isLoading,
    errors,
    handleFileChange,
    clearFile,
    handleSubmit,
    hasErrors: Object.keys(errors).length > 0,
  }
}
