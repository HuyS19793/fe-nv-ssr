'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilterItem } from '@/types/filter'
import { useTranslations } from 'next-intl'
import { Filter, X } from 'lucide-react'
import { FilterFieldSelector } from './filter-field-selector'
import { FilterForm } from './filter-form'

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

  const handleAddFilter = () => {
    if (!selectedField || !filterValue.trim()) return

    onAddFilter({
      key: selectedField,
      value: filterValue.trim(),
      include: includeFilter,
    })

    resetForm()
  }

  const resetForm = () => {
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

          <div className='mb-4'>
            <Input
              placeholder={t('searchFields')}
              value={searchFieldValue}
              onChange={(e) => setSearchFieldValue(e.target.value)}
              className='w-full'
            />
          </div>

          <div className='space-y-4 max-h-[60vh] overflow-y-auto pr-2'>
            {selectedField ? (
              <FilterForm
                selectedField={selectedField}
                filterValue={filterValue}
                includeFilter={includeFilter}
                onFieldChange={setSelectedField}
                onValueChange={setFilterValue}
                onIncludeChange={setIncludeFilter}
                onSubmit={handleAddFilter}
                onCancel={resetForm}
              />
            ) : (
              <FilterFieldSelector
                searchValue={searchFieldValue}
                onFieldSelect={setSelectedField}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
