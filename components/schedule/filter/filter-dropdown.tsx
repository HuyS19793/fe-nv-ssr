'use client'

import * as React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { FilterItem } from '@/types/filter'
import { useTranslations } from 'next-intl'
import { Filter, X, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { FormLabel } from '@/components/ui/form'
import { columnMapping, excludedFields } from '../table/column-mapping'
import { getFilterFieldGroups } from '@/lib/filter-utils'

interface FilterDropdownProps {
  onAddFilter: (filter: FilterItem) => void
  filterCount: number
}

export function FilterDropdown({
  onAddFilter,
  filterCount,
}: FilterDropdownProps) {
  const t = useTranslations('Schedule')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<string>('')
  const [filterValue, setFilterValue] = useState('')
  const [includeFilter, setIncludeFilter] = useState(true)
  const [searchFieldValue, setSearchFieldValue] = useState('')

  // Get available fields from column mapping, excluding certain fields
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

  // Get filter fields grouped by category
  const fieldGroups = getFilterFieldGroups()

  // Filter fields based on search
  const filteredFields = searchFieldValue
    ? availableFields.filter(
        (field) =>
          field.label.toLowerCase().includes(searchFieldValue.toLowerCase()) ||
          field.key.toLowerCase().includes(searchFieldValue.toLowerCase())
      )
    : availableFields

  // Handle adding a new filter
  const handleAddFilter = () => {
    if (!selectedField || !filterValue.trim()) return

    onAddFilter({
      key: selectedField,
      value: filterValue.trim(),
      include: includeFilter,
    })

    // Reset form
    setSelectedField('')
    setFilterValue('')
    setIncludeFilter(true)
    setIsOpen(false)
  }

  return (
    <div className='relative'>
      <Button
        variant='outline'
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center gap-2'>
        <Filter className='h-4 w-4' />
        {t('addFilter')}
        {filterCount > 0 && (
          <span className='inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground'>
            {filterCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className='absolute right-0 top-full z-[200] mt-2 w-80 rounded-md border bg-background p-4 shadow-md'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-medium'>{t('availableFilters')}</h3>
            <Button variant='ghost' size='sm' onClick={() => setIsOpen(false)}>
              <X className='h-4 w-4' />
            </Button>
          </div>

          {/* Field search */}
          <div className='mb-4'>
            <Input
              placeholder={t('searchFields')}
              value={searchFieldValue}
              onChange={(e) => setSearchFieldValue(e.target.value)}
              className='w-full'
            />
          </div>

          <div className='space-y-4 max-h-[60vh] overflow-y-auto pr-2'>
            {/* Field selection */}
            {selectedField ? (
              <div className='space-y-4'>
                <div>
                  <FormLabel>{t('selectedField')}</FormLabel>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>
                      {availableFields.find((f) => f.key === selectedField)
                        ?.label || selectedField}
                    </span>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setSelectedField('')}>
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </div>

                {/* Filter value */}
                <div>
                  <FormLabel>{t('filterValue')}</FormLabel>
                  <Input
                    placeholder={t('enterFilterValue')}
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                </div>

                {/* Include/Exclude toggle */}
                <div className='flex items-center justify-between'>
                  <FormLabel>{t('includeExclude')}</FormLabel>
                  <div className='flex items-center gap-2'>
                    <span
                      className={
                        !includeFilter
                          ? 'font-medium text-destructive'
                          : 'text-muted-foreground'
                      }>
                      {t('exclude')}
                    </span>
                    <Switch
                      checked={includeFilter}
                      onCheckedChange={setIncludeFilter}
                    />
                    <span
                      className={
                        includeFilter
                          ? 'font-medium text-primary'
                          : 'text-muted-foreground'
                      }>
                      {t('include')}
                    </span>
                  </div>
                </div>

                {/* Add button */}
                <div className='flex justify-end'>
                  <Button
                    onClick={handleAddFilter}
                    disabled={!filterValue.trim()}>
                    <Plus className='mr-2 h-4 w-4' />
                    {t('addFilter')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className='space-y-4'>
                {/* Group fields by category */}
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
                            onClick={() => setSelectedField(field.key)}>
                            {field.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
