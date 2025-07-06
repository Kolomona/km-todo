import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Helper function to check project admin permission
async function checkProjectAdminPermission(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId: userId,
              role: {
                in: ['owner', 'admin'],
              },
            },
          },
        },
      ],
    },
  })

  return project
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get current user
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

    const { id: projectId } = params
    const body = await request.json()
    const { email, role, permissions } = body

    // Validate project ID
    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_PROJECT_ID',
            message: 'Invalid project ID',
          },
        },
        { status: 400 }
      )
    }

    // Check project admin permission
    const project = await checkProjectAdminPermission(projectId, user.id)
    if (!project) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_PERMISSION',
            message: 'No permission to manage project members',
          },
        },
        { status: 403 }
      )
    }

    // Validate required fields
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'Email is required',
          },
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email format',
          },
        },
        { status: 400 }
      )
    }

    // Validate role
    if (!role || !['admin', 'editor', 'viewer'].includes(role)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Role must be admin, editor, or viewer',
          },
        },
        { status: 400 }
      )
    }

    // Validate permissions if provided
    if (permissions !== undefined) {
      if (!Array.isArray(permissions) || !permissions.every(p => typeof p === 'string')) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Permissions must be an array of strings',
            },
          },
          { status: 400 }
        )
      }
    }

    // Find user by email
    const targetUser = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    })

    if (!targetUser) {
      return NextResponse.json(
        {
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found',
          },
        },
        { status: 404 }
      )
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: targetUser.id,
      },
    })

    if (existingMember) {
      return NextResponse.json(
        {
          error: {
            code: 'USER_ALREADY_MEMBER',
            message: 'User is already a member of this project',
          },
        },
        { status: 409 }
      )
    }

    // Add user to project
    const member = await prisma.projectMember.create({
      data: {
        projectId: projectId,
        userId: targetUser.id,
        role: role,
        permissions: permissions || [],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Transform to match API contract format
    const transformedMember = {
      id: member.id,
      projectId: member.projectId,
      userId: member.userId,
      role: member.role,
      permissions: member.permissions,
      joinedAt: member.joinedAt.toISOString(),
      user: member.user,
    }

    return NextResponse.json({
      member: transformedMember,
    })
  } catch (error) {
    console.error('Add project member error:', error)
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while adding the member',
        },
      },
      { status: 500 }
    )
  }
} 