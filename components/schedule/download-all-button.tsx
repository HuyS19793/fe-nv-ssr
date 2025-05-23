'use client'

import { Button } from '@/components/ui/button'
import { ArrowDownCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useDownloadSchedule } from '@/hooks/use-download-schedule'
import { cn } from '@/lib/utils'

interface DownloadAllButtonProps {
  jobType: 'NAVI' | 'CVER'
  disabled?: boolean
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  showText?: boolean
}

export function DownloadAllButton({
  jobType,
  disabled = false,
  className,
  variant = 'outline',
  size = 'sm',
  showText = true,
}: DownloadAllButtonProps) {
  const t = useTranslations('Schedule')

  const { downloadAll, isDownloading } = useDownloadSchedule({
    jobType,
    onSuccess: () => {
      console.log(`Successfully downloaded ${jobType} jobs`)
    },
    onError: (error) => {
      console.error('Download failed:', error)
    },
  })

  const handleClick = () => {
    if (!isDownloading && !disabled) {
      downloadAll()
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={disabled || isDownloading}
      className={cn('flex items-center gap-2', className)}
      title={t('downloadAllTooltip')}>
      <ArrowDownCircle
        className={cn('h-4 w-4', isDownloading && 'animate-spin')}
      />
      {showText && (
        <span className='hidden sm:inline'>
          {isDownloading ? t('downloadInProgress') : t('downloadAll')}
        </span>
      )}
      {/* Mobile: show loading indicator */}
      {!showText && isDownloading && (
        <span className='sm:hidden text-xs'>...</span>
      )}
    </Button>
  )
}
