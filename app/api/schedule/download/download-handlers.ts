import { HTTP_STATUS } from '@/lib/constants'

interface DownloadOptions {
  baseUrl: string
  jobType: string
  accessToken: string
}

const ACCEPT_HEADERS = [
  'text/csv',
  'application/csv',
  'text/plain',
  'application/octet-stream',
  '*/*',
]

export async function attemptDownload({
  baseUrl,
  jobType,
  accessToken,
}: DownloadOptions): Promise<Response | null> {
  const apiUrl = `${baseUrl}/job/scheduled-job/to_csv?job_type=${jobType}`

  for (const acceptHeader of ACCEPT_HEADERS) {
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          Accept: acceptHeader,
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (response.ok) {
        return response
      }

      if (response.status === HTTP_STATUS.UNAUTHORIZED) {
        throw new Error('Authentication failed')
      }

      if (response.status !== HTTP_STATUS.NOT_ACCEPTABLE) {
        return response
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication failed') {
        throw error
      }
      continue
    }
  }

  return null
}

export function extractFilename(contentDisposition: string | null): string {
  if (!contentDisposition) {
    return 'download.csv'
  }

  const filenameMatch = contentDisposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
  )

  if (filenameMatch && filenameMatch[1]) {
    return filenameMatch[1].replace(/['"]/g, '')
  }

  return 'download.csv'
}

export async function handleDownloadError(response: Response): Promise<string> {
  try {
    const errorData = await response.json()
    return errorData.detail || errorData.message || `HTTP ${response.status}`
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`
  }
}
