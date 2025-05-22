import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag, revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Ensure user is authenticated
    const user = await auth.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { keys = [], paths = [], entity, entityId } = body

    // Handle specific cache keys
    if (keys && keys.length > 0) {
      keys.forEach((key: string) => {
        try {
          revalidateTag(key)
        } catch (e) {
          console.error(`Failed to revalidate tag: ${key}`, e)
        }
      })
    }

    // Handle specific paths
    if (paths && paths.length > 0) {
      paths.forEach((path: string) => {
        try {
          revalidatePath(path, 'layout')
        } catch (e) {
          console.error(`Failed to revalidate path: ${path}`, e)
        }
      })
    }

    // Handle entity-based invalidation
    if (entity) {
      const tags = [`${entity}-list`]
      if (entityId) tags.push(`${entity}-${entityId}`)

      tags.forEach((tag) => {
        try {
          revalidateTag(tag)
        } catch (e) {
          console.error(`Failed to revalidate tag: ${tag}`, e)
        }
      })

      try {
        revalidatePath(`/${entity}`, 'layout')
      } catch (e) {
        console.error(`Failed to revalidate path: /${entity}`, e)
      }
    }

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
