export interface ErrorInfo {
  message: string
  code?: string
  statusCode?: number
}

export const extractErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message)
  }

  return 'An unexpected error occurred'
}

export const createErrorInfo = (
  error: unknown,
  defaultMessage = 'An error occurred'
): ErrorInfo => {
  const message = extractErrorMessage(error) || defaultMessage

  // Extract status code if available
  let statusCode: number | undefined
  if (error && typeof error === 'object' && 'status' in error) {
    statusCode = Number(error.status)
  }

  return { message, statusCode }
}

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof TypeError && error.message.includes('fetch')
}

export const isAuthError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'status' in error) {
    return Number(error.status) === 401
  }
  return false
}
