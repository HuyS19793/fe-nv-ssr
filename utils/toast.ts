'use client'

import { toast } from '@/components/ui/toast'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  title: string
  description?: string
  type?: ToastType
  duration?: number
}

export const showToast = ({
  title,
  description,
  type = 'info',
  duration,
}: ToastOptions) => {
  const variant =
    type === 'error'
      ? 'destructive'
      : type === 'success'
      ? 'success'
      : 'default'

  toast({
    title,
    description,
    variant,
    duration,
  })
}

export const showSuccessToast = (title: string, description?: string) => {
  showToast({ title, description, type: 'success' })
}

export const showErrorToast = (title: string, description?: string) => {
  showToast({ title, description, type: 'error' })
}

export const showLoadingToast = (title: string, description?: string) => {
  showToast({ title, description, type: 'info', duration: 2000 })
}
