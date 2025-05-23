// app/[locale]/login-casso/page.tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import CassoLoginRedirect from '@/components/auth/CassoLoginRedirect'

export const metadata: Metadata = {
  title: 'Casso Login - Navigator',
  description: 'Login with Casso to Navigator Admin Dashboard',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function LoginCassoPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await searchParams
  const employeeId = resolvedSearchParams['employee-id'] as string
  const cassoToken = resolvedSearchParams['casso-token'] as string

  // Get translations on the server
  const t = await getTranslations('Auth')

  // Pre-translate the strings we need
  const translations = {
    loading: t('loading'),
    loginError: t('loginError'),
    authInfoMissing: t('authInfoMissing'),
    backToLogin: t('backToLogin'),
  }

  return (
    <div className='p-8 flex flex-col items-center'>
      <CassoLoginRedirect
        employeeId={employeeId}
        cassoToken={cassoToken}
        translations={translations}
      />
    </div>
  )
}
