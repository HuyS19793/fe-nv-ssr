// actions/auth.ts
'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DEFAULT_PAGE } from '@/constants/router'
import { validateCredentials, createCookieOptions } from '@/utils/auth-utils'

/**
 * Result type for auth operations
 */
export interface AuthResult {
  success: boolean
  error?: string
  redirectUrl?: string
  user?: any
}

/**
 * Login with username and password
 */
export async function loginWithCredentials(
  formData: FormData
): Promise<AuthResult> {
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const callbackUrl =
    (formData.get('callbackUrl') as string) || `/${DEFAULT_PAGE}`

  if (!username || !password) {
    return {
      success: false,
      error: 'Username and password are required',
    }
  }

  try {
    const result = await validateCredentials({ username, password })

    if (!result.success || !result.userData) {
      // If the direct API call didn't work, redirect to Casso SSO in production
      const isDevelopment = process.env.NODE_ENV === 'development'
      if (!isDevelopment) {
        const cassoUrl = process.env.NEXT_PUBLIC_CASSO_URL
        if (cassoUrl) {
          return {
            success: false,
            redirectUrl: cassoUrl,
            error: 'Please use Casso SSO to login',
          }
        }
      }

      return {
        success: false,
        error: result.error || 'Invalid credentials',
      }
    }

    // Set cookies
    const cookieStore = await cookies()
    const isDevelopment = process.env.NODE_ENV === 'development'
    const cookieOptions = createCookieOptions(isDevelopment)

    cookieStore.set({
      name: 'logged-in',
      value: 'true',
      ...cookieOptions,
    })

    cookieStore.set({
      name: 'user-session',
      value: JSON.stringify(result.userData),
      ...cookieOptions,
    })

    return {
      success: true,
      redirectUrl: callbackUrl,
      user: result.userData,
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'An error occurred during authentication',
    }
  }
}

/**
 * Login with Casso
 */
export async function loginWithCasso(
  employeeId: string,
  cassoToken: string
): Promise<AuthResult> {
  if (!employeeId || !cassoToken) {
    return {
      success: false,
      error: 'Employee ID and Casso token are required',
    }
  }

  try {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const apiUrl = process.env.NEXT_PRIVATE_API_LOGIN_URL

    if (!apiUrl) {
      return {
        success: false,
        error: 'Casso API URL is not configured',
      }
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        'employee-id': employeeId,
        'casso-token': cassoToken,
      }),
      cache: 'no-store',
    })

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: 'Invalid credentials' }))
      return {
        success: false,
        error: errorData.message || 'Authentication failed',
      }
    }

    const data = await response.json()

    if (!data.access) {
      return {
        success: false,
        error: 'Invalid response from authentication server',
      }
    }

    const userData = {
      id: data.id || employeeId,
      name: data.username || 'Casso User',
      username: data.username || employeeId,
      role: data.role || 'user',
      access: data.access,
    }

    // Set cookies
    const cookieStore = await cookies()
    const cookieOptions = createCookieOptions(isDevelopment)

    cookieStore.set({
      name: 'logged-in',
      value: 'true',
      ...cookieOptions,
    })

    cookieStore.set({
      name: 'user-session',
      value: JSON.stringify(userData),
      ...cookieOptions,
    })

    return {
      success: true,
      redirectUrl: `/${DEFAULT_PAGE}`,
      user: userData,
    }
  } catch (error) {
    console.error('Casso login error:', error)
    return {
      success: false,
      error: 'An error occurred during Casso authentication',
    }
  }
}

/**
 * Logout the current user
 */
export async function logout() {
  const cookieStore = await cookies()

  cookieStore.set({
    name: 'logged-in',
    value: '',
    expires: new Date(0),
    path: '/',
  })

  cookieStore.set({
    name: 'user-session',
    value: '',
    expires: new Date(0),
    path: '/',
  })

  redirect('/login')
}
