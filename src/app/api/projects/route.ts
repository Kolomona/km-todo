import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
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

    // TODO: Implement archived functionality when needed
    // const { searchParams } = new URL(request.url)
    // const includeArchived = searchParams.get('includeArchived') === 'true'

    // Get user's projects (owned or member of)
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: user.id },
          {
            members: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
        // Note: archived functionality not implemented in schema yet
        // Will be added when needed
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            todos: true,
            messages: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // Transform to match API contract format
    const transformedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      members: project.members.map((member) => ({
        id: member.id,
        projectId: member.projectId,
        userId: member.userId,
        role: member.role,
        permissions: member.permissions,
        joinedAt: member.joinedAt.toISOString(),
        user: member.user,
      })),
    }))

    return NextResponse.json({
      projects: transformedProjects,
      totalCount: transformedProjects.length,
    })
  } catch (error) {
    console.error('Get projects error:', error)
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while fetching projects',
        },
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, description } = body

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'Project name is required',
          },
        },
        { status: 400 }
      )
    }

    // Validate name length
    if (name.trim().length > 100) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Project name must be 100 characters or less',
          },
        },
        { status: 400 }
      )
    }

    // Validate description length if provided
    if (description && (typeof description !== 'string' || description.length > 1000)) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Project description must be 1000 characters or less',
          },
        },
        { status: 400 }
      )
    }

    // Create project
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        ownerId: user.id,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    // Transform to match API contract format
    const transformedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      members: project.members.map((member) => ({
        id: member.id,
        projectId: member.projectId,
        userId: member.userId,
        role: member.role,
        permissions: member.permissions,
        joinedAt: member.joinedAt.toISOString(),
        user: member.user,
      })),
    }

    return NextResponse.json({
      project: transformedProject,
    })
  } catch (error) {
    console.error('Create project error:', error)
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while creating the project',
        },
      },
      { status: 500 }
    )
  }
} 