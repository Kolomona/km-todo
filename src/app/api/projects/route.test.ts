import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from './route'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    projectMember: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

// Mock auth utilities
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn(),
}))

describe('/api/projects', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('GET /api/projects', () => {
    it('should return user projects successfully', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          name: 'Test Project',
          description: 'Test description',
          ownerId: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          members: [
            {
              id: 'member-1',
              projectId: 'project-1',
              userId: 'user-1',
              role: 'owner',
              permissions: ['read', 'write'],
              joinedAt: new Date(),
              user: {
                id: 'user-1',
                name: 'Test User',
                email: 'test@example.com',
              },
            },
          ],
          _count: {
            todos: 5,
            messages: 2,
          },
        },
      ]

      vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(prisma.project.findMany).mockResolvedValue(mockProjects)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.projects).toHaveLength(1)
      expect(data.projects[0].name).toBe('Test Project')
      expect(data.projects[0].description).toBe('Test description')
      expect(data.projects[0].members).toHaveLength(1)
      expect(data.totalCount).toBe(1)
    })

    it('should return empty array when user has no projects', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(prisma.project.findMany).mockResolvedValue([])

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.projects).toHaveLength(0)
      expect(data.totalCount).toBe(0)
    })

    it('should return 401 when user not authenticated', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('NOT_AUTHENTICATED')
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(prisma.project.findMany).mockRejectedValue(new Error('Database error'))

      const response = await GET()
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR')
    })
  })

  describe('POST /api/projects', () => {
    it('should create a new project successfully', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'New Project',
        description: 'New project description',
        ownerId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          {
            id: 'member-1',
            projectId: 'project-1',
            userId: 'user-1',
            role: 'owner',
            permissions: ['read', 'write', 'delete', 'manage_members'],
            joinedAt: new Date(),
            user: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
            },
          },
        ],
      }

      vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
      
      // Mock the transaction to return the project with members
      vi.mocked(prisma.$transaction).mockResolvedValue(mockProject)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Project',
          description: 'New project description',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.project.name).toBe('New Project')
      expect(data.project.description).toBe('New project description')
      expect(data.project.ownerId).toBe('user-1')
    })

    it('should create project without description', async () => {
      const mockProject = {
        id: 'project-1',
        name: 'New Project',
        description: null,
        ownerId: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        members: [
          {
            id: 'member-1',
            projectId: 'project-1',
            userId: 'user-1',
            role: 'owner',
            permissions: ['read', 'write', 'delete', 'manage_members'],
            joinedAt: new Date(),
            user: {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
            },
          },
        ],
      }

      vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
      
      // Mock the transaction to return the project with members
      vi.mocked(prisma.$transaction).mockResolvedValue(mockProject)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Project',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.project.name).toBe('New Project')
      expect(data.project.description).toBeNull()
    })

    it('should return 401 when user not authenticated', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Project',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error.code).toBe('NOT_AUTHENTICATED')
    })

    it('should return 400 when name is missing', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          description: 'Project description',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('MISSING_REQUIRED_FIELDS')
    })

    it('should return 400 when name is empty string', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: '',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('MISSING_REQUIRED_FIELDS')
    })

    it('should return 400 when name is too long', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

      const longName = 'a'.repeat(101)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: longName,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.message).toContain('100 characters or less')
    })

    it('should return 400 when description is too long', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser)

      const longDescription = 'a'.repeat(1001)

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Project',
          description: longDescription,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('VALIDATION_ERROR')
      expect(data.error.message).toContain('1000 characters or less')
    })

    it('should handle database errors gracefully', async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(prisma.project.create).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Project',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error.code).toBe('INTERNAL_SERVER_ERROR')
    })
  })
}) 