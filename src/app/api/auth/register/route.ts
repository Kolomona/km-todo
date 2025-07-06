import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, validateEmail, validatePassword, createSession, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = body

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'Email, password, and name are required',
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

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: {
            code: 'WEAK_PASSWORD',
            message: 'Password does not meet requirements',
            details: passwordValidation.errors,
          },
        },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'User with this email already exists',
          },
        },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Create session
    const sessionId = await createSession(user.id)

    // Set session cookie
    await setSessionCookie(sessionId)

    // Return user and session data
    return NextResponse.json({
      user,
      session: {
        id: sessionId,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An error occurred during registration',
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