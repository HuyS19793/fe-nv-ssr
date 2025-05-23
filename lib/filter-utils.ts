import type { FilterItem } from '@/types/filter'

/**
 * Convert filter items to URL query parameters
 * @param filters Array of filter items
 * @returns Object with filter parameters formatted for API
 */
export function filtersToQueryParams(
  filters: FilterItem[]
): Record<string, string> {
  const params: Record<string, string> = {}

  for (const filter of filters) {
    // For include filters, use field name directly
    // For exclude filters, prefix with 'not_'
    const paramKey = filter.include ? filter.key : `not_${filter.key}`
    params[paramKey] = filter.value
  }

  return params
}

/**
 * Parse URL query parameters to filter items
 * @param params URL search parameters
 * @returns Array of filter items
 */
export function queryParamsToFilters(params: URLSearchParams): FilterItem[] {
  const filters: FilterItem[] = []

  // Standard pagination and search params to skip
  const skipParams = ['page', 'limit', 'search', 'jobType']

  // Process each query parameter
  for (const [key, value] of params.entries()) {
    // Skip standard pagination and search params
    if (skipParams.includes(key)) {
      continue
    }

    // Check if it's an exclude filter (starts with 'not_')
    if (key.startsWith('not_')) {
      filters.push({
        key: key.substring(4), // Remove 'not_' prefix
        value,
        include: false,
      })
    } else {
      filters.push({
        key,
        value,
        include: true,
      })
    }
  }

  return filters
}

/**
 * Group filter fields by category for UI organization
 * @returns Grouped filter fields
 */
export function getFilterFieldGroups() {
  return {
    'Job Info': ['job_status', 'job_name', 'setting_id', 'status'],
    Assignment: ['username', 'is_maintaining'],
    Schedule: ['scheduler_weekday', 'scheduler_time', 'time'],
    Media: [
      'media',
      'media_master_update',
      'media_off',
      'media_master_update_off',
    ],
    Process: [
      'cube_off',
      'conmane_off',
      'redownload_type',
      'redownload',
      'upload',
      'which_process',
    ],
    Configuration: [
      'wait_time',
      'spreadsheet_id',
      'spreadsheet_sheet',
      'custom_info',
    ],
    Account: ['master_account', 'skip_to', 'use_api', 'workplace'],
    Communication: ['chanel_id', 'slack_id'],
  }
}

/**
 * Create a debounced function
 * @param func Function to debounce
 * @param wait Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function (...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout !== null) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}
