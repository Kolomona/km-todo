# AI Agent Full-Stack Development Guide - Appendices

*This file contains detailed appendices, examples, and extended content referenced by the main guide.*

> **Note for Human Readers**: Throughout this document, `@` symbols are used before filename references (e.g., `@API_CONTRACT.md`) to help AI agents better understand file relationships and importance. These `@` symbols are **not part of the actual filenames** - they are only used in this documentation for AI interpretability. Actual filenames do not have `@` prefixes.

---

## Appendix A: Detailed Examples

### A.1: Complete Recipe Manager Example

#### Step 1: Create @ProductVision.md
```markdown
# @ProductVision.md - Recipe Manager

## 1. Overview
A web app for storing and managing cooking recipes.

## 2. Market Analysis
- Review of existing solutions, gaps, and opportunities

## 3. User Stories
- As a user, I can create new recipes
- As a user, I can view my recipe list
- As a user, I can edit existing recipes
- As a user, I can delete recipes

## 4. Features
- Recipe CRUD (Create, Read, Update, Delete)
- Ingredient management
- Recipe search and filtering
- Responsive design

## 5. Technical Requirements
- Frontend: SvelteKit
- Backend: Node.js with SvelteKit
- Database: SQLite
- Authentication: Session-based
- E2E Testing: Playwright, with test data seeding/reset

## 6. Data Models
- Recipe: id, name, description, ingredients, created_at
- Ingredient: id, name, unit, cost_per_unit
- User: id, name, email, password_hash

## 7. API Endpoints
- POST /api/auth/login
- GET /api/recipes
- POST /api/recipes
- PUT /api/recipes/:id
- DELETE /api/recipes/:id
- GET /api/ingredients
- POST /api/ingredients
```

#### Step 2: Generated @API_CONTRACT.md
```markdown
# @API_CONTRACT.md

## Authentication Endpoints
- **POST /api/auth/login**
  - Request: `{ email: string, password: string }`
  - Response: `{ user: User, session: Session }`

## Data Endpoints
- **GET /api/recipes**
  - Request: None
  - Response: `Recipe[]`

## Data Models
```typescript
interface Recipe {
  id: number;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  createdAt: string; // camelCase enforced
}
```

## Svelte Stores
- **recipes**: `WritableStore<Recipe[]>` - Recipe data
- **user**: `WritableStore<User | null>` - Current user

## Example Payloads
```json
{
  "name": "Chocolate Cake",
  "description": "Rich chocolate cake",
  "ingredients": [
    { "name": "Flour", "quantity": 2, "unit": "cups" }
  ]
}
```
```

#### Step 3: Backend Implementation
```typescript
// Example backend endpoint implementation
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Validate input
    if (!email || !password) {
      return Response.json({ error: 'Email and password required' }, { status: 400 });
    }
    
    // Authenticate user
    const user = await authenticateUser(email, password);
    if (!user) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Create session
    const session = await createSession(user.id);
    
    return Response.json({ user, session });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### Step 4: Frontend Implementation
```typescript
// Example frontend component
export default function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRecipes();
  }, []);
  
  const fetchRecipes = async () => {
    try {
      const response = await fetch('/api/recipes');
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {recipes.map(recipe => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  );
}
```

#### Step 5: Integration Testing
```typescript
// Example E2E test
test('user can register, login, and create a recipe', async ({ page }) => {
  // 1. Register
  await page.goto('/register');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="register-button"]');
  
  // 2. Login
  await page.goto('/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  // 3. Create recipe
  await page.click('[data-testid="create-recipe"]');
  await page.fill('[data-testid="recipe-title"]', 'Test Recipe');
  await page.click('[data-testid="save-recipe"]');
  
  // 4. Verify
  await expect(page.locator('[data-testid="recipe-list"]')).toContainText('Test Recipe');
});
```

### A.2: Advanced Testing Examples

#### Unit Test Examples
```typescript
// Backend unit test
describe('User Registration', () => {
  it('should create new user with valid data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe('test@example.com');
  });

  it('should reject duplicate email', async () => {
    // Test duplicate email handling
    const response1 = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    
    const response2 = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password456',
        name: 'Another User'
      });
    
    expect(response2.status).toBe(400);
    expect(response2.body.error).toContain('Email already exists');
  });
});

