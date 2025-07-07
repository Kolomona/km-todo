import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET } from './route'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      count: vi.fn()
    },
    systemConfig: {
      findUnique: vi.fn()
    }
  }
}))

describe('/api/setup/status', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should return needsSetup: true when no users exist', async () => {
    const request = new NextRequest('http://localhost:3000/api/setup/status', {
      method: 'GET'
    })

    vi.mocked(prisma.user.count).mockResolvedValue(0)
    vi.mocked(prisma.systemConfig.findUnique).mockResolvedValue(null)

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.needsSetup).toBe(true)
    expect(data.message).toContain('Setup is required')
  })

  it('should return needsSetup: true when setup is not marked as complete', async () => {
    const request = new NextRequest('http://localhost:3000/api/setup/status', {
      method: 'GET'
    })

    vi.mocked(prisma.user.count).mockResolvedValue(1)
    vi.mocked(prisma.systemConfig.findUnique).mockResolvedValue({
      id: '1',
      key: 'setup_complete',
      value: 'false',
      createdAt: new Date()
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.needsSetup).toBe(true)
    expect(data.message).toContain('Setup is required')
  })

  it('should return needsSetup: false when setup is complete', async () => {
    const request = new NextRequest('http://localhost:3000/api/setup/status', {
      method: 'GET'
    })

    vi.mocked(prisma.user.count).mockResolvedValue(1)
    vi.mocked(prisma.systemConfig.findUnique).mockResolvedValue({
      id: '1',
      key: 'setup_complete',
      value: 'true',
      createdAt: new Date()
    })

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.needsSetup).toBe(false)
    expect(data.message).toContain('Setup is already complete')
  })

  it('should handle database errors gracefully', async () => {
    const request = new NextRequest('http://localhost:3000/api/setup/status', {
      method: 'GET'
    })

    vi.mocked(prisma.user.count).mockRejectedValue(new Error('Database connection failed'))

    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error.code).toBe('SETUP_STATUS_ERROR')
    expect(data.error.message).toBe('Failed to check setup status')
  })
}) 