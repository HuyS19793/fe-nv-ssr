// components/layout/sidebar-config.tsx
import type { ReactNode } from 'react'
import { Calendar, Settings, RotateCcw, FileText, Database } from 'lucide-react'

export type NavItem = {
  titleKey: string
  href?: string
  icon: ReactNode
  children?: Omit<NavItem, 'icon'>[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    titleKey: 'scheduleJob',
    href: '/schedule',
    icon: <Calendar className='size-5' />,
  },
  {
    titleKey: 'setting',
    href: '/setting',
    icon: <Settings className='size-5' />,
  },
  {
    titleKey: 'history',
    icon: <RotateCcw className='size-5' />,
    children: [
      {
        titleKey: 'execution',
        href: '/history/execution',
      },
      {
        titleKey: 'settingChange',
        href: '/history/setting-change',
      },
    ],
  },
  {
    titleKey: 'credential',
    href: '/credential',
    icon: <FileText className='size-5' />,
  },
  {
    titleKey: 'parameterStorage',
    icon: <Database className='size-5' />,
    children: [
      {
        titleKey: 'manager',
        href: '/parameter-storage/manager',
      },
      {
        titleKey: 'activityLog',
        href: '/parameter-storage/activity-log',
      },
    ],
  },
]
