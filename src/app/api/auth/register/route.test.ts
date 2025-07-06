import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import { prisma } from '@/lib/prisma'
import { hashPassword, validateEmail, validatePassword, createSession, setSessionCookie } from '@/lib/auth'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

// Mock auth utilities
vi.mock('@/lib/auth', () => ({
  hashPassword: vi.fn(),
  validateEmail: vi.fn(),
  validatePassword: vi.fn(),
  createSession: vi.fn(),
  setSessionCookie: vi.fn(),
}))

describe('/api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should register a new user successfully', async () => {
    const mockUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockSessionId = 'session-1'

    // Mock dependencies
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as unknown as any)
    vi.mocked(hashPassword).mockResolvedValue('hashedpassword')
    vi.mocked(validateEmail).mockReturnValue(true)
    vi.mocked(validatePassword).mockReturnValue({ isValid: true, errors: [] })
    vi.mocked(createSession).mockResolvedValue(mockSessionId)
    vi.mocked(setSessionCookie).mockResolvedValue()

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user.email).toBe('test@example.com')
    expect(data.user.name).toBe('Test User')
    expect(data.session.id).toBe(mockSessionId)
    expect(data.user.passwordHash).toBeUndefined()
  })

  it('should return 400 for missing required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        // Missing password and name
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('MISSING_REQUIRED_FIELDS')
  })

  it('should return 409 for existing email', async () => {
    const existingUser = {
      id: 'user-1',
      email: 'test@example.com',
      name: 'Existing User',
      passwordHash: 'hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Mock dependencies
    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser)
    vi.mocked(validateEmail).mockReturnValue(true)
    vi.mocked(validatePassword).mockReturnValue({ isValid: true, errors: [] })

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error.code).toBe('EMAIL_ALREADY_EXISTS')
  })

  it('should return 400 for invalid email format', async () => {
    vi.mocked(validateEmail).mockReturnValue(false)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'Password123',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('INVALID_EMAIL')
  })

  it('should return 400 for weak password', async () => {
    vi.mocked(validateEmail).mockReturnValue(true)
    vi.mocked(validatePassword).mockReturnValue({
      isValid: false,
      errors: ['Password must be at least 8 characters long'],
    })

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'weak',
        name: 'Test User',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('WEAK_PASSWORD')
    expect(data.error.details).toContain('Password must be at least 8 characters long')
  })
}) 