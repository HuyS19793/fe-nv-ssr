// hooks/use-table-selection.ts
'use client'

import { useState, useCallback } from 'react'

interface UseTableSelectionProps<T> {
  data: T[]
  idField?: keyof T
}

/**
 * Hook to manage selection state for tables
 * Supports selecting/deselecting individual items and all items
 */
export function useTableSelection<T>({
  data,
  idField = 'id' as keyof T,
}: UseTableSelectionProps<T>) {
  // Set to store selected item IDs
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Check if an item is selected
  const isSelected = useCallback(
    (item: T) => {
      const id = String(item[idField])
      return selectedItems.has(id)
    },
    [selectedItems, idField]
  )

  // Check if all items are selected
  const isAllSelected = useCallback(() => {
    return data.length > 0 && selectedItems.size === data.length
  }, [data, selectedItems])

  // Toggle selection of an individual item
  const toggleSelection = useCallback(
    (item: T) => {
      const id = String(item[idField])
      setSelectedItems((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(id)) {
          newSet.delete(id)
        } else {
          newSet.add(id)
        }
        return newSet
      })
    },
    [idField]
  )

  // Toggle selection of all items
  const toggleSelectAll = useCallback(() => {
    if (isAllSelected()) {
      // If all are selected, clear the selection
      setSelectedItems(new Set())
    } else {
      // Otherwise, select all items
      const newSelection = new Set<string>()
      data.forEach((item) => {
        newSelection.add(String(item[idField]))
      })
      setSelectedItems(newSelection)
    }
  }, [data, isAllSelected, idField])

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedItems(new Set())
  }, [])

  // Get array of selected IDs
  const getSelectedIds = useCallback(
    () => Array.from(selectedItems),
    [selectedItems]
  )

  return {
    selectedItems,
    isSelected,
    isAllSelected,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    getSelectedIds,
    selectionCount: selectedItems.size,
  }
}
