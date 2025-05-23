/**
 * Utility functions for handling file downloads
 */

export interface FileDownloadOptions {
  blob: Blob
  filename: string
  mimeType?: string
}

/**
 * Create a downloadable file and trigger browser download
 */
export function createDownloadableFile({
  blob,
  filename,
  mimeType = 'application/octet-stream',
}: FileDownloadOptions): void {
  try {
    // Create object URL
    const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }))

    // Create temporary download link
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.style.display = 'none'

    // Append to DOM, click, and cleanup
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Release object URL
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error creating downloadable file:', error)
    throw new Error('Failed to create downloadable file')
  }
}

/**
 * Extract filename from Content-Disposition header
 */
export function extractFilenameFromHeader(
  contentDisposition: string | null
): string | null {
  if (!contentDisposition) return null

  const filenameMatch = contentDisposition.match(
    /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
  )
  if (filenameMatch && filenameMatch[1]) {
    return filenameMatch[1].replace(/['"]/g, '')
  }

  return null
}

/**
 * Convert base64 string to Blob
 */
export function base64ToBlob(
  base64: string,
  mimeType: string = 'text/csv'
): Blob {
  try {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], { type: mimeType })
  } catch (error) {
    console.error('Error converting base64 to blob:', error)
    throw new Error('Failed to convert base64 data to blob')
  }
}

/**
 * Sanitize filename to prevent path traversal and invalid characters
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
    .replace(/\.\./g, '_') // Prevent path traversal
    .substring(0, 255) // Limit length
    .trim()
}

/**
 * Check if browser supports file downloads
 */
export function isBrowserDownloadSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'URL' in window &&
    'createObjectURL' in window.URL &&
    typeof document !== 'undefined' &&
    'createElement' in document
  )
}
