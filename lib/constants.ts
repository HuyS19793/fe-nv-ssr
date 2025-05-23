// lib/constants.ts
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const

export const FILE_CONSTANTS = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  BYTE_UNITS: {
    BYTE: 1,
    KB: 1024,
    MB: 1024 * 1024,
  },
} as const

export const PAGINATION_CONSTANTS = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_DISPLAYED_PAGES: 10,
} as const

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  NOT_ACCEPTABLE: 406,
  INTERNAL_SERVER_ERROR: 500,
} as const

export const UI_CONSTANTS = {
  TOAST_DURATION: 5000,
  STICKY_Z_INDEX: {
    HEADER: 50,
    STICKY_HEADER: 100,
    STICKY_CELL: 40,
  },
  CELL_DIMENSIONS: {
    SELECT_WIDTH: 56,
    PROJECT_WIDTH: 256,
    STATUS_WIDTH: 128,
    DEFAULT_WIDTH: 180,
    MODIFIED_WIDTH: 200,
  },
} as const
