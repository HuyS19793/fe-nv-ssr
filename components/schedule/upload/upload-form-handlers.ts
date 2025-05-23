import { FILE_CONSTANTS } from '@/lib/constants'

interface ValidationError {
  type?: string
  size?: string
}

interface FileValidationResult {
  isValid: boolean
  errors: ValidationError
}

const VALID_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
]

const VALID_EXTENSIONS = ['.csv', '.xlsx', '.xls', '.xlsm']

export function validateUploadFile(
  file: File,
  translations: {
    invalidFileType: string
    fileSizeTooLarge: string
  }
): FileValidationResult {
  const errors: ValidationError = {}

  // Check file type
  const fileName = file.name.toLowerCase()
  const hasValidExtension = VALID_EXTENSIONS.some((ext) =>
    fileName.endsWith(ext)
  )

  if (!VALID_TYPES.includes(file.type) && !hasValidExtension) {
    errors.type = translations.invalidFileType
  }

  // Check file size
  if (file.size > FILE_CONSTANTS.MAX_FILE_SIZE) {
    errors.size = translations.fileSizeTooLarge
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

export function createUploadFormData(file: File, jobType: string): FormData {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('jobType', jobType)
  return formData
}
