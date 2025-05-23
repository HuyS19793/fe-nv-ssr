// app/api/auth/user/route.ts
import { NextResponse } from 'next/server'

import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const user = await auth.getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('User API error:', error)
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }
}
