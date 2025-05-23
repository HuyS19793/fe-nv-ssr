'use client'

import { useState, useCallback } from 'react'

export interface LoadingStateOptions {
  initialLoading?: boolean
  onLoadingChange?: (loading: boolean) => void
}

export function useLoadingState(options: LoadingStateOptions = {}) {
  const { initialLoading = false, onLoadingChange } = options
  const [isLoading, setIsLoading] = useState(initialLoading)

  const setLoading = useCallback(
    (loading: boolean) => {
      setIsLoading(loading)
      onLoadingChange?.(loading)
    },
    [onLoadingChange]
  )

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>): Promise<T> => {
      setLoading(true)
      try {
        return await asyncFn()
      } finally {
        setLoading(false)
      }
    },
    [setLoading]
  )

  return {
    isLoading,
    setLoading,
    withLoading,
  }
}
