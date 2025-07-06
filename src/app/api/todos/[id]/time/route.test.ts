import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from './route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    todo: {
      findUnique: vi.fn(),
    },
    todoTime: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

const mockPrisma = vi.mocked(prisma)
const mockGetCurrentUser = vi.mocked(getCurrentUser)

describe('/api/todos/[id]/time', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockTodo = {
    id: 'todo-1',
    title: 'Test Todo',
    description: 'Test description',
    dueDate: new Date('2024-12-25'),
    priority: 'high' as const,
    status: 'pending' as const,
    estimatedTime: 120,
    createdBy: 'user-1',
    assignedTo: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    projects: [
      {
        id: 'tp-1',
        todoId: 'todo-1',
        projectId: 'project-1',
        project: {
          id: 'project-1',
          name: 'Test Project',
          description: 'Test project description',
          members: [
            {
              id: 'pm-1',
              userId: 'user-1',
              role: 'owner',
            },
          ],
        },
      },
    ],
  }

  const mockTimeLog = {
    id: 'tl-1',
    todoId: 'todo-1',
    userId: 'user-1',
    timeSpent: 60,
    date: new Date('2024-12-20'),
    notes: 'Test time log',
    createdAt: new Date(),
    user: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockResolvedValue(mockUser)
  })

  describe('GET /api/todos/[id]/time', () => {
    it('should return time logs for authenticated user with access', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1/time')
      
      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo)
      mockPrisma.todoTime.findMany.mockResolvedValue([mockTimeLog])

      const response = await GET(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.timeLogs).toHaveLength(1)
      expect(data.totalTime).toBe(60)
      expect(data.timeLogs[0].id).toBe('tl-1')
      expect(data.timeLogs[0].timeSpent).toBe(60)
    })

    it('should return 401 for unauthenticated user', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1/time')
      
      mockGetCurrentUser.mockResolvedValue(null)

      const response = await GET(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('should return 404 for non-existent todo', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos/non-existent/time')
      
      mockPrisma.todo.findUnique.mockResolvedValue(null)

      const response = await GET(mockRequest, { params: { id: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('TODO_NOT_FOUND')
    })

    it('should return 403 for todo without access', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1/time')
      
      const todoWithoutAccess = {
        ...mockTodo,
        createdBy: 'other-user',
        assignedTo: null,
        projects: [],
      }
      
      mockPrisma.todo.findUnique.mockResolvedValue(todoWithoutAccess)

      const response = await GET(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('ACCESS_DENIED')
    })

    it('should calculate total time correctly', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1/time')
      
      const multipleTimeLogs = [
        { ...mockTimeLog, id: 'tl-1', timeSpent: 30 },
        { ...mockTimeLog, id: 'tl-2', timeSpent: 45 },
        { ...mockTimeLog, id: 'tl-3', timeSpent: 15 },
      ]
      
      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo)
      mockPrisma.todoTime.findMany.mockResolvedValue(multipleTimeLogs)

      const response = await GET(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.totalTime).toBe(90) // 30 + 45 + 15
    })
  })

  describe('POST /api/todos/[id]/time', () => {
    it('should create a new time log for authenticated user with access', async () => {
      const timeLogData = {
        timeSpent: 120,
        date: '2024-12-20T10:00:00.000Z',
        notes: 'Worked on feature implementation',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1/time', {
        method: 'POST',
        body: JSON.stringify(timeLogData),
      })

      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo)
      mockPrisma.todoTime.create.mockResolvedValue(mockTimeLog)

      const response = await POST(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.timeLog.id).toBe('tl-1')
      expect(data.timeLog.timeSpent).toBe(60)
      expect(data.timeLog.notes).toBe('Test time log')
      expect(mockPrisma.todoTime.create).toHaveBeenCalledWith({
        data: {
          todoId: 'todo-1',
          userId: 'user-1',
          timeSpent: 120,
          date: expect.any(Date),
          notes: 'Worked on feature implementation',
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
    })

    it('should return 401 for unauthenticated user', async () => {
      const timeLogData = {
        timeSpent: 120,
        date: '2024-12-20T10:00:00.000Z',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1/time', {
        method: 'POST',
        body: JSON.stringify(timeLogData),
      })

      mockGetCurrentUser.mockResolvedValue(null)

      const response = await POST(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('should return 400 for missing required fields', async () => {
      const timeLogData = {
        notes: 'Missing timeSpent and date',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1/time', {
        method: 'POST',
        body: JSON.stringify(timeLogData),
      })

      const response = await POST(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('MISSING_REQUIRED_FIELDS')
    })

    it('should return 400 for invalid timeSpent', async () => {
      const timeLogData = {
        timeSpent: -10,
        date: '2024-12-20T10:00:00.000Z',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1/time', {
        method: 'POST',
        body: JSON.stringify(timeLogData),
      })

      const response = await POST(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('INVALID_TIME_SPENT')
    })

    it('should return 400 for invalid date format', async () => {
      const timeLogData = {
        timeSpent: 120,
        date: 'invalid-date',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1/time', {
        method: 'POST',
        body: JSON.stringify(timeLogData),
      })

      const response = await POST(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('INVALID_DATE')
    })

    it('should return 404 for non-existent todo', async () => {
      const timeLogData = {
        timeSpent: 120,
        date: '2024-12-20T10:00:00.000Z',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos/non-existent/time', {
        method: 'POST',
        body: JSON.stringify(timeLogData),
      })

      mockPrisma.todo.findUnique.mockResolvedValue(null)

      const response = await POST(mockRequest, { params: { id: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('TODO_NOT_FOUND')
    })

    it('should return 403 for todo without access', async () => {
      const timeLogData = {
        timeSpent: 120,
        date: '2024-12-20T10:00:00.000Z',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1/time', {
        method: 'POST',
        body: JSON.stringify(timeLogData),
      })

      const todoWithoutAccess = {
        ...mockTodo,
        createdBy: 'other-user',
        assignedTo: null,
        projects: [],
      }

      mockPrisma.todo.findUnique.mockResolvedValue(todoWithoutAccess)

      const response = await POST(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('ACCESS_DENIED')
    })

    it('should create time log without notes', async () => {
      const timeLogData = {
        timeSpent: 90,
        date: '2024-12-20T10:00:00.000Z',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1/time', {
        method: 'POST',
        body: JSON.stringify(timeLogData),
      })

      const timeLogWithoutNotes = { ...mockTimeLog, notes: null }
      
      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo)
      mockPrisma.todoTime.create.mockResolvedValue(timeLogWithoutNotes)

      const response = await POST(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.timeLog.notes).toBeNull()
    })
  })
}) 