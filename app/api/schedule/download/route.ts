import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  attemptDownload,
  extractFilename,
  handleDownloadError,
} from './download-handlers'

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

    const response = await attemptDownload({
      baseUrl,
      jobType,
      accessToken: user.access,
    })

    if (!response || !response.ok) {
      const errorMessage = response
        ? await handleDownloadError(response)
        : 'Network error'

      return NextResponse.json(
        { error: errorMessage },
        { status: response?.status || 500 }
      )
    }

    // Get the CSV data
    const csvData = await response.arrayBuffer()

    // Get filename from Content-Disposition header or use default
    const contentDisposition = response.headers.get('Content-Disposition')
    const filename = extractFilename(contentDisposition)

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