// Frontend unit test
describe('LoginForm', () => {
  it('should show error for invalid email', async () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });
  
  it('should submit form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

#### Integration Test Examples
```typescript
// API integration test
describe('Recipe API Integration', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Login and get auth token
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    authToken = loginResponse.body.session.token;
  });
  
  it('should create and retrieve recipe', async () => {
    // Create recipe
    const createResponse = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        name: 'Test Recipe',
        description: 'A test recipe',
        ingredients: [
          { name: 'Flour', quantity: 2, unit: 'cups' }
        ]
      });
    
    expect(createResponse.status).toBe(200);
    const recipeId = createResponse.body.recipe.id;
    
    // Retrieve recipe
    const getResponse = await request(app)
      .get(`/api/recipes/${recipeId}`)
      .set('Authorization', `Bearer ${authToken}`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.recipe.name).toBe('Test Recipe');
  });
});
```

---

## Appendix B: Detailed Testing Strategy

### B.1: Testing Pyramid

```
        /\
       /  \     E2E Tests (10%)
      /____\    - Full user workflows
     /      \   - Browser automation
    /        \  - Integration validation
   /__________\ 
  /            \ Integration Tests (20%)
 /              \ - API endpoint testing
/________________\ - Component integration
\                / Unit Tests (70%)
 \              /  - Individual functions
  \            /   - Component behavior
   \          /    - Business logic
    \        /     - Data validation
     \      /      - Error handling
      \____/       - Edge cases
       \  /
        \/
```

### B.2: Testing Tools Setup

#### Vitest Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  }
});
```

#### Playwright Configuration
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

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
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### B.3: Test Data Management

#### Database Seeding
```typescript
// tests/utils/testData.ts
export const seedTestData = async () => {
  // Clear existing data
  await prisma.user.deleteMany();
  await prisma.recipe.deleteMany();
  
  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash: await hashPassword('password123'),
      name: 'Test User'
    }
  });
  
  // Create test recipes
  const recipes = await Promise.all([
    prisma.recipe.create({
      data: {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake',
        createdBy: user.id,
        ingredients: {
          create: [
            { name: 'Flour', quantity: 2, unit: 'cups' },
            { name: 'Sugar', quantity: 1, unit: 'cup' }
          ]
        }
      }
    }),
    prisma.recipe.create({
      data: {
        name: 'Pizza',
        description: 'Homemade pizza',
        createdBy: user.id,
        ingredients: {
          create: [
            { name: 'Dough', quantity: 1, unit: 'ball' },
            { name: 'Cheese', quantity: 8, unit: 'oz' }
          ]
        }
      }
    })
  ]);
  
  return { user, recipes };
};
```

#### Test Utilities
```typescript
// tests/utils/testHelpers.ts
export const createTestUser = async () => {
  return await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      passwordHash: await hashPassword('password123'),
      name: 'Test User'
    }
  });
};

export const createTestRecipe = async (userId: string) => {
  return await prisma.recipe.create({
    data: {
      name: 'Test Recipe',
      description: 'A test recipe',
      createdBy: userId
    }
  });
};

export const cleanupTestData = async () => {
  await prisma.recipe.deleteMany();
  await prisma.user.deleteMany();
};
```

---

## Appendix C: Simple Git Workflow

### C.1: Basic Git Commands

```bash
# Start work
git status
git pull origin main

# Make changes
git add .
git commit -m "feat(backend): implement user authentication"
git push origin main

# Update status files
# Log in @ProjectStatusBoard.md
```

### C.2: Commit Message Examples

```bash
# Backend features
git commit -m "[Backend] feat: implement user authentication"
git commit -m "[Backend] fix: resolve login validation issue"

# Frontend features
git commit -m "[Frontend] feat: add login form component"
git commit -m "[Frontend] fix: resolve mobile responsive issues"

# Contract changes
git commit -m "[AIPM] docs: update API endpoints"
git commit -m "[AIPM] feat: add new user profile fields"

