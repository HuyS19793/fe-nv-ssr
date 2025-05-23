'use client'

import { useState, useCallback } from 'react'
import { toast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import { downloadScheduleJobsCSV } from '@/actions/download-schedule'

interface UseDownloadScheduleOptions {
  jobType: 'NAVI' | 'CVER'
  onSuccess?: (filename: string) => void
  onError?: (error: Error) => void
}

export function useDownloadSchedule({
  jobType,
  onSuccess,
  onError,
}: UseDownloadScheduleOptions) {
  const t = useTranslations('Schedule')
  const [isDownloading, setIsDownloading] = useState(false)

  const downloadAll = useCallback(async () => {
    if (isDownloading) return

    setIsDownloading(true)

    try {
      // Show info toast
      toast({
        title: t('downloadInProgress'),
        description: t('preparingDownload'),
        duration: 2000,
      })

      const result = await downloadScheduleJobsCSV({ jobType })

      if (result.success && result.data) {
        // Convert base64 to blob
        const byteCharacters = atob(result.data)
        const byteNumbers = new Array(byteCharacters.length)

        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i)
        }

        const byteArray = new Uint8Array(byteNumbers)
        const blob = new Blob([byteArray], { type: 'text/csv' })

        // Create download link
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = result.filename || `ALL_${jobType}_SCHEDULED_JOB.csv`

        // Trigger download
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast({
          title: t('downloadSuccess'),
          description: t('fileDownloadedSuccessfully'),
          variant: 'success',
        })

        if (onSuccess)
          onSuccess(result.filename || `ALL_${jobType}_SCHEDULED_JOB.csv`)
      } else {
        throw new Error(result.error || 'Download failed')
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('downloadError')

      toast({
        title: t('downloadError'),
        description: errorMessage,
        variant: 'destructive',
      })

      if (onError)
        onError(error instanceof Error ? error : new Error(errorMessage))
    } finally {
      setIsDownloading(false)
    }
  }, [isDownloading, jobType, t, onSuccess, onError])

  return {
    downloadAll,
    isDownloading,
  }
}
