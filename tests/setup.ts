import '@testing-library/jest-dom'
import { vi, beforeEach, afterEach } from 'vitest'

// Mock Next.js cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}))

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// Global test setup
beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.resetAllMocks()
}) 