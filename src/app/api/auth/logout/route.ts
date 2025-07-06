import { NextResponse } from 'next/server'
import { getSessionCookie, deleteSession, clearSessionCookie } from '@/lib/auth'

export async function POST() {
  try {
    const sessionId = await getSessionCookie()

    if (sessionId) {
      // Delete session from database
      await deleteSession(sessionId)
    }

    // Clear session cookie
    await clearSessionCookie()

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Logout error:', error)
    
    // Even if there's an error, try to clear the cookie
    try {
      await clearSessionCookie()
    } catch (cookieError) {
      console.error('Error clearing cookie:', cookieError)
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred during logout',
        },
      },
      { status: 500 }
    )
  }
} 