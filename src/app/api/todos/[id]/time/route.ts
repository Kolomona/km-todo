import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/todos/[id]/time - Get time logs for a todo
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
    // Check if todo exists and user has access
    const todo = await prisma.todo.findUnique({
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
        tp.project.members.some((member) => member.userId === user.id)
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

    // Get time logs with user information
    const timeLogs = await prisma.todoTime.findMany({
      where: { todoId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    // Calculate total time spent
    const totalTime = timeLogs.reduce((sum, log) => sum + log.timeSpent, 0)

    // Transform to match API contract
    const transformedTimeLogs = timeLogs.map((log) => ({
      id: log.id,
      todoId: log.todoId,
      userId: log.userId,
      timeSpent: log.timeSpent,
      date: log.date.toISOString(),
      notes: log.notes,
      createdAt: log.createdAt.toISOString(),
      user: log.user,
    }))

    return NextResponse.json({
      timeLogs: transformedTimeLogs,
      totalTime,
    })
  } catch (error) {
    console.error('Error fetching time logs:', error)
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while fetching time logs',
        },
      },
      { status: 500 }
    )
  }
}

// POST /api/todos/[id]/time - Add a time log to a todo
export async function POST(
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
    const { timeSpent, date, notes } = body

    // Validate required fields
    if (!timeSpent || !date) {
      return NextResponse.json(
        {
          error: {
            code: 'MISSING_REQUIRED_FIELDS',
            message: 'Time spent and date are required',
          },
        },
        { status: 400 }
      )
    }

    // Validate timeSpent is a positive number
    if (typeof timeSpent !== 'number' || timeSpent <= 0) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_TIME_SPENT',
            message: 'Time spent must be a positive number',
          },
        },
        { status: 400 }
      )
    }

    // Validate date format
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_DATE',
            message: 'Invalid date format',
          },
        },
        { status: 400 }
      )
    }

    // Check if todo exists and user has access
    const todo = await prisma.todo.findUnique({
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
        tp.project.members.some((member) => member.userId === user.id)
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

    // Create time log
    const timeLog = await prisma.todoTime.create({
      data: {
        todoId: id,
        userId: user.id,
        timeSpent,
        date: dateObj,
        notes,
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

    // Transform to match API contract
    const transformedTimeLog = {
      id: timeLog.id,
      todoId: timeLog.todoId,
      userId: timeLog.userId,
      timeSpent: timeLog.timeSpent,
      date: timeLog.date.toISOString(),
      notes: timeLog.notes,
      createdAt: timeLog.createdAt.toISOString(),
      user: timeLog.user,
    }

    return NextResponse.json({
      timeLog: transformedTimeLog,
    })
  } catch (error) {
    console.error('Error creating time log:', error)
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while creating the time log',
        },
      },
      { status: 500 }
    )
  }
} 