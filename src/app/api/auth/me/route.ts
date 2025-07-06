import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'NOT_AUTHENTICATED',
            message: 'User not authenticated',
          },
        },
        { status: 401 }
      )
    }

    // Return user data (excluding password hash)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    return NextResponse.json({
      user: userResponse,
    })
  } catch (error) {
    console.error('Get current user error:', error)
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while fetching user data',
        },
      },
      { status: 500 }
    )
  }
} 