import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Helper function to check project access
async function checkProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      ],
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

// Helper function to check project edit permission
async function checkProjectEditPermission(projectId: string, userId: string) {
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: projectId } = await params

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

    // Check project access
    const project = await checkProjectAccess(projectId, user.id)
    if (!project) {
      return NextResponse.json(
        {
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found or access denied',
          },
        },
        { status: 404 }
      )
    }

    // Get project todos
    const todos = await prisma.todo.findMany({
      where: {
        projects: {
          some: {
            projectId: projectId,
          },
        },
      },
      include: {
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        timeLogs: {
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
        recurringPattern: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get project messages
    const messages = await prisma.projectMessage.findMany({
      where: {
        projectId: projectId,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Transform project to match API contract format
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

    // Transform todos to match API contract format
    const transformedTodos = todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate?.toISOString(),
      priority: todo.priority,
      status: todo.status,
      estimatedTime: todo.estimatedTime,
      createdBy: todo.createdBy,
      assignedTo: todo.assignedTo,
      createdAt: todo.createdAt.toISOString(),
      updatedAt: todo.updatedAt.toISOString(),
      projects: todo.projects.map((tp) => ({
        id: tp.id,
        todoId: tp.todoId,
        projectId: tp.projectId,
        project: tp.project,
      })),
      timeLogs: todo.timeLogs.map((timeLog) => ({
        id: timeLog.id,
        todoId: timeLog.todoId,
        userId: timeLog.userId,
        timeSpent: timeLog.timeSpent,
        date: timeLog.date.toISOString(),
        notes: timeLog.notes,
        createdAt: timeLog.createdAt.toISOString(),
        user: timeLog.user,
      })),
      recurringPattern: todo.recurringPattern ? {
        id: todo.recurringPattern.id,
        todoId: todo.recurringPattern.todoId,
        patternType: todo.recurringPattern.patternType,
        patternData: todo.recurringPattern.patternData,
        nextDueDate: todo.recurringPattern.nextDueDate.toISOString(),
        isActive: todo.recurringPattern.isActive,
      } : undefined,
    }))

    // Transform messages to match API contract format
    const transformedMessages = messages.map((message) => ({
      id: message.id,
      projectId: message.projectId,
      userId: message.userId,
      message: message.message,
      todoReferences: message.todoReferences,
      createdAt: message.createdAt.toISOString(),
      user: message.user,
    }))

    return NextResponse.json({
      project: transformedProject,
      todos: transformedTodos,
      messages: transformedMessages,
    })
  } catch (error) {
    console.error('Get project error:', error)
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while fetching the project',
        },
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: projectId } = await params
    const body = await request.json()
    const { name, description } = body

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

    // Check project edit permission
    const project = await checkProjectEditPermission(projectId, user.id)
    if (!project) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_PERMISSION',
            message: 'No permission to edit this project',
          },
        },
        { status: 403 }
      )
    }

    // Validate input fields
    const updateData: { name?: string; description?: string | null } = {}

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Project name cannot be empty',
            },
          },
          { status: 400 }
        )
      }
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
      updateData.name = name.trim()
    }

    if (description !== undefined) {
      if (description !== null && (typeof description !== 'string' || description.length > 1000)) {
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
      updateData.description = description?.trim() || null
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: updateData,
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
      id: updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.description,
      ownerId: updatedProject.ownerId,
      createdAt: updatedProject.createdAt.toISOString(),
      updatedAt: updatedProject.updatedAt.toISOString(),
      members: updatedProject.members.map((member) => ({
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
    console.error('Update project error:', error)
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        {
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while updating the project',
        },
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

    const { id: projectId } = await params

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

    // Check project ownership (only owners can delete)
    const project = await checkProjectOwnership(projectId, user.id)
    if (!project) {
      return NextResponse.json(
        {
          error: {
            code: 'NO_PERMISSION',
            message: 'No permission to delete this project',
          },
        },
        { status: 403 }
      )
    }

    // Delete project (this will cascade delete related records)
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Delete project error:', error)
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        {
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
          },
        },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while deleting the project',
        },
      },
      { status: 500 }
    )
  }
} 