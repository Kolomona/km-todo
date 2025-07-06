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

// Helper function to check project ownership
async function checkProjectOwnership(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: userId,
    },
  })

  return project
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
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

    const { id: projectId, userId: targetUserId } = await params
    const body = await request.json()
    const { role, permissions } = body

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

    // Validate user ID
    if (!targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_USER_ID',
            message: 'Invalid user ID',
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

    // Check if target user is project owner (owners cannot be modified by admins)
    const isOwner = await checkProjectOwnership(projectId, targetUserId)
    if (isOwner && user.id !== targetUserId) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_PERMISSION',
            message: 'Cannot modify project owner',
          },
        },
        { status: 403 }
      )
    }

    // Validate role if provided
    if (role !== undefined) {
      if (!['admin', 'editor', 'viewer'].includes(role)) {
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

    // Check if member exists
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: targetUserId,
      },
    })

    if (!existingMember) {
      return NextResponse.json(
        {
          error: {
            code: 'MEMBER_NOT_FOUND',
            message: 'Member not found',
          },
        },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: { role?: 'admin' | 'editor' | 'viewer'; permissions?: string[] } = {}
    if (role !== undefined) {
      updateData.role = role as 'admin' | 'editor' | 'viewer'
    }
    if (permissions !== undefined) {
      updateData.permissions = permissions
    }

    // Update member
    const member = await prisma.projectMember.update({
      where: {
        id: existingMember.id,
      },
      data: updateData,
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
    console.error('Update project member error:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        {
          error: {
            code: 'MEMBER_NOT_FOUND',
            message: 'Member not found',
          },
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while updating the member',
        },
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
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

    const { id: projectId, userId: targetUserId } = await params

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

    // Validate user ID
    if (!targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_USER_ID',
            message: 'Invalid user ID',
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

    // Check if target user is project owner (owners cannot be removed by admins)
    const isOwner = await checkProjectOwnership(projectId, targetUserId)
    if (isOwner && user.id !== targetUserId) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_PERMISSION',
            message: 'Cannot remove project owner',
          },
        },
        { status: 403 }
      )
    }

    // Check if member exists
    const existingMember = await prisma.projectMember.findFirst({
      where: {
        projectId: projectId,
        userId: targetUserId,
      },
    })

    if (!existingMember) {
      return NextResponse.json(
        {
          error: {
            code: 'MEMBER_NOT_FOUND',
            message: 'Member not found',
          },
        },
        { status: 404 }
      )
    }

    // Remove member
    await prisma.projectMember.delete({
      where: {
        id: existingMember.id,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Remove project member error:', error)
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        {
          error: {
            code: 'MEMBER_NOT_FOUND',
            message: 'Member not found',
          },
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while removing the member',
        },
      },
      { status: 500 }
    )
  }
} 