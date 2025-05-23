'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { LogoutButton } from '@/components/auth/LogoutButton'
import { SidebarNavigation } from './sidebar-navigation'
import { NAV_ITEMS } from './sidebar-config'

export function Sidebar() {
  const pathname = usePathname()
  const authT = useTranslations('Auth')
  const [openSections, setOpenSections] = useState<Record<number, boolean>>({})

  const isActive = useCallback(
    (href?: string): boolean => {
      if (!href) return false
      return pathname === href || pathname.startsWith(href)
    },
    [pathname]
  )

  const hasActiveChild = useCallback(
    (item: (typeof NAV_ITEMS)[0]): boolean => {
      if (!item.children) return false
      return item.children.some((child) => isActive(child.href))
    },
    [isActive]
  )

  useEffect(() => {
    const initialState: Record<number, boolean> = {}

    NAV_ITEMS.forEach((item, index) => {
      if (item.children && hasActiveChild(item)) {
        initialState[index] = true
      }
    })

    setOpenSections(initialState)
  }, [pathname, hasActiveChild])

  const toggleSection = (index: number) => {
    setOpenSections((previous) => ({
      ...previous,
      [index]: !previous[index],
    }))
  }

  return (
    <aside className='w-72 flex-shrink-0 bg-gradient-to-b from-sidebar to-sidebar/95 text-sidebar-foreground border-r border-sidebar-border/40 h-screen flex flex-col shadow-md overflow-hidden'>
      {/* Logo and Title */}
      <div className='p-5 border-b border-sidebar-border/40 flex items-center gap-3'>
        <div className='relative w-10 h-10 bg-sidebar-primary/20 rounded-md overflow-hidden flex items-center justify-center shadow-inner'>
          <Image
            src='/logo.png'
            alt='Navigator Logo'
            width={32}
            height={32}
            className='object-contain drop-shadow-sm'
          />
        </div>
        <h1 className='text-xl font-bold text-sidebar-primary-foreground tracking-tight'>
          Navigator
          <span className='text-primary-400 ml-1 text-sm font-normal'>
            v1.0
          </span>
        </h1>
      </div>

      {/* Navigation */}
      <SidebarNavigation
        openSections={openSections}
        onToggleSection={toggleSection}
      />

      {/* Footer */}
      <div className='mt-auto p-4 border-t border-sidebar-border/40'>
        <div className='flex items-center justify-between px-2 py-1'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-full bg-primary-700/50 flex items-center justify-center text-primary-100 font-semibold'>
              AD
            </div>
            <div className='flex flex-col'>
              <span className='text-sm font-medium'>{authT('admin')}</span>
              <span className='text-xs text-primary-300'>
                {authT('systemAdmin')}
              </span>
            </div>
          </div>
          <LogoutButton />
        </div>
      </div>
    </aside>
  )
}
