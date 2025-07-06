import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, PUT, DELETE } from './route'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    todo: {
      findMany: vi.fn(),
    },
    projectMessage: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

const mockPrisma = vi.mocked(prisma)
const mockGetCurrentUser = vi.mocked(getCurrentUser)

describe('GET /api/projects/[id]', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test Description',
    ownerId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [
      {
        id: 'member-1',
        projectId: 'project-1',
        userId: 'user-1',
        role: 'owner' as const,
        permissions: ['read', 'write'],
        joinedAt: new Date(),
        user: {
          id: 'user-1',
          name: 'Test User',
          email: 'test@example.com',
        },
      },
    ],
  }

  const mockTodos = [
    {
      id: 'todo-1',
      title: 'Test Todo',
      description: 'Test Description',
      dueDate: new Date(),
      priority: 'medium' as const,
      status: 'pending' as const,
      estimatedTime: 60,
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
          },
        },
      ],
      timeLogs: [],
      recurringPattern: null,
    },
  ]

  const mockMessages = [
    {
      id: 'message-1',
      projectId: 'project-1',
      userId: 'user-1',
      message: 'Test message',
      todoReferences: [],
      createdAt: new Date(),
      user: {
        id: 'user-1',
        name: 'Test User',
        email: 'test@example.com',
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockResolvedValue(mockUser)
  })

  it('should return project details with todos and messages', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(mockProject)
    mockPrisma.todo.findMany.mockResolvedValue(mockTodos)
    mockPrisma.projectMessage.findMany.mockResolvedValue(mockMessages)

    const request = new NextRequest('http://localhost:3000/api/projects/project-1')
    const response = await GET(request, { params: { id: 'project-1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.project).toBeDefined()
    expect(data.todos).toBeDefined()
    expect(data.messages).toBeDefined()
    expect(data.project.id).toBe('project-1')
    expect(data.todos).toHaveLength(1)
    expect(data.messages).toHaveLength(1)
  })

  it('should return 401 when user is not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/projects/project-1')
    const response = await GET(request, { params: { id: 'project-1' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('NOT_AUTHENTICATED')
  })

  it('should return 400 for invalid project ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/projects/invalid')
    const response = await GET(request, { params: { id: '' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('INVALID_PROJECT_ID')
  })

  it('should return 404 when project not found or access denied', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/projects/project-1')
    const response = await GET(request, { params: { id: 'project-1' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('PROJECT_NOT_FOUND')
  })
})

describe('PUT /api/projects/[id]', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test Description',
    ownerId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    members: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockResolvedValue(mockUser)
  })

  it('should update project successfully', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(mockProject)
    mockPrisma.project.update.mockResolvedValue({
      ...mockProject,
      name: 'Updated Project',
      description: 'Updated Description',
    })

    const request = new NextRequest('http://localhost:3000/api/projects/project-1', {
      method: 'PUT',
      body: JSON.stringify({
        name: 'Updated Project',
        description: 'Updated Description',
      }),
    })

    const response = await PUT(request, { params: { id: 'project-1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.project.name).toBe('Updated Project')
    expect(data.project.description).toBe('Updated Description')
  })

  it('should return 401 when user is not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/projects/project-1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated Project' }),
    })

    const response = await PUT(request, { params: { id: 'project-1' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('NOT_AUTHENTICATED')
  })

  it('should return 403 when user has no edit permission', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/projects/project-1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated Project' }),
    })

    const response = await PUT(request, { params: { id: 'project-1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe('NO_PERMISSION')
  })

  it('should return 400 for invalid project name', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(mockProject)
    
    const request = new NextRequest('http://localhost:3000/api/projects/project-1', {
      method: 'PUT',
      body: JSON.stringify({ name: '' }),
    })

    const response = await PUT(request, { params: { id: 'project-1' } })
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('should return 404 when project not found', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(mockProject)
    mockPrisma.project.update.mockRejectedValue(new Error('Record to update not found'))

    const request = new NextRequest('http://localhost:3000/api/projects/project-1', {
      method: 'PUT',
      body: JSON.stringify({ name: 'Updated Project' }),
    })

    const response = await PUT(request, { params: { id: 'project-1' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('PROJECT_NOT_FOUND')
  })
})

describe('DELETE /api/projects/[id]', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockProject = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test Description',
    ownerId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentUser.mockResolvedValue(mockUser)
  })

  it('should delete project successfully', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(mockProject)
    mockPrisma.project.delete.mockResolvedValue(mockProject)

    const request = new NextRequest('http://localhost:3000/api/projects/project-1', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: { id: 'project-1' } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('should return 401 when user is not authenticated', async () => {
    mockGetCurrentUser.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/projects/project-1', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: { id: 'project-1' } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error.code).toBe('NOT_AUTHENTICATED')
  })

  it('should return 403 when user is not owner', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/projects/project-1', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: { id: 'project-1' } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error.code).toBe('NO_PERMISSION')
  })

  it('should return 404 when project not found', async () => {
    mockPrisma.project.findFirst.mockResolvedValue(mockProject)
    mockPrisma.project.delete.mockRejectedValue(new Error('Record to delete does not exist'))

    const request = new NextRequest('http://localhost:3000/api/projects/project-1', {
      method: 'DELETE',
    })

    const response = await DELETE(request, { params: { id: 'project-1' } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.error.code).toBe('PROJECT_NOT_FOUND')
  })
}) 