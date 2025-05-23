// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials, createCookieOptions } from '@/utils/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    const result = await validateCredentials({ username, password })

    if (!result.success || !result.userData) {
      return NextResponse.json(
        { success: false, error: result.error || 'Invalid credentials' },
        { status: 401 }
      )
    }

    const response = NextResponse.json({
      success: true,
      user: result.userData,
    })

    const isDevelopment = process.env.NODE_ENV === 'development'
    const cookieOptions = createCookieOptions(isDevelopment)

    response.cookies.set({
      name: 'logged-in',
      value: 'true',
      ...cookieOptions,
    })

    response.cookies.set({
      name: 'user-session',
      value: JSON.stringify(result.userData),
      ...cookieOptions,
    })

    return response
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