# Integration work
git commit -m "[AIPM] fix: resolve login flow issues"
git commit -m "[AIPM] test: add E2E tests for auth flow"
```

### C.3: Status File Integration

**Update @BackEndStatus.md:**
```markdown
## 2024-12-19
- **Last Commit**: [Backend] feat: implement user authentication
- **Testing**: Unit tests 15/15 passing
- **Progress**: Authentication endpoints complete
```

**Update @FrontEndStatus.md:**
```markdown
## 2024-12-19
- **Last Commit**: [Frontend] feat: add login form component
- **Testing**: Unit tests 12/12 passing
- **Progress**: Login UI complete
```

**Update @ProjectStatusBoard.md:**
```markdown
## Recent Decisions (Last 5)
- [2024-12-19] Backend: User authentication implemented
- [2024-12-19] Frontend: Login form component added
```

---

## Appendix D: Performance Optimization

### D.1: Frontend Optimization

#### Code Splitting
```typescript
// Lazy load components
const RecipeDetail = lazy(() => import('./components/RecipeDetail'));
const Analytics = lazy(() => import('./components/Analytics'));

// Route-based code splitting
const routes = [
  {
    path: '/recipes/:id',
    component: lazy(() => import('./pages/RecipeDetail'))
  },
  {
    path: '/analytics',
    component: lazy(() => import('./pages/Analytics'))
  }
];
```

#### Image Optimization
```typescript
// Next.js Image component
import Image from 'next/image';

export default function RecipeCard({ recipe }) {
  return (
    <div>
      <Image
        src={recipe.image}
        alt={recipe.name}
        width={300}
        height={200}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,..."
      />
    </div>
  );
}
```

### D.2: Backend Optimization

#### Database Query Optimization
```typescript
// Efficient query with proper relations
const recipes = await prisma.recipe.findMany({
  where: {
    createdBy: userId,
    status: 'ACTIVE'
  },
  include: {
    ingredients: {
      select: {
        name: true,
        quantity: true,
        unit: true
      }
    },
    _count: {
      select: {
        ingredients: true
      }
    }
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: 20,
  skip: (page - 1) * 20
});
```

#### Caching Strategy
```typescript
// Redis caching example
import { redis } from '../lib/redis';

export async function getRecipe(id: string) {
  // Check cache first
  const cached = await redis.get(`recipe:${id}`);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    include: { ingredients: true }
  });
  
  if (recipe) {
    // Cache for 1 hour
    await redis.setex(`recipe:${id}`, 3600, JSON.stringify(recipe));
  }
  
  return recipe;
}
```

---

## Appendix E: Security Best Practices

### E.1: Authentication Security

#### Password Hashing
```typescript
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

#### JWT Token Management
```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '24h';

export function generateToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}
```

### E.2: Input Validation

#### Schema Validation
```typescript
import { z } from 'zod';

const createRecipeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  ingredients: z.array(z.object({
    name: z.string().min(1).max(50),
    quantity: z.number().positive(),
    unit: z.string().min(1).max(20)
  })).min(1)
});

export function validateCreateRecipe(data: any) {
  return createRecipeSchema.parse(data);
}
```

#### SQL Injection Prevention
```typescript
// Use parameterized queries (Prisma handles this automatically)
const user = await prisma.user.findUnique({
  where: { email: userEmail } // Safe from SQL injection
});

// Don't do this (vulnerable to SQL injection)
// const user = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userEmail}`;
```

---

## Appendix F: Deployment Strategies

### F.1: Docker Configuration

#### Dockerfile
```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - NEXTAUTH_SECRET=your-secret-key
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### F.2: Environment Configuration

#### Environment Variables
```bash
# .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/myapp"
NEXTAUTH_SECRET="your-super-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Production
NODE_ENV="production"
PORT="3000"
HOSTNAME="0.0.0.0"
```

#### Environment Validation
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  HOSTNAME: z.string()
});

export const env = envSchema.parse(process.env);
```

---

*This appendices file contains detailed examples, configurations, and advanced topics referenced by the main guide. For the streamlined guide, see [@AI_AGENT_FULLSTACK_GUIDE-v4.md](./AI_AGENT_FULLSTACK_GUIDE-v4.md).* 