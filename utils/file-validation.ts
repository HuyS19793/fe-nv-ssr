export interface FileValidationResult {
  isValid: boolean
  errors: {
    type?: string
    size?: string
  }
}

export interface FileValidationOptions {
  maxSize?: number // in bytes
  allowedTypes?: string[]
  allowedExtensions?: string[]
}

const DEFAULT_OPTIONS: Required<FileValidationOptions> = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
  ],
  allowedExtensions: ['.csv', '.xlsx', '.xls', '.xlsm'],
}

export const validateFile = (
  file: File,
  options: FileValidationOptions = {},
  errorMessages?: {
    invalidType?: string
    fileTooLarge?: string
  }
): FileValidationResult => {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const errors: FileValidationResult['errors'] = {}

  // Validate file type
  const filename = file.name.toLowerCase()
  const hasValidType = opts.allowedTypes.includes(file.type)
  const hasValidExtension = opts.allowedExtensions.some((ext) =>
    filename.endsWith(ext)
  )

  if (!hasValidType && !hasValidExtension) {
    errors.type = errorMessages?.invalidType || 'Invalid file type'
  }

  // Validate file size
  if (file.size > opts.maxSize) {
    const maxSizeMB = Math.round(opts.maxSize / (1024 * 1024))
    errors.size =
      errorMessages?.fileTooLarge || `File size exceeds ${maxSizeMB}MB limit`
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export const isValidFileType = (file: File): boolean => {
  return validateFile(file).isValid
}
