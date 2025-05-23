'use client'

import { ColumnDef, RowData, CellContext } from '@tanstack/react-table'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TableCell } from '@/components/tables/TableCell'
import { Button } from '@/components/ui/button'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import { useServerTable } from '@/hooks/use-server-table'
import { cn } from '@/lib/utils'

// Custom column meta interface
interface CustomColumnMeta {
  width?: string
  minWidth?: string
  maxWidth?: string
  isSticky?: boolean
  stickyPosition?: number
}

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue>
    extends CustomColumnMeta {}
}

interface EnhancedServerDataTableProps<TData> {
  columns: ColumnDef<TData, any>[]
  data: TData[]
  pagination: {
    pageCount: number
    page: number
    limit: number
  }
  totalCount: number
  searchPlaceholder?: string
  searchValue?: string
  maxHeight?: string | number
}

export function EnhancedServerDataTable<TData>({
  columns,
  data,
  pagination,
  totalCount,
  searchPlaceholder = 'Search...',
  searchValue = '',
  maxHeight = '70vh',
}: EnhancedServerDataTableProps<TData>) {
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const { search, setSearch, handleSearch, goToPage } = useServerTable({
    initialSearch: searchValue,
  })

  // Calculate visible range
  const { page, pageCount, limit } = pagination
  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(startItem + limit - 1, totalCount)

  // Helper functions
  const createTableRow = (record: TData, index: number) => ({
    id: index.toString(),
    original: record,
    getValue: (id: string) => (record as any)[id],
  })

  const renderCellOrHeader = (content: any) => {
    return typeof content === 'function' ? content() : content
  }

  const renderCellContent = (column: ColumnDef<TData, any>, row: any) => {
    if (column.cell) {
      if (typeof column.cell === 'function') {
        const cellContext = {
          row,
          column,
          getValue: row.getValue,
        } as unknown as CellContext<TData, any>
        return column.cell(cellContext)
      }
      return column.cell
    }
    return row.getValue(column.id as string)
  }

  // Calculate sticky positioning without actions column
  const calculateStickyLeftPosition = (columnIndex: number): string => {
    let leftPosition = 0

    for (let i = 0; i < columnIndex; i++) {
      const col = columns[i]
      if (col.meta?.isSticky) {
        const width = col.meta.width || '180px'
        const widthValue = parseInt(width, 10)
        leftPosition += widthValue
      }
    }

    return `${leftPosition}px`
  }

  const maxHeightStyle =
    typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight

  return (
    <div className='space-y-4 w-full'>
      {/* Search field */}
      <div className='flex items-center justify-between gap-4'>
        <form onSubmit={handleSearch} className='relative flex-1 max-w-sm'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className='pl-8'
          />
        </form>
      </div>

      {/* Enhanced Table Container */}
      <div className='enhanced-sticky-table' ref={tableContainerRef}>
        <div className='table-scroll-container table-scroll-smooth'>
          <div
            className='table-scroll-body'
            style={{ maxHeight: maxHeightStyle }}>
            <Table className='fixed-header-table'>
              <TableHeader className='enhanced-sticky-header'>
                <TableRow>
                  {columns.map((column, colIndex) => {
                    const width = column.meta?.width || '160px'
                    const minWidth = column.meta?.minWidth || '120px'
                    const maxWidth = column.meta?.maxWidth || '200px'
                    const isSticky = column.meta?.isSticky || false
                    const stickyPosition = column.meta?.stickyPosition || 0

                    const leftPosition = isSticky
                      ? calculateStickyLeftPosition(colIndex)
                      : undefined

                    const zIndex = isSticky ? 100 - stickyPosition : undefined

                    // Get specific pinned class based on position (updated for no actions)
                    const getPinnedClass = (position: number) => {
                      switch (position) {
                        case 0:
                          return 'pinned-select'
                        case 1:
                          return 'pinned-name'
                        case 2:
                          return 'pinned-status'
                        default:
                          return ''
                      }
                    }

                    return (
                      <TableHead
                        key={column.id}
                        className={cn(
                          'table-header-cell',
                          isSticky && 'enhanced-pinned-header',
                          isSticky && getPinnedClass(stickyPosition)
                        )}
                        style={{
                          width,
                          minWidth,
                          maxWidth,
                          ...(isSticky && {
                            position: 'sticky',
                            left: leftPosition,
                            zIndex,
                          }),
                        }}>
                        {renderCellOrHeader(column.header)}
                      </TableHead>
                    )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((record, index) => {
                    const row = createTableRow(record, index)
                    const rowBg =
                      index % 2 === 0
                        ? 'var(--sticky-cell-even-bg)'
                        : 'var(--sticky-cell-odd-bg)'

                    return (
                      <TableRow
                        key={index}
                        className={cn(
                          'table-row',
                          index % 2 === 0 ? 'table-row-even' : 'table-row-odd'
                        )}>
                        {columns.map((column, colIndex) => {
                          const rawValue = String(
                            (record as any)[column.id as string] || ''
                          )

                          const width = column.meta?.width || '160px'
                          const minWidth = column.meta?.minWidth || '120px'
                          const maxWidth = column.meta?.maxWidth || '200px'
                          const isSticky = column.meta?.isSticky || false
                          const stickyPosition =
                            column.meta?.stickyPosition || 0

                          const leftPosition = isSticky
                            ? calculateStickyLeftPosition(colIndex)
                            : undefined

                          const zIndex = isSticky
                            ? 50 - stickyPosition
                            : undefined

                          const getPinnedClass = (position: number) => {
                            switch (position) {
                              case 0:
                                return 'pinned-select'
                              case 1:
                                return 'pinned-name'
                              case 2:
                                return 'pinned-status'
                              default:
                                return ''
                            }
                          }

                          return (
                            <TableCell
                              key={`${index}-${column.id}`}
                              content={renderCellContent(column, row)}
                              rawValue={rawValue}
                              width={width}
                              minWidth={minWidth}
                              maxWidth={maxWidth}
                              isSticky={isSticky}
                              className={cn(
                                'enhanced-table-cell',
                                isSticky && 'enhanced-pinned-column',
                                isSticky && getPinnedClass(stickyPosition)
                              )}
                              style={{
                                ...(isSticky && {
                                  position: 'sticky',
                                  left: leftPosition,
                                  zIndex,
                                  backgroundColor: rowBg,
                                }),
                              }}
                            />
                          )
                        })}
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      content='No results.'
                      className='h-24 text-center'
                    />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className='flex flex-col sm:flex-row items-center justify-between gap-4 py-4'>
        <div className='text-sm text-muted-foreground'>
          {totalCount > 0 ? (
            <>
              Showing {startItem} to {endItem} of {totalCount} items
            </>
          ) : (
            'No results'
          )}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => goToPage(1)}
            disabled={page <= 1}>
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <span className='flex items-center gap-1 text-sm'>
            <span>Page</span>
            <strong>
              {page} of {pageCount || 1}
            </strong>
          </span>
          <Button
            variant='outline'
            size='sm'
            onClick={() => goToPage(page + 1)}
            disabled={page >= pageCount}>
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => goToPage(pageCount)}
            disabled={page >= pageCount}>
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
