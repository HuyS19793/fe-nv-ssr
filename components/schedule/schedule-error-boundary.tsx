'use client'

import { useTranslations } from 'next-intl'
import { Toaster } from '@/components/ui/toast'

interface ScheduleErrorBoundaryProps {
  error: unknown
}

export function ScheduleErrorBoundary({ error }: ScheduleErrorBoundaryProps) {
  const t = useTranslations('Schedule')

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>
          {t('scheduleJob')}
        </h1>
        <p className='text-muted-foreground'>{t('scheduleJobDescription')}</p>
      </div>
      <div className='p-8 text-center'>
        <p className='text-destructive mb-4'>{t('errorFetchingData')}</p>
        <form action='/schedule' method='GET'>
          <button
            type='submit'
            className='px-4 py-2 bg-primary text-white rounded hover:bg-primary/90'>
            {t('tryAgain')}
          </button>
        </form>
      </div>
      <Toaster />
    </div>
  )
}
