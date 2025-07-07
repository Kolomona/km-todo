import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { POST } from './route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      count: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn()
    },
    systemConfig: {
      findUnique: vi.fn(),
      create: vi.fn()
    },
    $transaction: vi.fn()
  }
}))

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn()
  }
}))

describe('/api/setup/initialize', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should create admin user and mark setup as complete', async () => {
    const request = new NextRequest('http://localhost:3000/api/setup/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'SecurePass123!',
        name: 'Admin User'
      })
    })

    vi.mocked(prisma.user.count).mockResolvedValue(0)
    vi.mocked(prisma.systemConfig.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)
    vi.mocked(bcrypt.hash).mockResolvedValue('hashedPassword' as never)

    const mockUser = {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    vi.mocked(prisma.$transaction).mockResolvedValue(mockUser)

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user.email).toBe('admin@example.com')
    expect(data.message).toContain('Setup completed successfully')
  })

  it('should return 409 when setup is already complete', async () => {
    const request = new NextRequest('http://localhost:3000/api/setup/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'SecurePass123!',
        name: 'Admin User'
      })
    })

    vi.mocked(prisma.user.count).mockResolvedValue(1)
    vi.mocked(prisma.systemConfig.findUnique).mockResolvedValue({
      id: '1',
      key: 'setup_complete',
      value: 'true',
      createdAt: new Date()
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error.code).toBe('SETUP_ALREADY_COMPLETE')
  })

  it('should return 400 when required fields are missing', async () => {
    const request = new NextRequest('http://localhost:3000/api/setup/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com'
        // Missing password and name
      })
    })

    vi.mocked(prisma.user.count).mockResolvedValue(0)
    vi.mocked(prisma.systemConfig.findUnique).mockResolvedValue(null)

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('MISSING_REQUIRED_FIELDS')
  })

  it('should return 400 for invalid email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/setup/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'SecurePass123!',
        name: 'Admin User'
      })
    })

    vi.mocked(prisma.user.count).mockResolvedValue(0)
    vi.mocked(prisma.systemConfig.findUnique).mockResolvedValue(null)

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('INVALID_EMAIL')
  })

  it('should return 400 for weak password', async () => {
    const request = new NextRequest('http://localhost:3000/api/setup/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'weak',
        name: 'Admin User'
      })
    })

    vi.mocked(prisma.user.count).mockResolvedValue(0)
    vi.mocked(prisma.systemConfig.findUnique).mockResolvedValue(null)

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.code).toBe('WEAK_PASSWORD')
  })

  it('should return 409 when email already exists', async () => {
    const request = new NextRequest('http://localhost:3000/api/setup/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'SecurePass123!',
        name: 'Admin User'
      })
    })

    vi.mocked(prisma.user.count).mockResolvedValue(0)
    vi.mocked(prisma.systemConfig.findUnique).mockResolvedValue(null)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: '1',
      email: 'admin@example.com',
      name: 'Existing User',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date()
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.error.code).toBe('EMAIL_ALREADY_EXISTS')
  })

  it('should handle database errors gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/setup/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'SecurePass123!',
        name: 'Admin User'
      })
    })

    vi.mocked(prisma.user.count).mockRejectedValue(new Error('Database connection failed'))

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('SETUP_INITIALIZATION_ERROR')
  })

  it('should validate password complexity requirements', async () => {
    const testCases = [
      { password: 'short', expected: 'at least 8 characters' },
      { password: 'nouppercase123!', expected: 'uppercase letter' },
      { password: 'NOLOWERCASE123!', expected: 'lowercase letter' },
      { password: 'NoNumbers!', expected: 'number' },
      { password: 'NoSpecial123', expected: 'special character' }
    ]

    for (const { password, expected } of testCases) {
      const request = new NextRequest('http://localhost:3000/api/setup/initialize', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@example.com',
          password,
          name: 'Admin User'
        })
      })

      vi.mocked(prisma.user.count).mockResolvedValue(0)
      vi.mocked(prisma.systemConfig.findUnique).mockResolvedValue(null)

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error.code).toBe('WEAK_PASSWORD')
      expect(data.error.message).toContain(expected)
    }
  })
}) 