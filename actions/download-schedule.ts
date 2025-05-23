'use server'

import { auth } from '@/lib/auth'

interface DownloadScheduleParams {
  jobType: 'NAVI' | 'CVER'
}

interface DownloadResult {
  success: boolean
  data?: string // base64 encoded CSV data
  filename?: string
  error?: string
}

/**
 * Server action to download all scheduled jobs as CSV
 */
export async function downloadScheduleJobsCSV({
  jobType,
}: DownloadScheduleParams): Promise<DownloadResult> {
  try {
    // Check authentication
    const user = await auth.getCurrentUser()
    if (!user || !user.access) {
      return {
        success: false,
        error: 'Not authenticated',
      }
    }

    // Validate job type
    if (!['NAVI', 'CVER'].includes(jobType)) {
      return {
        success: false,
        error: 'Invalid job type',
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    if (!baseUrl) {
      return {
        success: false,
        error: 'API URL not configured',
      }
    }

    const apiUrl = `${baseUrl}/job/scheduled-job/to_csv?job_type=${jobType}`

    // Try different Accept header formats
    const acceptHeaders = [
      'text/csv',
      'application/csv',
      'text/plain',
      'application/octet-stream',
      '*/*',
    ]

    let response: Response | null = null
    let lastError: string = ''

    for (const acceptHeader of acceptHeaders) {
      try {
        response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            Accept: acceptHeader,
            Authorization: `Bearer ${user.access}`,
          },
        })

        if (response.ok) {
          break // Success with this header
        } else if (response.status === 401) {
          return {
            success: false,
            error: 'Authentication failed',
          }
        } else if (response.status !== 406) {
          break
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
        continue
      }
    }

    if (!response || !response.ok) {
      let errorMessage = 'Failed to download CSV'

      if (response) {
        try {
          const errorData = await response.json()
          errorMessage =
            errorData.detail || errorData.message || `HTTP ${response.status}`
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
      } else {
        errorMessage = lastError || 'Network error'
      }

      return {
        success: false,
        error: errorMessage,
      }
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = `ALL_${jobType}_SCHEDULED_JOB.csv`

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      )
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '')
      }
    }

    // Convert response to base64
    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')

    return {
      success: true,
      data: base64,
      filename,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}
