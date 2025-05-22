'use server'

import { invalidateCache, cacheInvalidation } from './cache-utils'
import { redirect } from 'next/navigation'

type ActionOptions = {
  invalidate?: {
    tags?: string[]
    tagPatterns?: string[]
    paths?: string[]
    entity?: string
    predefined?: keyof typeof cacheInvalidation
  }
  redirectTo?: string
}

/**
 * Wraps a server action with automatic cache invalidation
 */
export function withCacheInvalidation<T, A extends any[]>(
  action: (...args: A) => Promise<T>,
  options: ActionOptions = {}
) {
  return async (...args: A): Promise<T> => {
    // Execute the original action
    const result = await action(...args)

    // Handle cache invalidation
    if (options.invalidate) {
      const { tags, tagPatterns, paths, entity, predefined } =
        options.invalidate

      // Use predefined invalidation function if specified
      if (predefined && predefined in cacheInvalidation) {
        // @ts-ignore - We've already checked that the key exists
        cacheInvalidation[predefined]()
      }
      // Entity-based invalidation
      else if (entity) {
        cacheInvalidation.entity(entity)
      }
      // Custom invalidation
      else {
        invalidateCache({
          tags,
          tagPatterns,
          paths,
        })
      }
    }

    // Handle redirect if specified
    if (options.redirectTo) {
      redirect(options.redirectTo)
    }

    return result
  }
}

/**
 * Helper to create a server action with cache invalidation
 * Useful when you want to define the action inline
 */
export function createAction<T, A extends any[]>(
  action: (...args: A) => Promise<T>,
  options: ActionOptions = {}
) {
  return withCacheInvalidation(action, options)
}
