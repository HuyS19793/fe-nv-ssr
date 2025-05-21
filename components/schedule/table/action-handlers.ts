// components/schedule/table/action-handlers.ts
'use client'

import { toast } from '@/components/ui/toast'
import { useTranslations } from 'next-intl'
import {
  updateScheduledJob,
  deleteScheduledJob,
  ScheduledJob,
} from '@/actions/schedule'
import { useServerAction } from '@/hooks/use-server-action'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

interface UseActionHandlersOptions {
  jobType: 'NAVI' | 'CVER'
}

/**
 * Custom hook to provide action handlers for the scheduled jobs table
 */
export function useActionHandlers({ jobType }: UseActionHandlersOptions) {
  const t = useTranslations('Schedule')
  const router = useRouter()
  const queryClient = useQueryClient()

  // Get the tag for this job type
  const jobTypeTag = `scheduledJobs-${jobType}`

  // Use the server action wrapper for updateJob with optimistic updates
  const updateJobMutation = useServerAction({
    action: updateScheduledJob,
    invalidateTags: [jobTypeTag],
    successMessage: t('successfullyUpdated'),
    errorMessage: t('errorUpdating'),
    refreshOnSuccess: true,
    mutationOptions: {
      // Add optimistic update
      onMutate: async (newJob) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: [jobTypeTag] })

        // Snapshot the previous value
        const previousJobs = queryClient.getQueryData([jobTypeTag])

        // Optimistically update to the new value
        queryClient.setQueryData([jobTypeTag], (old: any) => {
          if (!old) return old

          // Create a copy of the results with the updated job
          return {
            ...old,
            results: old.results.map((job: ScheduledJob) =>
              job.id === newJob.id ? { ...job, ...newJob } : job
            ),
          }
        })

        // Return a context object with the snapshot
        return { previousJobs }
      },
      // If the mutation fails, roll back to the previous value
      onError: (err, newJob, context) => {
        queryClient.setQueryData([jobTypeTag], context?.previousJobs)
      },
    },
  })

  // Use the server action wrapper for deleteJob with optimistic updates
  const deleteJobMutation = useServerAction({
    action: deleteScheduledJob,
    invalidateTags: [jobTypeTag],
    successMessage: t('successfullyDeleted'),
    errorMessage: t('errorDeleting'),
    refreshOnSuccess: true,
    mutationOptions: {
      // Add optimistic update
      onMutate: async (jobId) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: [jobTypeTag] })

        // Snapshot the previous value
        const previousJobs = queryClient.getQueryData([jobTypeTag])

        // Optimistically update to the new value
        queryClient.setQueryData([jobTypeTag], (old: any) => {
          if (!old) return old

          // Create a copy of the results without the deleted job
          return {
            ...old,
            count: old.count - 1,
            results: old.results.filter(
              (job: ScheduledJob) => job.id !== jobId
            ),
          }
        })

        // Return a context object with the snapshot
        return { previousJobs }
      },
      // If the mutation fails, roll back to the previous value
      onError: (err, jobId, context) => {
        queryClient.setQueryData([jobTypeTag], context?.previousJobs)
      },
    },
  })

  // Handle update job status
  async function handleUpdateJob(id: string, status: string) {
    try {
      await updateJobMutation.mutateAsync({ id, status })

      toast({
        title: t('successfullyUpdated'),
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: t('errorUpdating'),
        description: error instanceof Error ? error.message : t('unknownError'),
        variant: 'destructive',
      })
    }
  }

  // Handle edit job
  function handleEditJob(id: string) {
    // Navigate to edit page or show modal
    console.log('Edit job', id)
    // router.push(`/schedule/edit/${id}`)
  }

  // Handle delete job
  async function handleDeleteJob(id: string) {
    try {
      await deleteJobMutation.mutateAsync(id)

      toast({
        title: t('successfullyDeleted'),
        variant: 'success',
      })
    } catch (error) {
      toast({
        title: t('errorDeleting'),
        description: error instanceof Error ? error.message : t('unknownError'),
        variant: 'destructive',
      })
    }
  }

  return {
    handleUpdateJob,
    handleEditJob,
    handleDeleteJob,
    isLoading: {
      update: updateJobMutation.isLoading,
      delete: deleteJobMutation.isLoading,
    },
  }
}
