'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { FormLabel } from '@/components/ui/form'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Check, X } from 'lucide-react'
import { columnMapping } from '../table/column-mapping'

interface FilterFormProps {
  selectedField: string
  filterValue: string
  includeFilter: boolean
  onFieldChange: (field: string) => void
  onValueChange: (value: string) => void
  onIncludeChange: (include: boolean) => void
  onSubmit: () => void
  onCancel: () => void
}

/**
 * Form component for creating/editing a filter
 * Allows users to set field, value, and include/exclude type
 */
export function FilterForm({
  selectedField,
  filterValue,
  includeFilter,
  onFieldChange,
  onValueChange,
  onIncludeChange,
  onSubmit,
  onCancel,
}: FilterFormProps) {
  const t = useTranslations('Schedule')

  // Get display name for the selected field
  const fieldLabel = t(selectedField, {
    defaultValue: columnMapping[selectedField] || selectedField,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (filterValue.trim()) {
      onSubmit()
    }
  }

  const canSubmit = selectedField && filterValue.trim()

  return (
    <div className='space-y-4'>
      {/* Header with back button */}
      <div className='flex items-center justify-between'>
        <Button
          variant='ghost'
          size='sm'
          onClick={() => onFieldChange('')}
          className='flex items-center gap-2 text-muted-foreground hover:text-foreground'>
          <ArrowLeft className='h-4 w-4' />
          {t('availableFilters')}
        </Button>
      </div>

      {/* Selected field display */}
      <div className='p-3 bg-muted/50 rounded-md'>
        <div className='text-sm font-medium text-muted-foreground mb-1'>
          {t('selectedField')}
        </div>
        <div className='font-semibold'>{fieldLabel}</div>
      </div>

      {/* Filter form */}
      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Filter value input */}
        <div className='space-y-2'>
          <FormLabel htmlFor='filter-value'>{t('filterValue')}</FormLabel>
          <Input
            id='filter-value'
            type='text'
            value={filterValue}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={t('enterFilterValue')}
            className='w-full'
            autoFocus
          />
        </div>

        {/* Include/Exclude toggle */}
        <div className='space-y-3'>
          <FormLabel>{t('includeExclude')}</FormLabel>
          <div className='flex items-center justify-between p-3 border rounded-md'>
            <div className='flex flex-col'>
              <span className='font-medium'>
                {includeFilter ? t('include') : t('exclude')}
              </span>
              <span className='text-sm text-muted-foreground'>
                {includeFilter
                  ? `Show records where ${fieldLabel.toLowerCase()} contains "${filterValue}"`
                  : `Hide records where ${fieldLabel.toLowerCase()} contains "${filterValue}"`}
              </span>
            </div>
            <Switch
              checked={includeFilter}
              onCheckedChange={onIncludeChange}
              aria-label={t('includeExclude')}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className='flex items-center gap-2 pt-2'>
          <Button
            type='submit'
            size='sm'
            disabled={!canSubmit}
            className='flex items-center gap-2 flex-1'>
            <Check className='h-4 w-4' />
            Add Filter
          </Button>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={onCancel}
            className='flex items-center gap-2'>
            <X className='h-4 w-4' />
            {t('cancel')}
          </Button>
        </div>
      </form>

      {/* Filter preview */}
      {filterValue.trim() && (
        <div className='p-3 bg-primary/5 border border-primary/20 rounded-md'>
          <div className='text-sm font-medium text-primary mb-1'>
            Filter Preview
          </div>
          <div className='text-sm'>
            <span className={includeFilter ? 'text-green-700' : 'text-red-700'}>
              {includeFilter ? t('include') : t('not')}
            </span>{' '}
            <span className='font-medium'>{fieldLabel}</span> contains "
            {filterValue}"
          </div>
        </div>
      )}
    </div>
  )
}
