import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { processRefreshRequest } from './refresh-handlers'

export async function POST(request: NextRequest) {
  try {
    const user = await auth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    processRefreshRequest(body)

    return NextResponse.json({
      success: true,
      revalidated: true,
      message: 'Cache successfully invalidated',
    })
  } catch (error) {
    console.error('Error in refresh-data API route:', error)
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to refresh data',
      },
      { status: 500 }
    )
  }
}
