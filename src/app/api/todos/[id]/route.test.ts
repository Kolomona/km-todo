import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GET, PUT, DELETE } from './route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    todo: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    projectMember: {
      findMany: vi.fn(),
    },
    todoProject: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

const mockPrisma = vi.mocked(prisma)
const mockGetCurrentUser = vi.mocked(getCurrentUser)

describe('/api/todos/[id]', () => {
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

  describe('GET /api/todos/[id]', () => {
    it('should return todo for authenticated user with access', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1')
      
      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo)

      const response = await GET(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.todo.id).toBe('todo-1')
      expect(data.todo.title).toBe('Test Todo')
    })

    it('should return 401 for unauthenticated user', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1')
      
      mockGetCurrentUser.mockResolvedValue(null)

      const response = await GET(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('should return 404 for non-existent todo', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos/non-existent')
      
      mockPrisma.todo.findUnique.mockResolvedValue(null)

      const response = await GET(mockRequest, { params: { id: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('TODO_NOT_FOUND')
    })

    it('should return 403 for todo without access', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1')
      
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
  })

  describe('PUT /api/todos/[id]', () => {
    it('should update todo for user with edit permission', async () => {
      const updateData = {
        title: 'Updated Todo',
        status: 'in_progress',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo)

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          todo: {
            update: vi.fn().mockResolvedValue(mockTodo),
          },
          todoProject: {
            deleteMany: vi.fn(),
            createMany: vi.fn(),
          },
        }
        return await callback(mockTx)
      })

      const response = await PUT(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.todo.title).toBe('Test Todo')
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })

    it('should return 400 for invalid priority', async () => {
      const updateData = {
        priority: 'invalid',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo)

      const response = await PUT(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('INVALID_PRIORITY')
    })

    it('should return 400 for invalid status', async () => {
      const updateData = {
        status: 'invalid',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo)

      const response = await PUT(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('INVALID_STATUS')
    })

    it('should return 403 for user without edit permission', async () => {
      const updateData = {
        title: 'Updated Todo',
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      const todoWithoutPermission = {
        ...mockTodo,
        createdBy: 'other-user',
        assignedTo: null,
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
                  role: 'viewer',
                },
              ],
            },
          },
        ],
      }

      mockPrisma.todo.findUnique.mockResolvedValue(todoWithoutPermission)

      const response = await PUT(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('ACCESS_DENIED')
    })

    it('should update project relationships', async () => {
      const updateData = {
        projectIds: ['project-2'],
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1', {
        method: 'PUT',
        body: JSON.stringify(updateData),
      })

      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo)
      mockPrisma.projectMember.findMany.mockResolvedValue([
        { id: 'pm-2', projectId: 'project-2', userId: 'user-1', role: 'owner' },
      ])

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        const mockTx = {
          todo: {
            update: vi.fn().mockResolvedValue(mockTodo),
          },
          todoProject: {
            deleteMany: vi.fn(),
            createMany: vi.fn(),
          },
        }
        return await callback(mockTx)
      })

      const response = await PUT(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(mockPrisma.$transaction).toHaveBeenCalled()
    })
  })

  describe('DELETE /api/todos/[id]', () => {
    it('should delete todo for user with delete permission', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1', {
        method: 'DELETE',
      })

      mockPrisma.todo.findUnique.mockResolvedValue(mockTodo)
      mockPrisma.todo.delete.mockResolvedValue(mockTodo)

      const response = await DELETE(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(mockPrisma.todo.delete).toHaveBeenCalledWith({
        where: { id: 'todo-1' },
      })
    })

    it('should return 404 for non-existent todo', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos/non-existent', {
        method: 'DELETE',
      })

      mockPrisma.todo.findUnique.mockResolvedValue(null)

      const response = await DELETE(mockRequest, { params: { id: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error.code).toBe('TODO_NOT_FOUND')
    })

    it('should return 403 for user without delete permission', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/todos/todo-1', {
        method: 'DELETE',
      })

      const todoWithoutPermission = {
        ...mockTodo,
        createdBy: 'other-user',
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
                  role: 'viewer',
                },
              ],
            },
          },
        ],
      }

      mockPrisma.todo.findUnique.mockResolvedValue(todoWithoutPermission)

      const response = await DELETE(mockRequest, { params: { id: 'todo-1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error.code).toBe('ACCESS_DENIED')
    })
  })
}) 