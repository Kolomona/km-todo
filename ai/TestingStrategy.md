# Testing Strategy - KM Todo Application

*This document outlines the comprehensive testing approach for the KM Todo application, covering unit, integration, and E2E testing.*

## 1. Testing Overview

### Testing Philosophy
- **Test-Driven Development (TDD)**: Write tests before implementation where possible
- **Contract-First Testing**: All tests must validate API_CONTRACT.md compliance
- **User-Centric Testing**: Focus on user workflows and business value
- **Performance Testing**: Ensure < 2s page loads and < 500ms API responses
- **Accessibility Testing**: WCAG 2.1 AA compliance validation

### Testing Pyramid
```
    E2E Tests (Playwright) - 10%
        /     \
   Integration Tests - 20%
        /     \
   Unit Tests (Jest/Vitest) - 70%
```

## 2. Unit Testing

### Technology Stack
- **Framework**: Vitest (faster than Jest, better ESM support)
- **React Testing**: React Testing Library + @testing-library/jest-dom
- **API Testing**: Supertest for Next.js API routes
- **Database Testing**: Prisma with test database
- **Mocking**: MSW (Mock Service Worker) for API mocking

### Test Structure
```
tests/
├── unit/
│   ├── components/
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── todos/
│   │   └── analytics/
│   ├── api/
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── todos/
│   │   └── analytics/
│   ├── lib/
│   │   ├── auth.test.ts
│   │   ├── validations.test.ts
│   │   └── utils.test.ts
│   └── types/
│       └── api.test.ts
```

### Component Testing Examples

#### Authentication Components
```typescript
// tests/unit/components/auth/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/auth/LoginForm'

describe('LoginForm', () => {
  it('should validate required fields', async () => {
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    const mockOnSubmit = vi.fn()
    render(<LoginForm onSubmit={mockOnSubmit} />)
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    })
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      })
    })
  })
})
```

#### Todo Components
```typescript
// tests/unit/components/todos/TodoItem.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { TodoItem } from '@/components/todos/TodoItem'

describe('TodoItem', () => {
  const mockTodo = {
    id: '1',
    title: 'Test Todo',
    status: 'pending' as const,
    priority: 'medium' as const,
    dueDate: '2024-12-25T00:00:00Z'
  }

  it('should display todo information correctly', () => {
    render(<TodoItem todo={mockTodo} />)
    
    expect(screen.getByText('Test Todo')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('should handle status toggle', async () => {
    const mockOnToggle = vi.fn()
    render(<TodoItem todo={mockTodo} onToggle={mockOnToggle} />)
    
    fireEvent.click(screen.getByRole('checkbox'))
    
    expect(mockOnToggle).toHaveBeenCalledWith('1', 'completed')
  })
})
```

### API Route Testing
```typescript
// tests/unit/api/auth/login.test.ts
import { createMocks } from 'node-mocks-http'
import { POST } from '@/app/api/auth/login/route'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma')

describe('/api/auth/login', () => {
  it('should return 400 for invalid credentials', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error.message).toContain('Invalid credentials')
  })

  it('should return user and session for valid credentials', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashedpassword'
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as any)
    vi.mocked(bcrypt.compare).mockResolvedValue(true as any)

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    })

    const response = await POST(req)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.user.email).toBe('test@example.com')
    expect(data.session).toBeDefined()
  })
})
```

## 3. Integration Testing

### Technology Stack
- **Framework**: Vitest with test database
- **Database**: PostgreSQL test instance with Prisma
- **API Testing**: Supertest for full request/response testing
- **Authentication**: Session management testing

### Test Database Setup
```typescript
// tests/integration/setup.ts
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

beforeAll(async () => {
  // Set test database URL
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/km_todo_test'
  
  // Run migrations
  execSync('npx prisma migrate deploy', { env: process.env })
})

beforeEach(async () => {
  // Clean database before each test
  await prisma.todoTime.deleteMany()
  await prisma.todoProject.deleteMany()
  await prisma.todo.deleteMany()
  await prisma.projectMember.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
```

### Integration Test Examples

#### Authentication Flow
```typescript
// tests/integration/auth.test.ts
import request from 'supertest'
import { app } from '@/app'
import { prisma } from '@/lib/prisma'

describe('Authentication Integration', () => {
  it('should complete full auth flow', async () => {
    // 1. Register user
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })

    expect(registerResponse.status).toBe(200)
    expect(registerResponse.body.user.email).toBe('test@example.com')

    // 2. Login user
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })

    expect(loginResponse.status).toBe(200)
    const cookies = loginResponse.headers['set-cookie']

    // 3. Access protected route
    const meResponse = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies)

    expect(meResponse.status).toBe(200)
    expect(meResponse.body.user.email).toBe('test@example.com')
  })
})
```

