'use client'

import { Button } from '@/components/ui/button'
import { getFilterFieldGroups } from '@/lib/filter-utils'
import { columnMapping, excludedFields } from '../table/column-mapping'
import { useTranslations } from 'next-intl'

interface FilterFieldSelectorProps {
  searchValue: string
  onFieldSelect: (fieldKey: string) => void
}

export function FilterFieldSelector({
  searchValue,
  onFieldSelect,
}: FilterFieldSelectorProps) {
  const t = useTranslations('Schedule')

  const availableFields = Object.entries(columnMapping)
    .filter(
      ([key]) =>
        !excludedFields.includes(key) && !['id', 'actions'].includes(key)
    )
    .map(([key, label]) => ({
      key,
      label: t(key, { defaultValue: label }),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  const filteredFields = searchValue
    ? availableFields.filter(
        (field) =>
          field.label.toLowerCase().includes(searchValue.toLowerCase()) ||
          field.key.toLowerCase().includes(searchValue.toLowerCase())
      )
    : availableFields

  const fieldGroups = getFilterFieldGroups()

  return (
    <div className='space-y-4'>
      {Object.entries(fieldGroups).map(([group, fields]) => {
        const groupFields = filteredFields.filter((field) =>
          fields.includes(field.key)
        )

        if (groupFields.length === 0) return null

        return (
          <div key={group} className='space-y-2'>
            <h4 className='text-sm font-semibold text-muted-foreground'>
              {group}
            </h4>
            <div className='grid grid-cols-1 gap-2'>
              {groupFields.map((field) => (
                <Button
                  key={field.key}
                  variant='outline'
                  className='justify-start h-auto py-2 px-3 text-left'
                  onClick={() => onFieldSelect(field.key)}>
                  {field.label}
                </Button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
