import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Session management utilities
export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30) // 30 days from now

  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
    },
  })

  return session.id
}

export async function getSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    return null
  }

  return session
}

export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.session.delete({
    where: { id: sessionId },
  })
}

// Cookie management utilities
export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('session', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: '/',
  })
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('session')?.value
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

// Authentication middleware
export async function getCurrentUser() {
  const sessionId = await getSessionCookie()
  
  if (!sessionId) {
    return null
  }

  const session = await getSession(sessionId)
  return session?.user || null
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  return user
}

// User validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Error handling utilities
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'AUTH_ERROR'
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export function createAuthError(message: string, statusCode: number = 400, code?: string): AuthError {
  return new AuthError(message, statusCode, code)
} 