#### Todo Management Flow
```typescript
// tests/integration/todos.test.ts
import request from 'supertest'
import { app } from '@/app'
import { createTestUser, createTestProject } from '@/tests/helpers'

describe('Todo Management Integration', () => {
  let authCookies: string[]
  let userId: string
  let projectId: string

  beforeEach(async () => {
    const user = await createTestUser()
    userId = user.id
    const project = await createTestProject(userId)
    projectId = project.id

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })

    authCookies = loginResponse.headers['set-cookie']
  })

  it('should create and manage todos', async () => {
    // 1. Create todo
    const createResponse = await request(app)
      .post('/api/todos')
      .set('Cookie', authCookies)
      .send({
        title: 'Test Todo',
        description: 'Test description',
        priority: 'high',
        projectIds: [projectId]
      })

    expect(createResponse.status).toBe(200)
    const todoId = createResponse.body.todo.id

    // 2. Update todo
    const updateResponse = await request(app)
      .put(`/api/todos/${todoId}`)
      .set('Cookie', authCookies)
      .send({
        status: 'completed'
      })

    expect(updateResponse.status).toBe(200)
    expect(updateResponse.body.todo.status).toBe('completed')

    // 3. Get todos
    const listResponse = await request(app)
      .get('/api/todos')
      .set('Cookie', authCookies)

    expect(listResponse.status).toBe(200)
    expect(listResponse.body.todos).toHaveLength(1)
  })
})
```

## 4. E2E Testing

### Technology Stack
- **Framework**: Playwright
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile Testing**: Responsive design validation
- **Performance**: Lighthouse integration

### Test Structure
```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── register.spec.ts
│   ├── projects/
│   │   ├── create-project.spec.ts
│   │   └── manage-members.spec.ts
│   ├── todos/
│   │   ├── create-todo.spec.ts
│   │   ├── edit-todo.spec.ts
│   │   └── time-tracking.spec.ts
│   ├── analytics/
│   │   └── dashboard.spec.ts
│   └── utils/
│       ├── setup.ts
│       └── helpers.ts
```

### E2E Test Examples

#### Authentication Flow
```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('Test User')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('[data-testid="email-input"]', 'invalid@example.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials')
  })
})
```

#### Todo Management Flow
```typescript
// tests/e2e/todos/create-todo.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Todo Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should create a new todo', async ({ page }) => {
    await page.click('[data-testid="create-todo-button"]')
    
    await page.fill('[data-testid="todo-title"]', 'New Test Todo')
    await page.fill('[data-testid="todo-description"]', 'This is a test todo')
    await page.selectOption('[data-testid="todo-priority"]', 'high')
    await page.fill('[data-testid="todo-due-date"]', '2024-12-25')
    
    await page.click('[data-testid="save-todo-button"]')
    
    await expect(page.locator('[data-testid="todo-list"]')).toContainText('New Test Todo')
    await expect(page.locator('[data-testid="todo-list"]')).toContainText('High Priority')
  })

  test('should edit existing todo', async ({ page }) => {
    // Create a todo first
    await page.click('[data-testid="create-todo-button"]')
    await page.fill('[data-testid="todo-title"]', 'Original Todo')
    await page.click('[data-testid="save-todo-button"]')
    
    // Edit the todo
    await page.click('[data-testid="edit-todo-button"]')
    await page.fill('[data-testid="todo-title"]', 'Updated Todo')
    await page.click('[data-testid="save-todo-button"]')
    
    await expect(page.locator('[data-testid="todo-list"]')).toContainText('Updated Todo')
    await expect(page.locator('[data-testid="todo-list"]')).not.toContainText('Original Todo')
  })
})
```

## 5. Performance Testing

### Lighthouse Integration
```typescript
// tests/performance/lighthouse.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Performance', () => {
  test('should meet performance standards', async ({ page }) => {
    await page.goto('/dashboard')
    
    const lighthouse = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Lighthouse audit
        const audit = new (window as any).Lighthouse()
        audit.run().then((results: any) => {
          resolve(results)
        })
      })
    })

    expect(lighthouse.performance).toBeGreaterThan(90)
    expect(lighthouse.accessibility).toBeGreaterThan(90)
    expect(lighthouse['best-practices']).toBeGreaterThan(90)
  })
})
```

## 6. Accessibility Testing

### Automated Accessibility Tests
```typescript
// tests/accessibility/a11y.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
  test('should meet WCAG 2.1 AA standards', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all()
    expect(headings.length).toBeGreaterThan(0)
    
    // Check for alt text on images
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeTruthy()
    }
    
    // Check for proper form labels
    const inputs = await page.locator('input, select, textarea').all()
    for (const input of inputs) {
      const label = await input.getAttribute('aria-label') || 
                   await input.getAttribute('id') && 
                   await page.locator(`label[for="${await input.getAttribute('id')}"]`).count()
      expect(label).toBeTruthy()
    }
  })
})
```

## 7. Test Configuration

### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI
  }
})
```

## 8. CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: km_todo_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run database migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/km_todo_test
      
      - name: Run unit tests
        run: npm run test:unit
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/km_todo_test
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/km_todo_test
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/km_todo_test
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## 9. Test Scripts

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest --config vitest.config.ts",
    "test:integration": "vitest --config vitest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:ci": "npm run test:unit && npm run test:integration && npm run test:e2e"
  }
}
```

## 10. Testing Best Practices

### Code Quality
- **Test Naming**: Descriptive test names that explain the scenario
- **AAA Pattern**: Arrange, Act, Assert structure
- **DRY Principle**: Reuse test utilities and helpers
- **Isolation**: Each test should be independent

### Data Management
- **Test Data**: Use factories for consistent test data
- **Database Cleanup**: Clean database between tests
- **Mocking**: Mock external services and complex operations
- **Fixtures**: Use fixtures for common test scenarios

### Performance
- **Fast Tests**: Unit tests should run in milliseconds
- **Parallel Execution**: Run tests in parallel when possible
- **Selective Testing**: Run only relevant tests during development
- **Test Database**: Use separate test database

---

*This testing strategy ensures comprehensive coverage and maintains code quality throughout the development process.* 