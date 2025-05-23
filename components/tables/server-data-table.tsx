// components/tables/server-data-table.tsx
'use client'

import { useEffect, useRef,useState } from 'react'

import type { CellContext,ColumnDef, RowData } from '@tanstack/react-table'
import { Search } from 'lucide-react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

import { TableCell } from '@/components/tables/TableCell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useServerTable } from '@/hooks/use-server-table'
import { cn } from '@/lib/utils'

// Define custom column meta type with sticky properties
interface CustomColumnMeta {
  width?: string
  minWidth?: string
  maxWidth?: string
  isSticky?: boolean
  stickyPosition?: number
}

// Extend RowData to include custom column meta
declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue>
    extends CustomColumnMeta {}
}

interface ServerDataTableProps<TData> {
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
  filterComponent?: React.ReactNode
}

export function ServerDataTable<TData>({
  columns,
  data,
  pagination,
  totalCount,
  searchPlaceholder = 'Search...',
  searchValue = '',
  maxHeight = '70vh',
  filterComponent,
}: ServerDataTableProps<TData>) {
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number | null>(null)

  const { search, setSearch, handleSearch, goToPage } = useServerTable({
    initialSearch: searchValue,
  })

  // Update container width on resize
  useEffect(() => {
    if (!tableContainerRef.current) return

    const updateWidth = () => {
      if (tableContainerRef.current) {
        setContainerWidth(tableContainerRef.current.clientWidth)
      }
    }

    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => {
      window.removeEventListener('resize', updateWidth)
    }
  }, [])

  // Calculate visible range
  const { page, pageCount, limit } = pagination
  const startItem = (page - 1) * limit + 1
  const endItem = Math.min(startItem + limit - 1, totalCount)

  // Helper function to create a mock row that behaves like a TanStack Table row
  const createTableRow = (record: TData, index: number) => {
    return {
      id: index.toString(),
      original: record,
      getValue: (id: string) => {
        return (record as any)[id]
      },
    }
  }

  // Helper to safely render cell or header content
  const renderCellOrHeader = (content: any) => {
    if (typeof content === 'function') {
      return content()
    }
    return content
  }

  // Helper to safely render cell content with fallback
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

  // Helper to calculate left position for sticky columns - FIX
  const calculateStickyLeftPosition = (columnIndex: number): string => {
    let leftPosition = 0

    // Calculate based on actual sticky columns before this one
    for (let i = 0; i < columnIndex; i++) {
      const col = columns[i]
      if (col.meta?.isSticky) {
        // Get width from meta or use default
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
      {/* Search field and filter button in the same row */}
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
        {filterComponent}
      </div>

      {/* Table Container with proper sticky support */}
      <div className='data-table-container' ref={tableContainerRef}>
        <div className='table-scroll-container'>
          <div
            className='table-scroll-body'
            style={{ maxHeight: maxHeightStyle }}>
            <Table className='fixed-header-table'>
              <TableHeader className='table-header-group'>
                <TableRow>
                  {columns.map((column, colIndex) => {
                    const width =
                      column.meta?.width ||
                      (column.id === 'select'
                        ? '56px'
                        : column.id === 'modified'
                        ? '200px'
                        : column.id === 'job_name'
                        ? '256px'
                        : column.id === 'job_status'
                        ? '128px'
                        : '180px')

                    const minWidth =
                      column.meta?.minWidth ||
                      (column.id === 'select' ? '56px' : '120px')

                    const maxWidth =
                      column.meta?.maxWidth ||
                      (column.id === 'select'
                        ? '56px'
                        : column.id === 'job_name'
                        ? '300px'
                        : '250px')

                    const isSticky = column.meta?.isSticky || false
                    const stickyPosition = column.meta?.stickyPosition || 0

                    const leftPosition = isSticky
                      ? calculateStickyLeftPosition(colIndex)
                      : undefined

                    const zIndex = isSticky ? 40 - stickyPosition : undefined

                    return (
                      <TableHead
                        key={column.id}
                        className={cn(
                          'table-header-cell',
                          isSticky && 'sticky-column-header'
                        )}
                        style={{
                          width,
                          minWidth,
                          maxWidth,
                          ...(isSticky && {
                            position: 'sticky',
                            left: leftPosition,
                            zIndex,
                            backgroundColor: 'var(--sticky-header-bg)',
                            boxShadow: 'var(--shadow-sticky-column)',
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

                          const width =
                            column.meta?.width ||
                            (column.id === 'select'
                              ? '56px'
                              : column.id === 'modified'
                              ? '200px'
                              : column.id === 'job_name'
                              ? '256px'
                              : column.id === 'job_status'
                              ? '128px'
                              : '180px')

                          const minWidth =
                            column.meta?.minWidth ||
                            (column.id === 'select' ? '56px' : '120px')

                          const maxWidth =
                            column.meta?.maxWidth ||
                            (column.id === 'select'
                              ? '56px'
                              : column.id === 'job_name'
                              ? '300px'
                              : '250px')

                          const isSticky = column.meta?.isSticky || false
                          const stickyPosition =
                            column.meta?.stickyPosition || 0

                          const leftPosition = isSticky
                            ? calculateStickyLeftPosition(colIndex)
                            : undefined

                          const zIndex = isSticky
                            ? 30 - stickyPosition
                            : undefined

                          return (
                            <TableCell
                              key={`${index}-${column.id}`}
                              content={renderCellContent(column, row)}
                              rawValue={rawValue}
                              width={width}
                              minWidth={minWidth}
                              maxWidth={maxWidth}
                              isSticky={isSticky}
                              className={cn(isSticky && 'sticky-column-cell')}
                              style={{
                                ...(isSticky && {
                                  position: 'sticky',
                                  left: leftPosition,
                                  zIndex,
                                  backgroundColor: rowBg,
                                  boxShadow: 'var(--shadow-sticky-column)',
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
                      content={
                        <div className='flex flex-col items-center gap-2'>
                          <div className='text-4xl'>📊</div>
                          <div>No results found</div>
                        </div>
                      }
                      className='h-24 text-center'
                    />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Enhanced Pagination */}
      <div className='flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2'>
        <div className='text-sm text-muted-foreground font-medium'>
          {totalCount > 0 ? (
            <>
              Showing{' '}
              <span className='font-semibold text-foreground'>{startItem}</span>{' '}
              to{' '}
              <span className='font-semibold text-foreground'>{endItem}</span>{' '}
              of{' '}
              <span className='font-semibold text-foreground'>
                {totalCount}
              </span>{' '}
              items
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
            disabled={page <= 1}
            className='h-9 px-3'>
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
            className='h-9 px-3'>
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <div className='flex items-center gap-1 text-sm font-medium px-3 py-2 rounded-md bg-muted/50'>
            <span>Page</span>
            <span className='font-bold text-primary'>{page}</span>
            <span>of</span>
            <span className='font-bold'>{pageCount || 1}</span>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => goToPage(page + 1)}
            disabled={page >= pageCount}
            className='h-9 px-3'>
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => goToPage(pageCount)}
            disabled={page >= pageCount}
            className='h-9 px-3'>
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
