'use client'

import { useRef, useState } from 'react'

import { File, Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { ChangeEvent,DragEvent } from 'react';

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface FileUploadAreaProps {
  file: File | null
  onChange: (file: File | null) => void
  onClear: () => void
  errors?: { type?: string; size?: string }
  disabled?: boolean
}

export function FileUploadArea({
  file,
  onChange,
  onClear,
  errors = {},
  disabled = false,
}: FileUploadAreaProps) {
  const t = useTranslations('Schedule')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle drag events
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onChange(e.dataTransfer.files[0])
    }
  }

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onChange(e.target.files[0])
    }
  }

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className='w-full'>
      {!file ? (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/30',
            disabled
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:border-primary/70 hover:bg-primary/5'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}>
          <input
            type='file'
            ref={fileInputRef}
            className='hidden'
            onChange={handleFileChange}
            accept='.csv,.xlsx,.xls,.xlsm'
            disabled={disabled}
          />
          <Upload className='mx-auto h-24 w-24 text-muted-foreground/70' />
          <p className='mt-4 text-lg font-medium'>{t('dragAndDropFile')}</p>
          <p className='text-sm text-muted-foreground mt-1'>
            {t('or')} <span className='text-primary'>{t('clickToUpload')}</span>
          </p>
          <p className='text-xs text-muted-foreground mt-4'>
            {t('acceptedFileTypes')}: .csv, .xlsx, .xls, .xlsm
          </p>
          <p className='text-xs text-muted-foreground'>
            {t('maxFileSize')}: 50MB
          </p>
        </div>
      ) : (
        <div className='border rounded-lg p-4'>
          <div className='flex items-center'>
            <File className='h-10 w-10 text-primary mr-3' />
            <div className='flex-1 min-w-0'>
              <p className='text-sm font-medium truncate'>{file.name}</p>
              <p className='text-xs text-muted-foreground'>
                {formatFileSize(file.size)}
              </p>
            </div>
            <Button
              variant='ghost'
              size='icon'
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
              disabled={disabled}
              className='ml-2'>
              <X className='h-5 w-5' />
              <span className='sr-only'>{t('removeFile')}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Display errors if any */}
      {Object.entries(errors).map(
        ([key, error]) =>
          error && (
            <p key={key} className='text-sm text-destructive mt-2'>
              {error}
            </p>
          )
      )}
    </div>
  )
}
