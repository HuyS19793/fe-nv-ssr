// components/tables/TableCell.tsx
'use client'

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { TableCell as UITableCell } from '@/components/ui/table'
import {
  checkContentOverflow,
  createResizeObserver,
  createCellStyles,
} from './table-cell-utils'

// Use Omit to avoid type conflict with "content" property
interface TableCellProps extends Omit<React.ComponentProps<'td'>, 'content'> {
  children?: ReactNode
  content?: ReactNode
  className?: string
  style?: React.CSSProperties
  colSpan?: number
  rawValue?: string
  width?: string
  minWidth?: string
  maxWidth?: string
  isSticky?: boolean
  tooltipDisabled?: boolean
}

export function TableCell({
  children,
  content,
  className,
  style,
  colSpan,
  rawValue,
  width,
  minWidth = '100px',
  maxWidth = '300px',
  isSticky = false,
  tooltipDisabled = false,
  ...props
}: TableCellProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const cellRef = useRef<HTMLTableCellElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (tooltipDisabled || !contentRef.current) return

    const checkOverflow = () => {
      const element = contentRef.current
      if (!element) return

      const isOverflowing = checkContentOverflow(element)
      setShowTooltip(isOverflowing)
    }

    checkOverflow()

    const resizeObserver = createResizeObserver(
      checkOverflow,
      contentRef.current
    )

    return () => {
      resizeObserver.disconnect()
    }
  }, [content, tooltipDisabled])

  const baseStyle = createCellStyles(width, minWidth, maxWidth, style)

  return (
    <UITableCell
      ref={cellRef}
      className={cn(
        'table-cell fixed-width-cell h-14',
        isSticky && 'sticky-table-cell',
        (props as { 'data-column-id'?: string })['data-column-id'] ===
          'select' && 'selection-cell',
        className
      )}
      style={baseStyle}
      {...props}
      colSpan={colSpan}>
      <div
        className={cn(
          'cell-wrapper relative h-full flex items-center',
          isSticky && 'sticky-cell-wrapper'
        )}>
        <div
          ref={contentRef}
          className={cn(
            'cell-content w-full',
            isSticky
              ? 'sticky-cell-content'
              : 'overflow-hidden text-ellipsis whitespace-nowrap'
          )}
          title={
            tooltipDisabled ? undefined : rawValue || String(content || '')
          }>
          {content || children}
        </div>

        {showTooltip && !tooltipDisabled && (
          <div className='cell-tooltip'>
            {rawValue || String(content || '')}
          </div>
        )}
      </div>
    </UITableCell>
  )
}
