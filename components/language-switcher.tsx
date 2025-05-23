'use client'

import { Globe } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { usePathname,useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

// Language display names
const languageNames: Record<string, string> = {
  en: 'English',
  jp: '日本語',
}

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('LanguageSwitcher')

  // Function to switch the language
  const switchLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <div className='flex items-center gap-2'>
      <Globe className='size-4 text-muted-foreground' />
      {routing.locales.map((l) => (
        <Button
          key={l}
          variant={l === locale ? 'default' : 'outline'}
          size='sm'
          onClick={() => switchLanguage(l)}
          className='min-w-8'
          aria-label={`${t('changeLanguage')}: ${languageNames[l]}`}>
          {l.toUpperCase()}
        </Button>
      ))}
    </div>
  )
}
