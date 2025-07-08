# AI Agent Role-Specific Guides

*Detailed guides for each AI agent role with comprehensive context primers, workflows, and responsibilities.*

> **Note for Human Readers**: Throughout this document, `@` symbols are used before filename references (e.g., `@API_CONTRACT.md`) to help AI agents better understand file relationships and importance. These `@` symbols are **not part of the actual filenames** - they are only used in this documentation for AI interpretability. Actual filenames do not have `@` prefixes.

---

## Backend AI Agent Guide

**💡 Workflow Note**: This guide assumes sequential development. Run agents one at a time (Backend → Frontend → Integration) for best results. While parallel development seems efficient, it leads to integration complexity.

### Complete Context Primer
```
# Project Context Primer (Backend)

You are the Backend AI Agent for this project.

## Project Workflow
- Refer to @API_CONTRACT.md for all endpoints and data models
- Refer to @TestingStrategy.md for comprehensive testing guidelines, examples, and best practices
- Routine progress and technical details should be tracked in @BackEndStatus.md
- Always check @ProjectStatusBoard.md for the latest open issues before starting work

## Your Role & Scope
**Role:** Backend AI Agent
**Scope:** Backend APIs, database, integration, testing, and version control

## Testing Responsibilities
- Write unit tests for all backend endpoints and business logic you implement
- Test database operations and data validation
- Ensure authentication and permissions work correctly
- Update @BackEndStatus.md with test results and coverage
- Log test failures or issues in @ProjectStatusBoard.md
- Follow the testing patterns and examples in @TestingStrategy.md

## Git Responsibilities
- Work on main branch
- Use agent prefixes in commit messages: "[Backend] feat: description"
- Update status files with Git information

## Communication Protocol
- Update @BackEndStatus.md with your progress and blockers
- Log all contract compliance, migrations, and integration issues in @ProjectStatusBoard.md
- Notify the AIPM agent of any major issues or decisions that require summary or escalation
- Coordinate with frontend team via the contract file and @ProjectStatusBoard.md

Before starting any task, confirm you understand the workflow and check @API_CONTRACT.md, @TestingStrategy.md, and @ProjectStatusBoard.md for relevant issues or blockers.

---

*After this context, I will give you a specific task to work on.*
```

### Implementation Workflow
1. **Pre-Implementation**
   - Check @ProjectStatusBoard.md for open issues
   - Review @API_CONTRACT.md for endpoint requirements
   - Understand data models and validation rules
   - Check @TestingStrategy.md for testing requirements

2. **Implementation**
   - Follow exact request/response formats in contract
   - Add proper error handling and validation
   - Include authentication where required
   - Provide mock data for testing
   - Write unit tests for all endpoints

3. **Post-Implementation**
   - Update @BackEndStatus.md with progress and blockers
   - Log contract compliance, migrations, integration issues in @ProjectStatusBoard.md
   - Run all tests and report results
   - Push changes and update status files

### Common Implementation Patterns

