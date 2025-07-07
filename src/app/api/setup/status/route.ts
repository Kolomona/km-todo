import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Check if any users exist
    const userCount = await prisma.user.count()
    
    // Check if setup is already marked as complete
    const setupConfig = await prisma.systemConfig.findUnique({
      where: { key: 'setup_complete' }
    })

    const needsSetup = userCount === 0 || !setupConfig || setupConfig.value !== 'true'
    
    return NextResponse.json({
      needsSetup,
      message: needsSetup 
        ? 'Setup is required. No users exist or setup is not marked as complete.'
        : 'Setup is already complete.'
    })
  } catch (error) {
    console.error('Error checking setup status:', error)
    return NextResponse.json(
      { 
        error: {
          code: 'SETUP_STATUS_ERROR',
          message: 'Failed to check setup status',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    )
  }
} 