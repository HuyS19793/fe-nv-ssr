/**
 * Utility for debugging API responses
 */

export async function debugApiResponse(
  url: string,
  response: Response,
  context: string = 'API Call'
): Promise<void> {
  console.group(`🔍 ${context} Debug`)
  console.log('URL:', url)
  console.log('Status:', response.status, response.statusText)
  console.log('Headers:', Object.fromEntries(response.headers.entries()))

  try {
    const contentType = response.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const data = await response.clone().json()
      console.log('Response Body:', data)
    } else {
      console.log('Response Body (text):', await response.clone().text())
    }
  } catch (error) {
    console.log('Could not parse response body:', error)
  }

  console.groupEnd()
}

export function debugRequestHeaders(headers: HeadersInit): void {
  console.group('📤 Request Headers')
  if (headers instanceof Headers) {
    console.log(Object.fromEntries(headers.entries()))
  } else {
    console.log(headers)
  }
  console.groupEnd()
}
