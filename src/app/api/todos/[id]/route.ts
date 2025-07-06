import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/todos/[id] - Get a specific todo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    }

    const { id } = await params
    const todo = await prisma.todo.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        timeLogs: {
          select: {
            id: true,
            todoId: true,
            userId: true,
            timeSpent: true,
            date: true,
            notes: true,
            createdAt: true,
          },
        },
        recurringPattern: {
          select: {
            id: true,
            todoId: true,
            patternType: true,
            patternData: true,
            nextDueDate: true,
            isActive: true,
          },
        },
      },
    })

    if (!todo) {
      return NextResponse.json(
        {
          error: {
            code: 'TODO_NOT_FOUND',
            message: 'Todo not found',
          },
        },
        { status: 404 }
      )
    }

    // Check if user has access to this todo
    const hasAccess = 
      todo.createdBy === user.id ||
      todo.assignedTo === user.id ||
      todo.projects.some((tp) => 
        tp.project.members?.some((member: any) => member.userId === user.id)
      )

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: {
            code: 'ACCESS_DENIED',
            message: 'You do not have access to this todo',
          },
        },
        { status: 403 }
      )
    }

    // Transform to match API contract
    const transformedTodo = {
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
      timeLogs: todo.timeLogs.map((tl) => ({
        id: tl.id,
        todoId: tl.todoId,
        userId: tl.userId,
        timeSpent: tl.timeSpent,
        date: tl.date.toISOString(),
        notes: tl.notes,
        createdAt: tl.createdAt.toISOString(),
      })),
      recurringPattern: todo.recurringPattern ? {
        id: todo.recurringPattern.id,
        todoId: todo.recurringPattern.todoId,
        patternType: todo.recurringPattern.patternType,
        patternData: todo.recurringPattern.patternData,
        nextDueDate: todo.recurringPattern.nextDueDate.toISOString(),
        isActive: todo.recurringPattern.isActive,
      } : undefined,
    }

    return NextResponse.json({
      todo: transformedTodo,
    })
  } catch (error) {
    console.error('Error fetching todo:', error)
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while fetching the todo',
        },
      },
      { status: 500 }
    )
  }
}

