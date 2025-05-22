'use client'

import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useDataRefresh } from '@/hooks/use-data-refresh'
import { useTranslations } from 'next-intl'

interface RefreshButtonProps {
  cacheKeys?: string[]
  entityType?: string
  showToast?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  refreshMessage?: string
  onRefreshComplete?: () => void
}

export function RefreshButton({
  cacheKeys,
  entityType,
  showToast = false,
  variant = 'outline',
  size = 'icon',
  className = '',
  refreshMessage,
  onRefreshComplete,
}: RefreshButtonProps) {
  const t = useTranslations('Common')

  // Create the full cache keys array
  const fullCacheKeys = [
    ...(cacheKeys || []),
    ...(entityType ? [`${entityType}-list`, `${entityType}-*`] : []),
  ]

  const { refresh, isRefreshing } = useDataRefresh({
    refreshMessage: refreshMessage || t('refreshingData'),
    showToast,
    cacheKeys: fullCacheKeys,
    onRefreshComplete,
  })

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => refresh()}
      disabled={isRefreshing}
      title={t('refreshData')}
      className={className}>
      <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      {size !== 'icon' && <span className='ml-2'>{t('refresh')}</span>}
      {size === 'icon' && <span className='sr-only'>{t('refresh')}</span>}
    </Button>
  )
}
