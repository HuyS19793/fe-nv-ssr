'use client'

import * as React from 'react'
import { FilterItem } from '@/types/filter'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { columnMapping } from '../table/column-mapping'

interface ActiveFiltersProps {
  filters: FilterItem[]
  onRemoveFilter: (index: number) => void
  onClearFilters: () => void
}

export function ActiveFilters({
  filters,
  onRemoveFilter,
  onClearFilters,
}: ActiveFiltersProps) {
  const t = useTranslations('Schedule')

  if (filters.length === 0) return null

  return (
    <div className='flex flex-wrap items-center gap-2 py-2'>
      {filters.map((filter, index) => {
        // Get display name for the field
        const fieldLabel = t(filter.key, {
          defaultValue: columnMapping[filter.key] || filter.key,
        })

        return (
          <div
            key={`${filter.key}-${index}`}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-sm ${
              filter.include
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'bg-destructive/10 text-destructive border border-destructive/20'
            }`}>
            <span className='font-medium'>
              {!filter.include && `${t('not')} `}
              {fieldLabel}:
            </span>
            <span>{filter.value}</span>
            <button
              onClick={() => onRemoveFilter(index)}
              className='ml-1 rounded-full p-1 hover:bg-background/20'
              aria-label={t('removeFilter')}>
              <X className='h-3 w-3' />
            </button>
          </div>
        )
      })}

      {filters.length > 0 && (
        <Button
          variant='ghost'
          size='sm'
          onClick={onClearFilters}
          className='text-muted-foreground hover:text-foreground'>
          {t('clearAll')}
        </Button>
      )}
    </div>
  )
}
