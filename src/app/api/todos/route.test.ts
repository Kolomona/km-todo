import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, POST } from './route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    todo: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    projectMember: {
      findMany: vi.fn(),
    },
    todoProject: {
      createMany: vi.fn(),
    },
    recurringPattern: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

const mockPrisma = vi.mocked(prisma)
const mockGetCurrentUser = vi.mocked(getCurrentUser)

describe('/api/todos', () => {
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
    creator: {
      id: 'user-1',
      name: 'Test User',
      email: 'test@example.com',
    },
    assignee: null,
    projects: [
      {
        id: 'tp-1',
        todoId: 'todo-1',
        projectId: 'project-1',
        project: {
          id: 'project-1',
          name: 'Test Project',
          description: 'Test project description',
        },
      },
    ],
    timeLogs: [
      {
        id: 'tl-1',
        todoId: 'todo-1',
        userId: 'user-1',
        timeSpent: 60,
        date: new Date(),
        notes: 'Test time log',
        createdAt: new Date(),
      },
    ],
    recurringPattern: null,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockResolvedValue(mockUser)
  })

  describe('GET /api/todos', () => {
    it('should return todos for authenticated user', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos')
      
      mockPrisma.todo.findMany.mockResolvedValue([mockTodo])
      mockPrisma.todo.count.mockResolvedValue(1)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.todos).toHaveLength(1)
      expect(data.totalCount).toBe(1)
      expect(data.page).toBe(1)
      expect(data.totalPages).toBe(1)
      expect(data.todos[0].id).toBe('todo-1')
      expect(data.todos[0].title).toBe('Test Todo')
    })

    it('should return 401 for unauthenticated user', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos')
      
      mockGetCurrentUser.mockResolvedValue(null)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('should filter todos by project', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos?projectId=project-1')
      
      mockPrisma.todo.findMany.mockResolvedValue([mockTodo])
      mockPrisma.todo.count.mockResolvedValue(1)

      const response = await GET(mockRequest)

      expect(response.status).toBe(200)
      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            projects: {
              some: {
                projectId: 'project-1',
              },
            },
          }),
        })
      )
    })

    it('should filter todos by status', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos?status=pending')
      
      mockPrisma.todo.findMany.mockResolvedValue([mockTodo])
      mockPrisma.todo.count.mockResolvedValue(1)

      const response = await GET(mockRequest)

      expect(response.status).toBe(200)
      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'pending',
          }),
        })
      )
    })

    it('should handle pagination', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos?page=2&limit=10')
      
      mockPrisma.todo.findMany.mockResolvedValue([])
      mockPrisma.todo.count.mockResolvedValue(25)

      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.page).toBe(2)
      expect(data.totalPages).toBe(3)
      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      )
    })
  })

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const todoData = {
        title: 'New Todo',
        description: 'New todo description',
        priority: 'medium',
        projectIds: ['project-1'],
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(todoData),
      })

      mockPrisma.projectMember.findMany.mockResolvedValue([
        { id: 'pm-1', projectId: 'project-1', userId: 'user-1', role: 'owner' },
      ])

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          todo: {
            create: vi.fn().mockResolvedValue(mockTodo),
          },
          todoProject: {
            createMany: vi.fn(),
          },
          recurringPattern: {
            create: vi.fn(),
          },
        }
        return await callback(mockTx)
      })

      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo)

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.todo.title).toBe('Test Todo')
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should return 400 for missing required fields', async () => {
      const todoData = {
        description: 'Missing title and priority',
        projectIds: ['project-1'],
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(todoData),
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('MISSING_REQUIRED_FIELDS')
    })

    it('should return 400 for invalid priority', async () => {
      const todoData = {
        title: 'Test Todo',
        priority: 'invalid',
        projectIds: ['project-1'],
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(todoData),
      })

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('INVALID_PRIORITY')
    })

    it('should return 403 for inaccessible projects', async () => {
      const todoData = {
        title: 'Test Todo',
        priority: 'medium',
        projectIds: ['project-1', 'project-2'],
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(todoData),
      })

      mockPrisma.projectMember.findMany.mockResolvedValue([
        { id: 'pm-1', projectId: 'project-1', userId: 'user-1', role: 'owner' },
      ])

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('ACCESS_DENIED')
    })

    it('should create todo with recurring pattern', async () => {
      const todoData = {
        title: 'Recurring Todo',
        priority: 'high',
        projectIds: ['project-1'],
        recurringPattern: {
          patternType: 'daily',
          patternData: { interval: 1 },
          nextDueDate: '2024-12-25T00:00:00.000Z',
        },
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos', {
        method: 'POST',
        body: JSON.stringify(todoData),
      })

      mockPrisma.projectMember.findMany.mockResolvedValue([
        { id: 'pm-1', projectId: 'project-1', userId: 'user-1', role: 'owner' },
      ])

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          todo: {
            create: vi.fn().mockResolvedValue(mockTodo),
          },
          todoProject: {
            createMany: vi.fn(),
          },
          recurringPattern: {
            create: vi.fn(),
          },
        }
        return await callback(mockTx)
      })

      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo)

      const response = await POST(mockRequest)

      expect(response.status).toBe(200)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })
  })
}) 