// PUT /api/todos/[id] - Update a todo
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const {
      title,
      description,
      dueDate,
      priority,
      status,
      estimatedTime,
      assignedTo,
      projectIds,
    } = body

    // Find the todo and check access
    const existingTodo = await prisma.todo.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            project: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    })

    if (!existingTodo) {
      return NextResponse.json(
        {
          error: {
            code: 'TODO_NOT_FOUND',
            message: 'Todo not found',
          },
        },
        { status: 404 }
      )
    }

    // Check if user has permission to edit this todo
    const hasEditPermission = 
      existingTodo.createdBy === user.id ||
      existingTodo.assignedTo === user.id ||
      existingTodo.projects.some((tp) => 
        tp.project.members.some((member) => 
          member.userId === user.id && 
          ['owner', 'admin', 'editor'].includes(member.role)
        )
      )

    if (!hasEditPermission) {
      return NextResponse.json(
        {
          error: {
            code: 'ACCESS_DENIED',
            message: 'You do not have permission to edit this todo',
          },
        },
        { status: 403 }
      )
    }

    // Validate priority if provided
    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent']
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_PRIORITY',
              message: 'Priority must be one of: low, medium, high, urgent',
            },
          },
          { status: 400 }
        )
      }
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: {
              code: 'INVALID_STATUS',
              message: 'Status must be one of: pending, in_progress, completed, cancelled',
            },
          },
          { status: 400 }
        )
      }
    }

    // Validate project access if projectIds are provided
    if (projectIds && Array.isArray(projectIds)) {
      const projectAccess = await prisma.projectMember.findMany({
        where: {
          projectId: { in: projectIds },
          userId: user.id,
        },
      })

      if (projectAccess.length !== projectIds.length) {
        return NextResponse.json(
          {
            error: {
              code: 'ACCESS_DENIED',
              message: 'You do not have access to one or more specified projects',
            },
          },
          { status: 403 }
        )
      }
    }

    // Update todo with transaction
    const updatedTodo = await prisma.$transaction(async (tx) => {
      // Update the todo
      const todo = await tx.todo.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
          ...(priority && { priority }),
          ...(status && { status }),
          ...(estimatedTime !== undefined && { estimatedTime }),
          ...(assignedTo !== undefined && { assignedTo }),
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      })

      // Update project relationships if provided
      if (projectIds && Array.isArray(projectIds)) {
        // Remove existing relationships
        await tx.todoProject.deleteMany({
          where: { todoId: id },
        })

        // Create new relationships
        await tx.todoProject.createMany({
          data: projectIds.map((projectId: string) => ({
            todoId: id,
            projectId,
          })),
        })
      }

      return todo
    })

    // Fetch the complete updated todo
    const completeTodo = await prisma.todo.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        projects: {
          include: {
            project: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        timeLogs: {
          select: {
            id: true,
            todoId: true,
            userId: true,
            timeSpent: true,
            date: true,
            notes: true,
            createdAt: true,
          },
        },
        recurringPattern: {
          select: {
            id: true,
            todoId: true,
            patternType: true,
            patternData: true,
            nextDueDate: true,
            isActive: true,
          },
        },
      },
    })

    // Transform to match API contract
    const transformedTodo = {
      id: completeTodo!.id,
      title: completeTodo!.title,
      description: completeTodo!.description,
      dueDate: completeTodo!.dueDate?.toISOString(),
      priority: completeTodo!.priority,
      status: completeTodo!.status,
      estimatedTime: completeTodo!.estimatedTime,
      createdBy: completeTodo!.createdBy,
      assignedTo: completeTodo!.assignedTo,
      createdAt: completeTodo!.createdAt.toISOString(),
      updatedAt: completeTodo!.updatedAt.toISOString(),
      projects: completeTodo!.projects.map((tp) => ({
        id: tp.id,
        todoId: tp.todoId,
        projectId: tp.projectId,
        project: tp.project,
      })),
      timeLogs: completeTodo!.timeLogs.map((tl) => ({
        id: tl.id,
        todoId: tl.todoId,
        userId: tl.userId,
        timeSpent: tl.timeSpent,
        date: tl.date.toISOString(),
        notes: tl.notes,
        createdAt: tl.createdAt.toISOString(),
      })),
      recurringPattern: completeTodo!.recurringPattern ? {
        id: completeTodo!.recurringPattern.id,
        todoId: completeTodo!.recurringPattern.todoId,
        patternType: completeTodo!.recurringPattern.patternType,
        patternData: completeTodo!.recurringPattern.patternData,
        nextDueDate: completeTodo!.recurringPattern.nextDueDate.toISOString(),
        isActive: completeTodo!.recurringPattern.isActive,
      } : undefined,
    }

    return NextResponse.json({
      todo: transformedTodo,
    })
  } catch (error) {
    console.error('Error updating todo:', error)
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while updating the todo',
        },
      },
      { status: 500 }
    )
  }
}

// DELETE /api/todos/[id] - Delete a todo
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        {
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required',
          },
        },
        { status: 401 }
      )
    }

    const { id } = await params
    // Find the todo and check access
    const existingTodo = await prisma.todo.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            project: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    })

    if (!existingTodo) {
      return NextResponse.json(
        {
          error: {
            code: 'TODO_NOT_FOUND',
            message: 'Todo not found',
          },
        },
        { status: 404 }
      )
    }

    // Check if user has permission to delete this todo
    const hasDeletePermission = 
      existingTodo.createdBy === user.id ||
      existingTodo.projects.some((tp) => 
        tp.project.members.some((member) => 
          member.userId === user.id && 
          ['owner', 'admin'].includes(member.role)
        )
      )

    if (!hasDeletePermission) {
      return NextResponse.json(
        {
          error: {
            code: 'ACCESS_DENIED',
            message: 'You do not have permission to delete this todo',
          },
        },
        { status: 403 }
      )
    }

    // Delete the todo (cascading will handle related records)
    await prisma.todo.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error('Error deleting todo:', error)
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while deleting the todo',
        },
      },
      { status: 500 }
    )
  }
} 