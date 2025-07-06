import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    session: {
      create: vi.fn(),
    },
  },
}))

// Mock auth utilities
vi.mock('@/lib/auth', () => ({
  verifyPassword: vi.fn(),
  createSession: vi.fn(),
  setSessionCookie: vi.fn(),
}))

describe('/api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should login admin user successfully', async () => {
    const mockUser = {
      id: 'admin-user-id',
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockSessionId = 'session-id'

    // Mock dependencies
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
    vi.mocked(verifyPassword).mockResolvedValue(true)
    vi.mocked(createSession).mockResolvedValue(mockSessionId)
    vi.mocked(setSessionCookie).mockResolvedValue()

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'loKonoma!!!!!11111',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user.email).toBe('admin@example.com')
    expect(data.user.name).toBe('Admin User')
    expect(data.session.id).toBe(mockSessionId)
  })

  it('should return 400 for missing credentials', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.message).toContain('Email and password are required')
  })

  it('should return 400 for invalid credentials', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.message).toContain('Invalid credentials')
  })

  it('should return 400 for wrong password', async () => {
    const mockUser = {
      id: 'admin-user-id',
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: 'hashedpassword',
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
    vi.mocked(verifyPassword).mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'wrongpassword',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.message).toContain('Invalid credentials')
  })
}) 