// components/tables/TableCell.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { TableCell as UITableCell } from '@/components/ui/table'
import { ReactNode } from 'react'

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

  // Check if content is overflowing and needs tooltip
  useEffect(() => {
    if (tooltipDisabled || !contentRef.current) return

    const checkOverflow = () => {
      const element = contentRef.current
      if (!element) return

      // Check if content is overflowing
      const isOverflowing = element.scrollWidth > element.clientWidth
      setShowTooltip(isOverflowing)
    }

    // Check on initial render
    checkOverflow()

    // Setup resize observer to check when container size changes
    const resizeObserver = new ResizeObserver(checkOverflow)
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [content, tooltipDisabled])

  // Define base styles
  const baseStyle = {
    ...style,
    ...(width && { width }),
    ...(minWidth && { minWidth }),
    ...(maxWidth && { maxWidth }),
  } as React.CSSProperties

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

        {/* Custom tooltip for larger content - optional enhancement */}
        {showTooltip && !tooltipDisabled && (
          <div className='cell-tooltip'>
            {rawValue || String(content || '')}
          </div>
        )}
      </div>
    </UITableCell>
  )
}
