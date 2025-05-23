// app/api/auth/casso/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const employeeId = body['employee-id']
    const cassoToken = body['casso-token']

    if (!employeeId || !cassoToken) {
      return NextResponse.json(
        { success: false, error: 'Employee ID and Casso token are required' },
        { status: 400 }
      )
    }

    // Verify credentials and get user data
    let userData = null
    let isValidCredentials = false

    // In development, always accept credentials without calling Casso API
    if (process.env.NODE_ENV === 'development') {
      isValidCredentials = true
      userData = {
        id: employeeId,
        name: 'Casso User',
        username: employeeId,
        role: 'user',
        access: 'dev-token-' + Date.now(), // Generate a unique token for development
      }
    } else {
      // Production validation
      try {
        const apiUrl = process.env.NEXT_PRIVATE_API_LOGIN_URL as string
        const apiResponse = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            'employee-id': employeeId,
            'casso-token': cassoToken,
          }),
        })

        if (apiResponse.ok) {
          const data = await apiResponse.json()
          if (data.access) {
            isValidCredentials = true
            userData = {
              id: data.id || employeeId,
              name: data.username || 'Casso User',
              username: data.username || employeeId,
              role: data.role || 'user',
              access: data.access,
            }
          }
        }
      } catch (error) {
        console.error('Casso API login error:', error)
      }
    }

    if (!isValidCredentials || !userData) {
      return NextResponse.json(
        { success: false, error: 'Invalid Casso credentials' },
        { status: 401 }
      )
    }

    // Create a response with auth cookie
    const response = NextResponse.json({
      success: true,
      user: userData,
    })

    // Set the auth cookie
    response.cookies.set({
      name: 'logged-in',
      value: 'true',
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax',
    })

    // Store user data in session
    response.cookies.set({
      name: 'user-session',
      value: JSON.stringify(userData),
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('Casso login API error:', error)
    return NextResponse.json(
      { success: false, error: 'Casso authentication failed' },
      { status: 500 }
    )
  }
}
