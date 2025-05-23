'use client'

import React from 'react'
import { usePathname, Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, CornerDownRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { NAV_ITEMS, type NavItem } from './sidebar-config'

interface SidebarNavigationProps {
  openSections: Record<number, boolean>
  onToggleSection: (index: number) => void
}

export function SidebarNavigation({
  openSections,
  onToggleSection,
}: SidebarNavigationProps) {
  const pathname = usePathname()
  const t = useTranslations('Navigation')

  const isActive = (href?: string): boolean => {
    if (!href) return false
    return pathname === href || pathname.startsWith(href)
  }

  const hasActiveChild = (item: NavItem): boolean => {
    if (!item.children) return false
    return item.children.some((child) => isActive(child.href))
  }

  const renderNavItem = (item: NavItem, index: number) => {
    if (item.children) {
      return (
        <Collapsible
          key={index}
          defaultOpen={hasActiveChild(item)}
          open={openSections[index]}
          onOpenChange={() => onToggleSection(index)}>
          <CollapsibleTrigger
            className={cn(
              'flex items-center justify-between w-full px-4 py-2.5 text-left rounded-md',
              'transition-all duration-200 ease-in-out',
              'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
              hasActiveChild(item) &&
                'bg-sidebar-accent/80 text-sidebar-accent-foreground font-medium'
            )}>
            <span className='flex items-center gap-3'>
              <span
                className={cn(
                  'p-1.5 rounded-md bg-sidebar-primary/20 text-primary-300',
                  hasActiveChild(item) && 'bg-primary-700/30 text-primary-200'
                )}>
                {item.icon}
              </span>
              <span>{t(item.titleKey)}</span>
            </span>
            <span className='transition-transform duration-200'>
              {openSections[index] ? (
                <ChevronDown className='size-4' />
              ) : (
                <ChevronRight className='size-4' />
              )}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className='animate-[slideDown_200ms_ease-out]'>
            <ul className='pl-6 mt-1 space-y-1'>
              {item.children.map((child, childIndex) => (
                <li key={childIndex}>
                  <Link
                    href={child.href || '#'}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-md',
                      'transition-colors duration-200',
                      'hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
                      'relative',
                      isActive(child.href) &&
                        'bg-sidebar-accent/60 text-sidebar-accent-foreground font-medium'
                    )}>
                    <CornerDownRight className='size-4 text-primary-400' />
                    <span>{t(child.titleKey)}</span>
                    {isActive(child.href) && (
                      <span
                        className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4/5 bg-primary-400 rounded-r-md'
                        aria-hidden='true'
                      />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      )
    }

    return (
      <Link
        key={index}
        href={item.href || '#'}
        className={cn(
          'flex items-center gap-3 px-4 py-2.5 rounded-md',
          'transition-all duration-200 ease-in-out',
          'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
          'relative',
          isActive(item.href) &&
            'bg-sidebar-accent/80 text-sidebar-accent-foreground font-medium'
        )}>
        <span
          className={cn(
            'p-1.5 rounded-md bg-sidebar-primary/20 text-primary-300',
            isActive(item.href) && 'bg-primary-700/30 text-primary-200'
          )}>
          {item.icon}
        </span>
        <span>{t(item.titleKey)}</span>
        {isActive(item.href) && (
          <span
            className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4/5 bg-primary-400 rounded-r-md'
            aria-hidden='true'
          />
        )}
      </Link>
    )
  }

  return (
    <nav className='p-3 flex-1 overflow-y-auto custom-scrollbar'>
      <ul className='space-y-1.5'>{NAV_ITEMS.map(renderNavItem)}</ul>
    </nav>
  )
}
