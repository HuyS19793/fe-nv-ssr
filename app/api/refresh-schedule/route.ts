import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobType, filters = {}, timestamp } = body

    // Revalidate specific cache tags
    revalidateTag(`scheduledJobs-${jobType}`)
    revalidateTag('scheduled-jobs-list')

    // Also revalidate the other job type to be safe
    const otherJobType = jobType === 'NAVI' ? 'CVER' : 'NAVI'
    revalidateTag(`scheduledJobs-${otherJobType}`)

    // Create filter-specific cache invalidation
    if (Object.keys(filters).length > 0) {
      const filterHash = Object.entries(filters)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}-${value}`)
        .join('-')

      revalidateTag(`scheduled-jobs-list-${filterHash}`)
    }

    // Revalidate the schedule page path
    revalidatePath('/schedule', 'layout')
    revalidatePath('/[locale]/schedule', 'layout')

    return NextResponse.json({
      success: true,
      timestamp,
      revalidated: {
        tags: [
          `scheduledJobs-${jobType}`,
          'scheduled-jobs-list',
          `scheduledJobs-${otherJobType}`,
        ],
        paths: ['/schedule', '/[locale]/schedule'],
      },
    })
  } catch (error) {
    console.error('Error refreshing schedule data:', error)
    return NextResponse.json(
      { error: 'Failed to refresh data' },
      { status: 500 }
    )
  }
}
