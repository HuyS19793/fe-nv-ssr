'use server'

import { auth } from '@/lib/auth'
import { revalidateTag, revalidatePath } from 'next/cache'

/**
 * Validates if a file has a valid type based on both MIME type and extension
 */
function isValidFileType(file: File): boolean {
  // Check MIME type
  const validMimeTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel.sheet.macroEnabled.12',
  ]

  // Check file extension
  const filename = file.name.toLowerCase()
  const validExtensions = ['.csv', '.xlsx', '.xls', '.xlsm']

  // Return true if either MIME type or extension is valid
  return (
    validMimeTypes.includes(file.type) ||
    validExtensions.some((ext) => filename.endsWith(ext))
  )
}

/**
 * Server action to upload a file and create scheduled jobs
 */
export async function uploadScheduledJobFile(formData: FormData): Promise<{
  success: boolean
  message?: string
  error?: string
  jobIds?: string[]
}> {
  try {
    // Check authentication
    const user = await auth.getCurrentUser()
    if (!user || !user.access) {
      throw new Error('Not authenticated')
    }

    // Get file and job type from form data
    const file = formData.get('file') as File
    const jobType = formData.get('jobType') as 'NAVI' | 'CVER'

    if (!file) {
      return { success: false, error: 'No file provided' }
    }

    // Validate file type using the new function
    if (!isValidFileType(file)) {
      return {
        success: false,
        error: 'Invalid file type. Please upload a CSV or Excel file.',
      }
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024 // 50MB in bytes
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size exceeds the 50MB limit.',
      }
    }

    // Create a new FormData to send to the API
    const apiFormData = new FormData()
    apiFormData.append('file', file)
    apiFormData.append('job_type', jobType)

    // Call the API
    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    if (!baseUrl) {
      throw new Error('API URL not configured')
    }

    const apiUrl = `${baseUrl}/job/upload/scheduled-jobs/`
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${user.access}`,
      },
      body: apiFormData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        error:
          errorData.message || `Upload failed with status: ${response.status}`,
      }
    }

    const result = await response.json()

    // More aggressive cache invalidation strategy
    // 1. Revalidate specific tag with job type
    revalidateTag(`scheduledJobs-${jobType}`)

    // 2. Also revalidate the other job type to be safe
    revalidateTag(
      jobType === 'NAVI' ? 'scheduledJobs-CVER' : 'scheduledJobs-NAVI'
    )

    // 3. Revalidate any filter combinations by using a wildcard tag
    revalidateTag('scheduled-jobs-list')

    // 4. The most important part: revalidate the schedule path with filters
    // This will clear all cached filtered views
    revalidatePath('/schedule', 'layout')
    revalidatePath('/[locale]/schedule', 'layout')

    return {
      success: true,
      message: 'Jobs created successfully',
      jobIds: result.job_ids || [],
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An error occurred during upload',
    }
  }
}
