import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession, setSessionCookie, validateEmail } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, rememberMe } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'Email and password are required',
          },
        },
        { status: 400 }
      )
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_EMAIL',
            message: 'Invalid email format',
          },
        },
        { status: 400 }
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 400 }
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 400 }
      )
    }

    // Create session with rememberMe logic
    const persistent = Boolean(rememberMe)
    const sessionId = await createSession(user.id, persistent)

    // Set session cookie with appropriate expiration
    await setSessionCookie(sessionId, persistent)

    // Return user and session data (excluding password hash)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    // Calculate expiresAt based on persistent setting
    const expiresAt = persistent 
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours for non-persistent

    return NextResponse.json({
      user: userResponse,
      session: {
        id: sessionId,
        userId: user.id,
        expiresAt,
        persistent,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred during login',
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred',
        },
      },
      { status: 500 }
    )
  }
} 