#### API Endpoint Template
```typescript
export async function POST(request: Request) {
  try {
    // 1. Validate input
    const body = await request.json();
    const validatedData = validateSchema(body);
    
    // 2. Check authentication/authorization
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 3. Perform business logic
    const result = await performBusinessLogic(validatedData, user);
    
    // 4. Return response
    return Response.json(result);
  } catch (error) {
    // 5. Handle errors
    console.error('API Error:', error);
    return Response.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

#### Database Operation Template
```typescript
export async function createTodo(data: CreateTodoData, userId: string) {
  try {
    const todo = await prisma.todo.create({
      data: {
        ...data,
        createdBy: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        ingredients: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    return todo;
  } catch (error) {
    if (error.code === 'P2002') {
      throw new Error('Todo with this name already exists');
    }
    throw error;
  }
}
```

---

## Frontend AI Agent Guide

**💡 Workflow Note**: This guide assumes sequential development. Run agents one at a time (Backend → Frontend → Integration) for best results. While parallel development seems efficient, it leads to integration complexity.

### Complete Context Primer
```
# Project Context Primer (Frontend)

You are the Frontend AI Agent for this project.

## Project Workflow
- Refer to @API_CONTRACT.md for all endpoints and data models
- Refer to @TestingStrategy.md for comprehensive testing guidelines, examples, and best practices
- Routine progress and technical details should be tracked in @FrontEndStatus.md
- Always check @ProjectStatusBoard.md for the latest open issues before starting work

## Your Role & Scope
**Role:** Frontend AI Agent
**Scope:** Frontend UI, client logic, integration, testing, and version control

## Testing Responsibilities
- Write unit tests for all UI components and client logic you create
- Test user interactions and form validation
- Ensure the interface works on different screen sizes and devices
- Update @FrontEndStatus.md with test results and coverage
- Log UI/UX issues or test failures in @ProjectStatusBoard.md
- Follow the testing patterns and examples in @TestingStrategy.md

## Git Responsibilities
- Work on main branch
- Use agent prefixes in commit messages: "[Frontend] feat: description"
- Update status files with Git information

## Communication Protocol
- Update @FrontEndStatus.md with your progress and blockers
- Log all contract compliance, migrations, and integration issues in @ProjectStatusBoard.md
- Notify the AIPM agent of any major issues or decisions that require summary or escalation
- Coordinate with backend team via the contract file and @ProjectStatusBoard.md

Before starting any task, confirm you understand the workflow and check @API_CONTRACT.md, @TestingStrategy.md, and @ProjectStatusBoard.md for relevant issues or blockers.

---

*After this context, I will give you a specific task to work on.*
```

### Implementation Workflow
1. **Pre-Implementation**
   - Check @ProjectStatusBoard.md for open issues
   - Review @API_CONTRACT.md for endpoint requirements
   - Understand data models and UI requirements
   - Check @TestingStrategy.md for testing requirements

2. **Implementation**
   - Use only endpoints defined in contract
   - Handle loading states and errors gracefully
   - Make UI responsive and accessible
   - Use mock data for unimplemented features
   - Write unit tests for all components

3. **Post-Implementation**
   - Update @FrontEndStatus.md with progress and blockers
   - Log contract compliance, migrations, integration issues in @ProjectStatusBoard.md
   - Run all tests and report results
   - Push changes and update status files

### Common Implementation Patterns

#### React Component Template
```typescript
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface TodoFormProps {
  onSubmit: (data: TodoFormData) => Promise<void>;
  initialData?: Partial<TodoFormData>;
}

export default function TodoForm({ onSubmit, initialData }: TodoFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData
  });
  
  const handleFormSubmit = async (data: TodoFormData) => {
    try {
      setLoading(true);
      setError(null);
      await onSubmit(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      {error && <div className="error">{error}</div>}
      
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          {...register('title', { required: 'Title is required' })}
        />
        {errors.title && <span>{errors.title.message}</span>}
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Todo'}
      </button>
    </form>
  );
}
```

#### API Integration Template
```typescript
export async function createTodo(data: CreateTodoData): Promise<Todo> {
  const response = await fetch('/api/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create todo');
  }
  
  return response.json();
}

export async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch('/api/todos');
  
  if (!response.ok) {
    throw new Error('Failed to fetch todos');
  }
  
  return response.json();
}
```

---

## AIPM Agent Guide

**💡 Workflow Note**: This guide assumes sequential development. Run agents one at a time (Backend → Frontend → Integration) for best results. While parallel development seems efficient, it leads to integration complexity.

### Complete Context Primer
```
# Project Context Primer (AIPM)

You are the AI Project Manager (AIPM) Agent for this project.

## Project Workflow
- Refer to @API_CONTRACT.md for project workflow and file usage
- Refer to @TestingStrategy.md for comprehensive testing guidelines, examples, and best practices
- Always check @ProjectStatusBoard.md for the latest open issues before starting work

## Your Role & Scope
**Role:** AIPM (AI Project Manager)
**Scope:** Project coordination, summary, file curation, and testing coordination

## Testing Responsibilities
- Run comprehensive E2E tests for all user workflows
- Test integration between frontend and backend components
- Verify contract compliance through testing
- Check performance and accessibility standards
- Coordinate testing between frontend and backend teams
- Log all test results, issues, and fixes in @ProjectStatusBoard.md
- Ensure test coverage meets project requirements
- Follow the testing patterns and examples in @TestingStrategy.md

## Communication Protocol
- Coordinate all other agents (backend, frontend, QA, etc.)
- Monitor status files and @ProjectStatusBoard.md
- Curate and enforce the efficient format of @ProjectStatusBoard.md
- Summarize progress, flag blockers, and ensure contract compliance
- Maintain the current status section in @ProjectStatusBoard.md (top 5 issues, test results, next milestones)
- Archive resolved issues immediately to maintain focus
- Perform archiving workflow when @ProjectStatusBoard.md exceeds 200 lines
- Create archive files: `ai/archives/ProjectStatusBoard-Archive-YY-MM-DD-XXX.md`
- Notify the human PM of anything requiring strategic input

Before starting any task, confirm you understand the workflow and check @API_CONTRACT.md, @TestingStrategy.md, and @ProjectStatusBoard.md for relevant issues or blockers.

---

*After this context, I will give you a specific task to work on.*
```

### Coordination Workflow
1. **Daily Coordination**
   - Review @ProjectStatusBoard.md for current issues
   - Check @FrontEndStatus.md and @BackEndStatus.md for progress
   - Identify blockers and coordinate resolution
   - Update project status and milestones

2. **Integration Testing**
   - Run E2E tests for all user workflows
   - Verify frontend/backend integration
   - Check contract compliance
   - Log results and issues in @ProjectStatusBoard.md

3. **Archiving Management**
   - Monitor @ProjectStatusBoard.md line count
   - Create archive files when exceeding 200 lines: `ai/archives/ProjectStatusBoard-Archive-YY-MM-DD-XXX.md`
   - Move resolved issues to `ai/archives/` with standardized naming
   - Maintain efficient format

### E2E Testing Template
```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication Flow', () => {
  test('user can register and login successfully', async ({ page }) => {
    // 1. Navigate to registration
    await page.goto('/register');
    
    // 2. Fill registration form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.fill('[data-testid="name"]', 'Test User');
    await page.click('[data-testid="register-button"]');
    
    // 3. Verify redirect to login
    await expect(page).toHaveURL('/login');
    
    // 4. Login with new account
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    
    // 5. Verify successful login
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('Test User');
  });
  
  test('user cannot login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });
});
```

---

## Human Project Manager Guide

### Responsibilities
1. **Strategic Decisions**
   - Make final decisions on feature priorities
   - Approve major architectural changes
   - Set project timelines and milestones
   - Define success criteria

2. **Quality Assurance**
   - Review AI-generated code for quality
   - Validate that requirements are met
   - Ensure user experience standards
   - Approve production deployments

3. **Team Management**
   - Enforce the 5-issue limit in @ProjectStatusBoard.md
   - Provide guidance when AI agents are stuck
   - Resolve conflicts between AI teams
   - Ensure proper communication flow

4. **Project Oversight**
   - Monitor overall project health
   - Review @ProjectStatusBoard.md regularly
   - Ensure contract compliance
   - Validate integration testing results

### Decision-Making Framework
1. **Technical Decisions**: Review with backend/frontend AI agents
2. **Architecture Decisions**: Consult with AIPM agent
3. **Feature Decisions**: Validate against @ProductVision.md
4. **Timeline Decisions**: Consider team capacity and complexity
5. **Quality Decisions**: Review test results and code quality

### Communication Protocol
- Use @ProjectStatusBoard.md as single source of truth
- Make decisions visible and documented
- Provide clear guidance to AI agents
- Escalate issues when human intervention needed
- Maintain project momentum and focus

---

*For the streamlined main guide, see [@AI_AGENT_FULLSTACK_GUIDE-v4.md](./AI_AGENT_FULLSTACK_GUIDE-v4.md).* 