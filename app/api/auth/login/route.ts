import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { FileMakerClient } from '@/lib/filemaker-client'
import { MockAuthService } from '@/lib/mock/mock-auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Check if we're in demo mode
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    
    let authResult
    if (isDemoMode) {
      // Use mock authentication in demo mode
      authResult = MockAuthService.authenticate(username, password)
    } else {
      // Initialize FileMaker client (singleton pattern would be better in production)
      const client = new FileMakerClient()
      
      // Verify user credentials using API account
      authResult = await client.authenticate(username, password)
    }
    
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error || 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Set session cookie with timestamp
    const sessionData = {
      token: authResult.token,
      createdAt: Date.now()
    }
    cookies().set('fm-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    // Store user info in cookie
    if (authResult.user) {
      cookies().set('fm-user', JSON.stringify({
        username: authResult.user.username,
        displayName: authResult.user.displayName,
        isManager: authResult.user.isManager,
        isDesigner: authResult.user.isDesigner,
        department: authResult.user.department,
        departmentManager: authResult.user.departmentManager,
      }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      })
    }

    return NextResponse.json({
      success: true,
      user: authResult.user,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}