import { revalidateTag, revalidatePath } from 'next/cache'

interface RefreshRequest {
  keys?: string[]
  paths?: string[]
  entity?: string
  entityId?: string
}

export function handleCacheKeys(keys: string[]) {
  for (const key of keys) {
    try {
      revalidateTag(key)
    } catch (error) {
      console.error(`Failed to revalidate tag: ${key}`, error)
    }
  }
}

export function handleCachePaths(paths: string[]) {
  for (const path of paths) {
    try {
      revalidatePath(path, 'layout')
    } catch (error) {
      console.error(`Failed to revalidate path: ${path}`, error)
    }
  }
}

export function handleEntityInvalidation(entity: string, entityId?: string) {
  const tags = [`${entity}-list`]
  if (entityId) tags.push(`${entity}-${entityId}`)

  for (const tag of tags) {
    try {
      revalidateTag(tag)
    } catch (error) {
      console.error(`Failed to revalidate tag: ${tag}`, error)
    }
  }

  try {
    revalidatePath(`/${entity}`, 'layout')
  } catch (error) {
    console.error(`Failed to revalidate path: /${entity}`, error)
  }
}

export function processRefreshRequest(request: RefreshRequest) {
  const { keys = [], paths = [], entity, entityId } = request

  if (keys.length > 0) {
    handleCacheKeys(keys)
  }

  if (paths.length > 0) {
    handleCachePaths(paths)
  }

  if (entity) {
    handleEntityInvalidation(entity, entityId)
  }
}
