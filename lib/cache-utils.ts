import { revalidateTag, revalidatePath } from 'next/cache'

type CacheInvalidationOptions = {
  tags?: string[] // Specific cache tags to invalidate
  tagPatterns?: string[] // Tag patterns with wildcards (e.g., 'posts-*')
  paths?: string[] // Specific paths to invalidate
  layout?: boolean // Whether to invalidate layout or just the page
  allFetchData?: boolean // Whether to invalidate all fetch data
}

/**
 * Flexible utility to invalidate various types of caches
 */
export function invalidateCache({
  tags = [],
  tagPatterns = [],
  paths = [],
  layout = true,
  allFetchData = false,
}: CacheInvalidationOptions = {}) {
  // 1. Revalidate specific tags
  tags.forEach((tag) => {
    try {
      revalidateTag(tag)
    } catch (error) {
      console.error(`Failed to revalidate tag: ${tag}`, error)
    }
  })

  // 2. Revalidate tag patterns by generating variants
  tagPatterns.forEach((pattern) => {
    try {
      // For wildcard patterns, we can revalidate the base tag
      const baseTag = pattern.replace('*', '')
      if (baseTag) revalidateTag(baseTag)

      // If it's a specific pattern like 'data-*', revalidate it directly
      revalidateTag(pattern)
    } catch (error) {
      console.error(`Failed to revalidate tag pattern: ${pattern}`, error)
    }
  })

  // 3. Revalidate specific paths
  paths.forEach((path) => {
    try {
      // Determine if we should invalidate just the page or the layout too
      const type = layout ? 'layout' : 'page'
      revalidatePath(path, type)

      // Also try with locale pattern for i18n apps
      if (path.startsWith('/') && !path.includes('[locale]')) {
        revalidatePath(`/[locale]${path}`, type)
      }
    } catch (error) {
      console.error(`Failed to revalidate path: ${path}`, error)
    }
  })

  // 4. If allFetchData is true, invalidate a special tag that can be used as a marker
  if (allFetchData) {
    try {
      const timestamp = Date.now()
      // Use a timestamp-based tag to force full refetch
      revalidateTag(`global-cache-${timestamp}`)
      // Also revalidate a fixed tag that can be used in data fetching
      revalidateTag('global-cache')
    } catch (error) {
      console.error('Failed to invalidate all fetch data', error)
    }
  }
}

/**
 * Predefined cache invalidation for common scenarios
 */
export const cacheInvalidation = {
  // Invalidate schedule jobs data
  scheduleJobs: (jobType?: 'NAVI' | 'CVER') => {
    const tags = ['scheduled-jobs-list']
    if (jobType) {
      tags.push(`scheduledJobs-${jobType}`)
    } else {
      tags.push('scheduledJobs-NAVI', 'scheduledJobs-CVER')
    }

    invalidateCache({
      tags,
      tagPatterns: ['scheduled-jobs-*', 'scheduledJobs-*'],
      paths: ['/schedule'],
    })
  },

  // Generic function to invalidate entity-based data
  entity: (entityType: string, id?: string) => {
    const tags = [`${entityType}-list`]
    if (id) tags.push(`${entityType}-${id}`)

    invalidateCache({
      tags,
      tagPatterns: [`${entityType}-*`],
      paths: [`/${entityType}`],
    })
  },

  // Complete invalidation for the application
  all: () => {
    invalidateCache({
      paths: ['/'],
      allFetchData: true,
    })
  },
}
