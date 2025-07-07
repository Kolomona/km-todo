import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Password validation function
function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' }
  }
  
  // Check for complexity: at least one uppercase, one lowercase, one number, one special character
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character' 
    }
  }
  
  return { isValid: true }
}

// Email validation function
function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }
  return { isValid: true }
}

export async function POST(request: NextRequest) {
  try {
    // Check if setup is already complete
    const userCount = await prisma.user.count()
    const setupConfig = await prisma.systemConfig.findUnique({
      where: { key: 'setup_complete' }
    })

    if (userCount > 0 || (setupConfig && setupConfig.value === 'true')) {
      return NextResponse.json(
        { 
          error: {
            code: 'SETUP_ALREADY_COMPLETE',
            message: 'Setup is already complete. Cannot initialize again.',
            details: 'The application has already been set up with an admin user.'
          }
        },
        { status: 409 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { email, password, name } = body

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { 
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'Email, password, and name are required',
            details: 'All fields must be provided for admin user creation.'
          }
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { 
          error: {
            code: 'INVALID_EMAIL',
            message: emailValidation.error!,
            details: 'Please provide a valid email address.'
          }
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
            message: passwordValidation.error!,
            details: 'Please choose a stronger password.'
          }
        },
        { status: 400 }
      )
    }

    // Check if email already exists (shouldn't happen in setup, but safety check)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { 
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Email already exists',
            details: 'A user with this email address already exists.'
          }
        },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create admin user and mark setup as complete in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the admin user
      const user = await tx.user.create({
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
        }
      })

      // Mark setup as complete
      await tx.systemConfig.create({
        data: {
          key: 'setup_complete',
          value: 'true',
        }
      })

      return user
    })

    return NextResponse.json({
      user: result,
      message: 'Setup completed successfully. Admin user created and setup marked as complete.'
    })

  } catch (error) {
    console.error('Error during setup initialization:', error)
    return NextResponse.json(
      { 
        error: {
          code: 'SETUP_INITIALIZATION_ERROR',
          message: 'Failed to initialize setup',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
} 