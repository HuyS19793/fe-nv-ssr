/**
 * Filter item representation for scheduled jobs
 */
export interface FilterItem {
  key: string // Database field name (e.g., 'job_status', 'job_name')
  value: string // User input value for filtering
  include: boolean // true = include (positive filter), false = exclude (NOT filter)
}

/**
 * Available filter field metadata
 */
export type FilterField = {
  key: string // Database field name
  label: string // Display name for UI
  type: 'text' | 'select' | 'boolean' | 'date' // Input type
  options?: { value: string; label: string }[] // For select type fields
}

/**
 * Filter state interface
 */
export interface FilterState {
  jobType: 'NAVI' | 'CVER'
  searchValue: string
  currentPage: number
  rowsPerPage: number
  filters: FilterItem[]
}
