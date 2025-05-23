'use client'

import { useTranslations } from 'next-intl'
import {
  showSuccessToast,
  showErrorToast,
  showLoadingToast,
} from '@/utils/toast'
import { extractErrorMessage } from '@/utils/error-handling'

export function useToastHandler(namespace = 'Common') {
  const t = useTranslations(namespace)

  const success = (titleKey: string, descriptionKey?: string, values?: any) => {
    showSuccessToast(
      t(titleKey, values),
      descriptionKey ? t(descriptionKey, values) : undefined
    )
  }

  const error = (
    titleKey: string,
    error?: unknown,
    descriptionKey?: string
  ) => {
    const description = error
      ? extractErrorMessage(error)
      : descriptionKey
      ? t(descriptionKey)
      : undefined

    showErrorToast(t(titleKey), description)
  }

  const loading = (titleKey: string, descriptionKey?: string, values?: any) => {
    showLoadingToast(
      t(titleKey, values),
      descriptionKey ? t(descriptionKey, values) : undefined
    )
  }

  return { success, error, loading }
}
