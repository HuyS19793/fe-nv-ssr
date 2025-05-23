// app/api/schedule/jobs/[id]/route.ts
import { revalidateTag } from 'next/cache'
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server'

import {
  deleteScheduledJob,
  updateScheduledJob,
} from '@/actions/schedule/server-actions'

export async function PATCH(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    const id = pathname.split('/').pop()
    if (!id) throw new Error('Job ID is required')
    const body = await request.json()

    // Update the job
    const updatedJob = await updateScheduledJob({
      id,
      ...body,
    })

    // Revalidate cache tags
    revalidateTag('scheduledJobs-NAVI')
    revalidateTag('scheduledJobs-CVER')

    return NextResponse.json({
      success: true,
      job: updatedJob,
    })
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update job',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    const id = pathname.split('/').pop()
    if (!id) throw new Error('Job ID is required')

    // Delete the job
    await deleteScheduledJob(id)

    // Revalidate cache tags
    revalidateTag('scheduledJobs-NAVI')
    revalidateTag('scheduledJobs-CVER')

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete job',
      },
      { status: 500 }
    )
  }
}
