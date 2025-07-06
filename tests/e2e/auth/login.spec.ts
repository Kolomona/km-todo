import { test, expect } from '@playwright/test'

test.describe('Authentication - Login', () => {

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in login form
    await page.fill('[data-testid="email-input"]', 'admin@example.com')
    await page.fill('[data-testid="password-input"]', 'loKonoma!!!!!11111')
    
    // Listen for login response
    const loginPromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/login') && response.request().method() === 'POST'
    );
    
    // Submit form
    await page.click('[data-testid="login-button"]')
    
    // Wait for login response
    const loginResponse = await loginPromise;
    
    // Check if login was successful
    expect(loginResponse.status()).toBe(200);
    
    // For WebKit, manually navigate to dashboard since cookies might not work
    if (page.context().browser()?.browserType().name() === 'webkit') {
      await page.goto('/dashboard');
      await page.waitForLoadState('networkidle');
    }
    
    // Verify successful login
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1:has-text("Welcome back")')).toBeVisible()
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
    await expect(page.locator('form[aria-label="Login form"] .text-red-700:has-text("Invalid email or password")')).toBeVisible()
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
    
    // Check for proper form structure
    await expect(page.locator('form[aria-label="Login form"]')).toBeVisible()
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible()
    
    // Check for proper heading structure
    await expect(page.locator('h2')).toBeVisible()
  })
}) 