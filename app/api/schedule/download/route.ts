import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * GET handler for downloading scheduled jobs CSV
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await auth.getCurrentUser()
    if (!user || !user.access) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams
    const jobType = searchParams.get('jobType')

    if (!jobType || !['NAVI', 'CVER'].includes(jobType)) {
      return NextResponse.json({ error: 'Invalid job type' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL
    if (!baseUrl) {
      return NextResponse.json(
        { error: 'API URL not configured' },
        { status: 500 }
      )
    }

    const apiUrl = `${baseUrl}/job/scheduled-job/to_csv?job_type=${jobType}`

    // Try different Accept headers
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
          return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 401 }
          )
        } else if (response.status !== 406) {
          break
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
        continue
      }
    }

    if (!response || !response.ok) {
      let errorMessage = 'Failed to fetch CSV data'

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

      return NextResponse.json(
        { error: errorMessage },
        { status: response?.status || 500 }
      )
    }

    // Get the CSV data
    const csvData = await response.arrayBuffer()

    // Get filename from Content-Disposition header or use default
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

    // Return the file with proper headers
    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
        'Content-Length': csvData.byteLength.toString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to download CSV',
      },
      { status: 500 }
    )
  }
}
