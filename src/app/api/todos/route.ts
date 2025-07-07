import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/todos - List todos with filtering and pagination
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    
    // Extract query parameters
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const assignedTo = searchParams.get('assignedTo')
    const dueDateFrom = searchParams.get('dueDateFrom')
    const dueDateTo = searchParams.get('dueDateTo')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause for filtering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      OR: [
        { createdBy: user.id },
        { assignedTo: user.id },
        {
          projects: {
            some: {
              project: {
                members: {
                  some: {
                    userId: user.id,
                  },
                },
              },
            },
          },
        },
      ],
    }

    // Add filters
    if (projectId) {
      where.projects = {
        some: {
          projectId: projectId,
        },
      }
    }

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    if (assignedTo) {
      where.assignedTo = assignedTo
    }

    if (dueDateFrom || dueDateTo) {
      where.dueDate = {}
      if (dueDateFrom) {
        where.dueDate.gte = new Date(dueDateFrom)
      }
      if (dueDateTo) {
        where.dueDate.lte = new Date(dueDateTo)
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get todos with related data
    const [todos, totalCount] = await Promise.all([
      prisma.todo.findMany({
        where,
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
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.todo.count({ where }),
    ])

    // Transform todos to match API contract
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
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      todos: transformedTodos,
      totalCount,
      page,
      totalPages,
    })
  } catch (error) {
    console.error('Error fetching todos:', error)
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while fetching todos',
        },
      },
      { status: 500 }
    )
  }
}

// POST /api/todos - Create a new todo
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      title,
      description,
      dueDate,
      priority,
      estimatedTime,
      assignedTo,
      projectIds,
      recurringPattern,
    } = body

    // Validate required fields
    if (!title || !priority || !projectIds || !Array.isArray(projectIds) || projectIds.length === 0) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'Title, priority, and at least one project are required',
          },
        },
        { status: 400 }
      )
    }

    // Validate priority
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

    // Validate that user has access to all projects
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

    // Create todo with transaction
    const todo = await prisma.$transaction(async (tx) => {
      // Create the todo
      const newTodo = await tx.todo.create({
        data: {
          title,
          description,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority,
          status: 'pending',
          estimatedTime,
          createdBy: user.id,
          assignedTo,
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

      // Create todo-project relationships
      await tx.todoProject.createMany({
        data: projectIds.map((projectId: string) => ({
          todoId: newTodo.id,
          projectId,
        })),
      })

      // Create recurring pattern if provided
      if (recurringPattern) {
        await tx.recurringPattern.create({
          data: {
            todoId: newTodo.id,
            patternType: recurringPattern.patternType,
            patternData: recurringPattern.patternData,
            nextDueDate: new Date(recurringPattern.nextDueDate || dueDate || Date.now()),
            isActive: true,
          },
        })
      }

      return newTodo
    })

    // Fetch the complete todo with all relationships
    const completeTodo = await prisma.todo.findUnique({
      where: { id: todo.id },
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
    console.error('Error creating todo:', error)
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while creating the todo',
        },
      },
      { status: 500 }
    )
  }
} 