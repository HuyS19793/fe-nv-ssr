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
  stickyLeft?: string
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
        const width = col.meta.width || '160px'
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
        <div className='relative w-full min-h-[42rem]'>
          <div className='[&>.tableContainer]:overflow-x-auto'>
            <Table className='w-full border-separate border-spacing-0'>
              <TableHeader className='sticky top-0 z-20 bg-white border-b-2 border-gray-200'>
                <TableRow>
                  {columns.map((column, colIndex) => {
                    const isSticky = column.meta?.isSticky || false
                    const stickyLeft = column.meta?.stickyLeft
                    const className = column.meta?.className || 'flex-none w-32'

                    return (
                      <TableHead
                        key={column.id}
                        className={cn(
                          'py-3 px-0 text-left align-middle font-semibold text-foreground whitespace-nowrap border-r border-gray-100',
                          className,
                          isSticky &&
                            'sticky bg-white z-30 border-r-2 border-gray-200'
                        )}
                        style={{
                          ...(isSticky &&
                            stickyLeft && {
                              left: stickyLeft,
                              boxShadow: '2px 0 4px -2px rgba(0, 0, 0, 0.1)',
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
                    const isEven = index % 2 === 0

                    return (
                      <TableRow
                        key={index}
                        className={cn(
                          'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                          isEven ? 'bg-white' : 'bg-gray-50/30'
                        )}>
                        {columns.map((column, colIndex) => {
                          const isSticky = column.meta?.isSticky || false
                          const stickyLeft = column.meta?.stickyLeft
                          const className =
                            column.meta?.className || 'flex-none w-32'

                          return (
                            <TableCell
                              key={`${index}-${column.id}`}
                              className={cn(
                                'py-0 px-0 align-middle relative border-r border-gray-50',
                                className,
                                isSticky &&
                                  'sticky z-10 border-r-2 border-gray-100',
                                isSticky &&
                                  (isEven ? 'bg-white' : 'bg-gray-50/30')
                              )}
                              style={{
                                ...(isSticky &&
                                  stickyLeft && {
                                    left: stickyLeft,
                                    boxShadow:
                                      '2px 0 4px -2px rgba(0, 0, 0, 0.1)',
                                  }),
                              }}>
                              {renderCellContent(column, row)}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className='h-24 text-center text-gray-500'>
                      No results.
                    </TableCell>
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
