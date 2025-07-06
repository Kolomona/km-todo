import { test, expect } from '@playwright/test'

test.describe('API Endpoints Verification', () => {

  test.describe('Authentication Endpoints', () => {
    test('POST /api/auth/register - should register new user', async ({ request }) => {
      // Generate unique email to avoid conflicts
      const uniqueEmail = `test-${Date.now()}@example.com`
      
      const response = await request.post('/api/auth/register', {
        data: {
          email: uniqueEmail,
          password: 'TestPassword123!',
          name: 'Test User'
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.user).toBeDefined()
      expect(data.session).toBeDefined()
      expect(data.user.email).toBe(uniqueEmail)
    })

    test('POST /api/auth/login - should login with valid credentials', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: {
          email: 'admin@example.com',
          password: 'loKonoma!!!!!11111'
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.user).toBeDefined()
      expect(data.session).toBeDefined()
      expect(data.session.persistent).toBe(false)
    })

    test('POST /api/auth/login - should handle remember me', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: {
          email: 'admin@example.com',
          password: 'loKonoma!!!!!11111',
          rememberMe: true
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.session.persistent).toBe(true)
    })

    test('GET /api/auth/me - should return current user', async ({ request }) => {
      // First login to get session
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'admin@example.com',
          password: 'loKonoma!!!!!11111'
        }
      })
      
      const loginData = await loginResponse.json()
      const sessionId = loginData.session.id

      // Get current user with session
      const response = await request.get('/api/auth/me', {
        headers: {
          'Cookie': `session=${sessionId}`
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.user).toBeDefined()
      expect(data.user.email).toBe('admin@example.com')
    })

    test('POST /api/auth/logout - should logout user', async ({ request }) => {
      // First login to get session
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'admin@example.com',
          password: 'loKonoma!!!!!11111'
        }
      })
      
      const loginData = await loginResponse.json()
      const sessionId = loginData.session.id

      // Logout
      const response = await request.post('/api/auth/logout', {
        headers: {
          'Cookie': `session=${sessionId}`
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })

  test.describe('Project Endpoints', () => {
    let sessionId: string

    test.beforeEach(async ({ request }) => {
      // Login to get session
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'admin@example.com',
          password: 'loKonoma!!!!!11111'
        }
      })
      
      const loginData = await loginResponse.json()
      sessionId = loginData.session.id
    })

    test('GET /api/projects - should return projects list', async ({ request }) => {
      const response = await request.get('/api/projects', {
        headers: {
          'Cookie': `session=${sessionId}`
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.projects).toBeDefined()
      expect(Array.isArray(data.projects)).toBe(true)
    })

    test('POST /api/projects - should create new project', async ({ request }) => {
      const response = await request.post('/api/projects', {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          name: 'Test Project',
          description: 'Test project description'
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.project).toBeDefined()
      expect(data.project.name).toBe('Test Project')
    })

    test('GET /api/projects/[id] - should return project details', async ({ request }) => {
      // First create a project
      const createResponse = await request.post('/api/projects', {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          name: 'Test Project for Details',
          description: 'Test description'
        }
      })
      
      const createData = await createResponse.json()
      const projectId = createData.project.id

      // Get project details
      const response = await request.get(`/api/projects/${projectId}`, {
        headers: {
          'Cookie': `session=${sessionId}`
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.project).toBeDefined()
      expect(data.project.id).toBe(projectId)
    })

    test('PUT /api/projects/[id] - should update project', async ({ request }) => {
      // First create a project
      const createResponse = await request.post('/api/projects', {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          name: 'Project to Update',
          description: 'Original description'
        }
      })
      
      const createData = await createResponse.json()
      const projectId = createData.project.id

      // Update project
      const response = await request.put(`/api/projects/${projectId}`, {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          name: 'Updated Project Name',
          description: 'Updated description'
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.project.name).toBe('Updated Project Name')
    })

    test('DELETE /api/projects/[id] - should delete project', async ({ request }) => {
      // First create a project
      const createResponse = await request.post('/api/projects', {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          name: 'Project to Delete',
          description: 'Will be deleted'
        }
      })
      
      const createData = await createResponse.json()
      const projectId = createData.project.id

      // Delete project
      const response = await request.delete(`/api/projects/${projectId}`, {
        headers: {
          'Cookie': `session=${sessionId}`
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })
  })

  test.describe('Todo Endpoints', () => {
    let sessionId: string
    let projectId: string

    test.beforeEach(async ({ request }) => {
      // Login to get session
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'admin@example.com',
          password: 'loKonoma!!!!!11111'
        }
      })
      
      const loginData = await loginResponse.json()
      sessionId = loginData.session.id

      // Create a project for todos
      const projectResponse = await request.post('/api/projects', {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          name: 'Test Project for Todos',
          description: 'Project for todo testing'
        }
      })
      
      const projectData = await projectResponse.json()
      projectId = projectData.project.id
      
      // Ensure user is a member of the project (project creator is automatically a member)
      // The project creation endpoint should handle this, but let's verify
    })

    test('GET /api/todos - should return todos list', async ({ request }) => {
      const response = await request.get('/api/todos', {
        headers: {
          'Cookie': `session=${sessionId}`
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.todos).toBeDefined()
      expect(Array.isArray(data.todos)).toBe(true)
    })

    test('POST /api/todos - should create new todo', async ({ request }) => {
      const response = await request.post('/api/todos', {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          title: 'Test Todo',
          description: 'Test todo description',
          priority: 'medium',
          status: 'pending',
          projectIds: [projectId]
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.todo).toBeDefined()
      expect(data.todo.title).toBe('Test Todo')
    })

    test('GET /api/todos/[id] - should return todo details', async ({ request }) => {
      // First create a todo
      const createResponse = await request.post('/api/todos', {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          title: 'Todo for Details',
          description: 'Test description',
          priority: 'high',
          status: 'pending',
          projectIds: [projectId]
        }
      })
      
      const createData = await createResponse.json()
      const todoId = createData.todo.id

      // Get todo details
      const response = await request.get(`/api/todos/${todoId}`, {
        headers: {
          'Cookie': `session=${sessionId}`
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.todo).toBeDefined()
      expect(data.todo.id).toBe(todoId)
    })

    test('PUT /api/todos/[id] - should update todo', async ({ request }) => {
      // First create a todo
      const createResponse = await request.post('/api/todos', {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          title: 'Todo to Update',
          description: 'Original description',
          priority: 'low',
          status: 'pending',
          projectIds: [projectId]
        }
      })
      
      const createData = await createResponse.json()
      const todoId = createData.todo.id

      // Update todo
      const response = await request.put(`/api/todos/${todoId}`, {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          title: 'Updated Todo Title',
          status: 'completed'
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.todo.title).toBe('Updated Todo Title')
      expect(data.todo.status).toBe('completed')
    })

    test('DELETE /api/todos/[id] - should delete todo', async ({ request }) => {
      // First create a todo
      const createResponse = await request.post('/api/todos', {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          title: 'Todo to Delete',
          description: 'Will be deleted',
          priority: 'medium',
          status: 'pending',
          projectIds: [projectId]
        }
      })
      
      const createData = await createResponse.json()
      const todoId = createData.todo.id

      // Delete todo
      const response = await request.delete(`/api/todos/${todoId}`, {
        headers: {
          'Cookie': `session=${sessionId}`
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
    })

    test('POST /api/todos/[id]/time - should log time', async ({ request }) => {
      // First create a todo
      const createResponse = await request.post('/api/todos', {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          title: 'Todo for Time Logging',
          description: 'Test time logging',
          priority: 'medium',
          status: 'in_progress',
          projectIds: [projectId]
        }
      })
      
      const createData = await createResponse.json()
      const todoId = createData.todo.id

      // Log time
      const response = await request.post(`/api/todos/${todoId}/time`, {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          timeSpent: 30,
          date: new Date().toISOString(),
          notes: 'Test time log'
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.timeLog).toBeDefined()
      expect(data.timeLog.timeSpent).toBe(30)
    })

    test('GET /api/todos/[id]/time - should return time logs', async ({ request }) => {
      // First create a todo
      const createResponse = await request.post('/api/todos', {
        headers: {
          'Cookie': `session=${sessionId}`
        },
        data: {
          title: 'Todo for Time Logs',
          description: 'Test time logs',
          priority: 'medium',
          status: 'in_progress',
          projectIds: [projectId]
        }
      })
      
      const createData = await createResponse.json()
      const todoId = createData.todo.id

      // Get time logs
      const response = await request.get(`/api/todos/${todoId}/time`, {
        headers: {
          'Cookie': `session=${sessionId}`
        }
      })

      expect(response.status()).toBe(200)
      const data = await response.json()
      expect(data.timeLogs).toBeDefined()
      expect(Array.isArray(data.timeLogs)).toBe(true)
    })
  })

  test.describe('Error Handling', () => {
    test('should handle invalid session', async ({ request }) => {
      const response = await request.get('/api/auth/me', {
        headers: {
          'Cookie': 'session=invalid-session-id'
        }
      })

      expect(response.status()).toBe(401)
    })

    test('should handle missing required fields', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: {
          email: 'admin@example.com'
          // Missing password
        }
      })

      expect(response.status()).toBe(400)
    })

    test('should handle invalid project ID', async ({ request }) => {
      // Login first
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: 'admin@example.com',
          password: 'loKonoma!!!!!11111'
        }
      })
      
      const loginData = await loginResponse.json()
      const sessionId = loginData.session.id

      // Try to access non-existent project
      const response = await request.get('/api/projects/invalid-id', {
        headers: {
          'Cookie': `session=${sessionId}`
        }
      })

      expect(response.status()).toBe(404)
    })
  })
}) 