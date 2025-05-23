import { TIME_CONSTANTS } from '@/lib/constants'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  success: boolean
  error?: string
  userData?: {
    id: string
    name: string
    username: string
    role: string
    access: string
  }
}

export function createCookieOptions(isDevelopment: boolean) {
  return {
    httpOnly: true,
    path: '/',
    secure: !isDevelopment,
    maxAge: TIME_CONSTANTS.DAY,
    sameSite: 'lax' as const,
  }
}

export async function validateCredentials(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  const { username, password } = credentials

  if (!username || !password) {
    return {
      success: false,
      error: 'Username and password are required',
    }
  }

  const isDevelopment = process.env.NODE_ENV === 'development'
  const apiUrl = isDevelopment
    ? `${process.env.NEXT_PUBLIC_API_URL}/navi/login/`
    : `${process.env.NEXT_PRIVATE_API_URL}/navi/login/`

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    })

    if (!response.ok) {
      return {
        success: false,
        error: 'Invalid credentials',
      }
    }

    const data = await response.json()

    if (!data.access) {
      return {
        success: false,
        error: 'Invalid response from authentication server',
      }
    }

    return {
      success: true,
      userData: {
        id: data.id || '1',
        name: data.username || username,
        username: data.username || username,
        role: data.role || 'user',
        access: data.access,
      },
    }
  } catch {
    return {
      success: false,
      error: 'An error occurred during authentication',
    }
  }
} 