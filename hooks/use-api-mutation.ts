'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useToastHandler } from './use-toast-handler'
import { createErrorInfo } from '@/utils/error-handling'

export interface ApiMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  invalidateQueries?: string[]
  successMessage?: {
    titleKey: string
    descriptionKey?: string
  }
  errorMessage?: {
    titleKey: string
    descriptionKey?: string
  }
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: unknown, variables: TVariables) => void
  refreshOnSuccess?: boolean
  namespace?: string
}

export function useApiMutation<TData, TVariables = void>(
  options: ApiMutationOptions<TData, TVariables>
) {
  const {
    mutationFn,
    invalidateQueries = [],
    successMessage,
    errorMessage,
    onSuccess,
    onError,
    refreshOnSuccess = false,
    namespace = 'Common',
  } = options

  const queryClient = useQueryClient()
  const router = useRouter()
  const toast = useToastHandler(namespace)

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Invalidate queries
      invalidateQueries.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey: [queryKey] })
      })

      // Refresh router if needed
      if (refreshOnSuccess) {
        router.refresh()
      }

      // Show success message
      if (successMessage) {
        toast.success(successMessage.titleKey, successMessage.descriptionKey)
      }

      // Call custom success handler
      onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      const errorInfo = createErrorInfo(error)

      // Show error message
      if (errorMessage) {
        toast.error(errorMessage.titleKey, errorInfo.message)
      }

      // Call custom error handler
      onError?.(error, variables)
    },
  })
}
