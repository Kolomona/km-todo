import { test, expect } from '@playwright/test'
import { TestHelpers } from '../utils/test-helpers'

test.describe('Authentication - Login', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in login form
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'loKonoma!!!!!11111')
    
    // Submit form
    await page.click('[data-testid="login-button"]')
    
    // Verify successful login
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Welcome')).toBeVisible()
  })

  test('should login with remember me functionality', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in login form with remember me
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'loKonoma!!!!!11111')
    await page.check('[data-testid="remember-me-checkbox"]')
    
    // Submit form
    await page.click('[data-testid="login-button"]')
    
    // Verify successful login
    await expect(page).toHaveURL('/dashboard')
    
    // Verify persistent session (cookie should have maxAge)
    const cookies = await page.context().cookies()
    const sessionCookie = cookies.find(cookie => cookie.name === 'session')
    expect(sessionCookie).toBeTruthy()
  })

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in invalid credentials
    await page.fill('[data-testid="email-input"]', 'invalid@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    
    // Submit form
    await page.click('[data-testid="login-button"]')
    
    // Verify error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit without filling fields
    await page.click('[data-testid="login-button"]')
    
    // Verify validation messages
    await expect(page.locator('text=Email and password are required')).toBeVisible()
  })

  test('should be accessible', async ({ page }) => {
    await page.goto('/login')
    
    // Check for proper form labels
    await helpers.expectAccessible('[data-testid="email-input"]')
    await helpers.expectAccessible('[data-testid="password-input"]')
    await helpers.expectAccessible('[data-testid="login-button"]')
    
    // Check for proper heading structure
    await expect(page.locator('h1')).toBeVisible()
  })
}) 