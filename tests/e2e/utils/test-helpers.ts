import { Page, expect } from '@playwright/test'

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Login with admin credentials
   */
  async loginAsAdmin(rememberMe = false) {
    await this.page.goto('/login')
    
    await this.page.fill('[data-testid="email-input"]', 'admin@example.com')
    await this.page.fill('[data-testid="password-input"]', 'loKonoma!!!!!11111')
    
    if (rememberMe) {
      await this.page.check('[data-testid="remember-me-checkbox"]')
    }
    
    await this.page.click('[data-testid="login-button"]')
    
    // Wait for successful login
    await expect(this.page).toHaveURL('/dashboard')
  }

  /**
   * Register a new user
   */
  async registerUser(email: string, password: string, name: string) {
    await this.page.goto('/register')
    
    await this.page.fill('[data-testid="name-input"]', name)
    await this.page.fill('[data-testid="email-input"]', email)
    await this.page.fill('[data-testid="password-input"]', password)
    await this.page.fill('[data-testid="confirm-password-input"]', password)
    
    await this.page.click('[data-testid="register-button"]')
    
    // Wait for successful registration
    await expect(this.page).toHaveURL('/dashboard')
  }

  /**
   * Logout current user
   */
  async logout() {
    await this.page.click('[data-testid="user-menu-button"]')
    await this.page.click('[data-testid="logout-button"]')
    
    // Wait for logout
    await expect(this.page).toHaveURL('/login')
  }

  /**
   * Create a new project
   */
  async createProject(name: string, description?: string) {
    await this.page.click('[data-testid="create-project-button"]')
    
    await this.page.fill('[data-testid="project-name-input"]', name)
    if (description) {
      await this.page.fill('[data-testid="project-description-input"]', description)
    }
    
    await this.page.click('[data-testid="save-project-button"]')
    
    // Wait for project creation
    await expect(this.page.locator(`text=${name}`)).toBeVisible()
  }

  /**
   * Create a new todo
   */
  async createTodo(title: string, projectId?: string) {
    await this.page.click('[data-testid="create-todo-button"]')
    
    await this.page.fill('[data-testid="todo-title-input"]', title)
    if (projectId) {
      await this.page.selectOption('[data-testid="todo-project-select"]', projectId)
    }
    
    await this.page.click('[data-testid="save-todo-button"]')
    
    // Wait for todo creation
    await expect(this.page.locator(`text=${title}`)).toBeVisible()
  }

  /**
   * Wait for API response
   */
  async waitForAPIResponse(url: string, method = 'GET') {
    return this.page.waitForResponse(response => 
      response.url().includes(url) && response.request().method() === method
    )
  }

  /**
   * Clear all data between tests
   */
  async clearTestData() {
    // This would typically call an API endpoint to reset the database
    // For now, we'll rely on the global setup/teardown
  }

  /**
   * Check if element is visible and accessible
   */
  async expectAccessible(selector: string) {
    const element = this.page.locator(selector)
    await expect(element).toBeVisible()
    
    // Check for proper ARIA attributes
    const ariaLabel = await element.getAttribute('aria-label')
    const role = await element.getAttribute('role')
    
    expect(ariaLabel || role).toBeTruthy()
  }
} 