# API Contract - KM Todo Multi-User Application

*This is the living contract between frontend and backend teams. All changes, migrations, and compliance issues must be logged in ProjectStatusBoard.md.*

## Data Models

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}
```

### Project
```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  members: ProjectMember[];
}
```

### ProjectMember
```typescript
interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  permissions: string[]; // Array of permission strings
  joinedAt: string;
  user: User; // Populated when fetching project members
}
```

### Todo
```typescript
interface Todo {
  id: string;
  title: string;
  description?: string; // Markdown supported
  dueDate?: string; // ISO 8601 date string
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedTime?: number; // Minutes
  createdBy: string; // User ID
  assignedTo?: string; // User ID
  createdAt: string;
  updatedAt: string;
  projects: TodoProject[]; // Many-to-many relationship
  timeLogs: TodoTime[];
  recurringPattern?: RecurringPattern;
}
```

### TodoProject (Many-to-Many)
```typescript
interface TodoProject {
  id: string;
  todoId: string;
  projectId: string;
  project: Project; // Populated when fetching todos
}
```

### TodoTime
```typescript
interface TodoTime {
  id: string;
  todoId: string;
  userId: string;
  timeSpent: number; // Minutes
  date: string; // ISO 8601 date string
  notes?: string;
  createdAt: string;
  user: User; // Populated when fetching time logs
}
```

### RecurringPattern
```typescript
interface RecurringPattern {
  id: string;
  todoId: string;
  patternType: 'daily' | 'weekly' | 'monthly' | 'custom';
  patternData: {
    interval?: number; // Every X days/weeks/months
    dayOfWeek?: number[]; // 0-6 (Sunday-Saturday)
    dayOfMonth?: number[]; // 1-31
    weekOfMonth?: number[]; // 1-5 (first-fifth week)
    customRule?: string; // For complex patterns like "every 2nd Thursday"
  };
  nextDueDate: string; // ISO 8601 date string
  isActive: boolean;
}
```

### ProjectMessage
```typescript
interface ProjectMessage {
  id: string;
  projectId: string;
  userId: string;
  message: string;
  todoReferences: string[]; // Array of todo IDs referenced
  createdAt: string;
  user: User; // Populated when fetching messages
}
```

### SystemConfig
```typescript
interface SystemConfig {
  id: string;
  key: string;
  value: string;
  createdAt: string; // ISO 8601 date string
}
```

## Setup Endpoints (First-Run Initialization)

### GET /api/setup/status
**Request:** None

**Response:**
```typescript
{
  needsSetup: boolean;
  message?: string; // Optional message explaining setup status
}
```

**Error Responses:**
- `500` - Database connection error

### POST /api/setup/initialize
**Request:**
```typescript
{
  email: string;
  password: string;
  name: string;
}
```

**Response:**
```typescript
{
  user: User;
  message: string; // Success message
}
```

**Error Responses:**
- `400` - Invalid input data (weak password, invalid email)
- `409` - Setup already completed
- `500` - Database error during setup

## Authentication Endpoints

### POST /api/auth/register
**Request:**
```typescript
{
  email: string;
  password: string;
  name: string;
}
```

**Response:**
```typescript
{
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: string;
  };
}
```

**Error Responses:**
- `400` - Invalid input data
- `409` - Email already exists

### POST /api/auth/login
**Request:**
```typescript
{
  email: string;
  password: string;
  rememberMe?: boolean; // If true, session lasts 30 days; otherwise, session expires on browser close
}
```

**Response:**
```typescript
{
  user: User;
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    persistent: boolean; // true if rememberMe was set, false otherwise
  };
}
```

**Error Responses:**
- `400` - Invalid credentials
- `401` - Authentication failed

### POST /api/auth/logout
**Request:** None (uses session cookie)

**Response:**
```typescript
{
  success: boolean;
}
```

### GET /api/auth/me
**Request:** None (uses session cookie)

**Response:**
```typescript
{
  user: User;
}
```

**Error Responses:**
- `401` - Not authenticated

## Project Endpoints

### GET /api/projects
**Query Parameters:**
- `includeArchived?: boolean` - Include archived projects (default: false)

**Response:**
```typescript
{
  projects: Project[];
  totalCount: number;
}
```

### POST /api/projects
**Request:**
```typescript
{
  name: string;
  description?: string;
}
```

**Response:**
```typescript
{
  project: Project;
}
```

### GET /api/projects/[id]
**Response:**
```typescript
{
  project: Project;
  todos: Todo[];
  messages: ProjectMessage[];
}
```

**Error Responses:**
- `403` - No access to project
- `404` - Project not found

### PUT /api/projects/[id]
**Request:**
```typescript
{
  name?: string;
  description?: string;
}
```

**Response:**
```typescript
{
  project: Project;
}
```

**Error Responses:**
- `403` - No permission to edit
- `404` - Project not found

### DELETE /api/projects/[id]
**Request:** None

**Response:**
```typescript
{
  success: boolean;
}
```

**Error Responses:**
- `403` - No permission to delete
- `404` - Project not found

### POST /api/projects/[id]/members
**Request:**
```typescript
{
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  permissions?: string[];
}
```

**Response:**
```typescript
{
  member: ProjectMember;
}
```

### PUT /api/projects/[id]/members/[userId]
**Request:**
```typescript
{
  role?: 'admin' | 'editor' | 'viewer';
  permissions?: string[];
}
```

**Response:**
```typescript
{
  member: ProjectMember;
}
```

### DELETE /api/projects/[id]/members/[userId]
**Request:** None

**Response:**
```typescript
{
  success: boolean;
}
```

## Todo Endpoints

### GET /api/todos
**Query Parameters:**
- `projectId?: string` - Filter by project
- `status?: string` - Filter by status
- `priority?: string` - Filter by priority
- `assignedTo?: string` - Filter by assignee
- `dueDateFrom?: string` - Filter by due date range
- `dueDateTo?: string` - Filter by due date range
- `search?: string` - Search in title and description
- `page?: number` - Pagination (default: 1)
- `limit?: number` - Items per page (default: 20)

**Response:**
```typescript
{
  todos: Todo[];
  totalCount: number;
  page: number;
  totalPages: number;
}
```

### POST /api/todos
**Request:**
```typescript
{
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedTime?: number;
  assignedTo?: string;
  projectIds: string[]; // Array of project IDs
  recurringPattern?: {
    patternType: 'daily' | 'weekly' | 'monthly' | 'custom';
    patternData: {
      interval?: number;
      dayOfWeek?: number[];
      dayOfMonth?: number[];
      weekOfMonth?: number[];
      customRule?: string;
    };
  };
}
```

**Response:**
```typescript
{
  todo: Todo;
}
```

### GET /api/todos/[id]
**Response:**
```typescript
{
  todo: Todo;
}
```

**Error Responses:**
- `403` - No access to todo
- `404` - Todo not found

### PUT /api/todos/[id]
**Request:**
```typescript
{
  title?: string;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  estimatedTime?: number;
  assignedTo?: string;
  projectIds?: string[];
}
```

**Response:**
```typescript
{
  todo: Todo;
}
```

### DELETE /api/todos/[id]
**Request:** None

**Response:**
```typescript
{
  success: boolean;
}
```

### POST /api/todos/[id]/time
**Request:**
```typescript
{
  timeSpent: number; // Minutes
  date: string; // ISO 8601 date string
  notes?: string;
}
```

**Response:**
```typescript
{
  timeLog: TodoTime;
}
```

### GET /api/todos/[id]/time
**Response:**
```typescript
{
  timeLogs: TodoTime[];
  totalTime: number; // Total minutes spent
}
```

## Analytics Endpoints

### GET /api/analytics/completion-rates
**Query Parameters:**
- `projectId?: string` - Filter by project
- `dateFrom?: string` - Start date for analysis
- `dateTo?: string` - End date for analysis

**Response:**
```typescript
{
  completionRate: number; // Percentage
  totalTodos: number;
  completedTodos: number;
  onTimeCompletionRate: number; // Percentage
  overdueTodos: number;
  byStatus: {
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}
```

### GET /api/analytics/time-tracking
**Query Parameters:**
- `projectId?: string` - Filter by project
- `dateFrom?: string` - Start date for analysis
- `dateTo?: string` - End date for analysis

**Response:**
```typescript
{
  totalTimeSpent: number; // Minutes
  totalEstimatedTime: number; // Minutes
  timeAccuracy: number; // Percentage (actual vs estimated)
  averageTimePerTodo: number; // Minutes
  byProject: {
    projectId: string;
    projectName: string;
    timeSpent: number;
    estimatedTime: number;
  }[];
  byUser: {
    userId: string;
    userName: string;
    timeSpent: number;
    estimatedTime: number;
  }[];
}
```

### GET /api/analytics/project-activity
**Query Parameters:**
- `dateFrom?: string` - Start date for analysis
- `dateTo?: string` - End date for analysis

**Response:**
```typescript
{
  activeProjects: number;
  totalProjects: number;
  projectActivity: {
    projectId: string;
    projectName: string;
    todosCreated: number;
    todosCompleted: number;
    activeMembers: number;
    lastActivity: string;
  }[];
  memberActivity: {
    userId: string;
    userName: string;
    projectsParticipated: number;
    todosCreated: number;
    todosCompleted: number;
  }[];
}
```

## Search Endpoints

### GET /api/search
**Query Parameters:**
- `q: string` - Search query
- `type?: 'todos' | 'projects' | 'all'` - Search type (default: 'all')
- `projectId?: string` - Limit search to specific project
- `page?: number` - Pagination (default: 1)
- `limit?: number` - Items per page (default: 20)

**Response:**
```typescript
{
  todos: Todo[];
  projects: Project[];
  totalCount: number;
  page: number;
  totalPages: number;
}
```

## Error Response Format

All error responses follow this format:
```typescript
{
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## Common Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (no permission)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `422` - Validation Error
- `500` - Internal Server Error

## Authentication

All endpoints except `/api/auth/register` and `/api/auth/login` require authentication via session cookie.

## Pagination

All list endpoints support pagination with `page` and `limit` query parameters. Responses include `totalCount`, `page`, and `totalPages` for pagination controls.

## Date Format

All dates are in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

## Time Format

All time values are in minutes (integers).

---

*This contract is maintained by the AI Project Manager (AIPM) agent. All changes must be logged in ProjectStatusBoard.md.* 