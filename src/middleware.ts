import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function middleware(request: NextRequest) {
  // Only apply to setup endpoints
  if (request.nextUrl.pathname.startsWith('/api/setup')) {
    try {
      // Check if setup is complete
      const setupConfig = await prisma.systemConfig.findUnique({
        where: { key: 'setup_complete' }
      })

      const userCount = await prisma.user.count()
      const isSetupComplete = userCount > 0 && setupConfig && setupConfig.value === 'true'

      // If setup is complete, block access to setup endpoints
      if (isSetupComplete) {
        return NextResponse.json(
          { 
            error: {
              code: 'SETUP_DISABLED',
              message: 'Setup endpoints are disabled after initialization',
              details: 'The application has already been set up. Setup endpoints are no longer accessible.'
            }
          },
          { status: 403 }
        )
      }
    } catch (error) {
      // If there's an error checking setup status, allow the request to proceed
      // This prevents blocking setup when the database is not yet initialized
      console.warn('Error checking setup status in middleware:', error)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/setup/:path*'
} 