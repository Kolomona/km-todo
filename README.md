# KM Todo: Multi-User Todo App with Project Organization

## 🚀 Overview

**KM Todo** is a free and open-source (FLOSS) multi-user todo application designed for individuals and small teams to organize tasks within a flexible, folder-based project structure. Built for simplicity and productivity, it features:

- **Project-based organization**: Group todos into projects (folders)
- **Rich todo data**: Title, description (Markdown), due date, priority, status, tags
- **Recurring todos**: Standard and custom patterns (e.g., "every 2nd Thursday")
- **Time tracking**: Log and estimate time spent on tasks
- **Multi-project support**: Assign todos to multiple projects
- **Collaboration**: Share projects, assign todos, manage permissions
- **Analytics**: Completion rates, time accuracy, project activity
- **Search & filtering**: Powerful search and filter capabilities
- **Responsive & accessible**: Mobile-first, WCAG 2.1 AA compliant

See [ai/ProductVision.md](ai/ProductVision.md) for the full product vision and feature set.

---

## 🤖 How This Project Is Built: AI Agent Full-Stack Methodology

KM Todo is not just a todo app—it's a demonstration of a **next-generation, contract-driven, multi-agent AI development workflow**. This project is built using the principles in [ai/AI_AGENT_FULLSTACK_GUIDE-v2.md](ai/AI_AGENT_FULLSTACK_GUIDE-v2.md):

- **Contract-Driven Development**: All features, endpoints, and data models are defined in a living contract ([ai/API_CONTRACT.md](ai/API_CONTRACT.md)), which is the single source of truth for both frontend and backend teams.
- **AI Agent Teams**: The project is developed by specialized AI agents:
  - **Backend AI Agent**: Implements APIs, database, and backend logic
  - **Frontend AI Agent**: Builds the UI, client logic, and user experience
  - **AIPM (AI Project Manager) Agent**: Coordinates all work, maintains the project board, and enforces communication and integration standards
- **Structured Communication**: All major issues, blockers, and decisions are logged in [ai/ProjectStatusBoard.md](ai/ProjectStatusBoard.md) using a strict markdown format, curated by the AIPM agent.
- **Comprehensive Testing**: Testing is guided by [ai/TestingStrategy.md](ai/TestingStrategy.md), ensuring contract compliance, integration, and quality.
- **Transparent Progress**: Each team logs progress in their status file ([ai/FrontEndStatus.md](ai/FrontEndStatus.md), [ai/BackEndStatus.md](ai/BackEndStatus.md)).

**Why is this innovative?**
- Prevents integration issues and contract drift
- Enables parallel, specialized AI development
- Ensures production-grade quality and maintainability
- Provides a real-world example of AI agents collaborating on a complex project

For more on this methodology, see [ai/AI_AGENT_FULLSTACK_GUIDE-v2.md](ai/AI_AGENT_FULLSTACK_GUIDE-v2.md).

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- Git

### Local Development

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd km-todo
   npm install
   ```

2. **Start the Postgres database:**
   ```bash
   npm run db:up
   ```

3. **Seed the database with initial data:**
   ```bash
   npm run db:seed
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   This will:
   - Ensure the database is running
   - Wait for Postgres to be ready
   - Start Next.js in development mode (with hot reload)

5. **Open your browser:**
   [http://localhost:3000](http://localhost:3000)

**Default login credentials:**
- Email: `admin@example.com`
- Password: `kmToDo1!1!`

### Production Deployment

1. **Build the production version:**
   ```bash
   npm run build:prod
   ```

2. **Start production server:**
   ```bash
   npm run start:prod
   ```
   This will:
   - Start the database
   - Wait for database connection
   - Seed the database
   - Start the Next.js production server

3. **Or use the complete deployment script:**
   ```bash
   npm run deploy
   ```

---

## 📋 Available Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run db:up` - Start Postgres database
- `npm run db:down` - Stop database
- `npm run db:seed` - Seed database with initial data

### Production
- `npm run build:prod` - Build production version
- `npm run start:prod` - Start production server with database setup
- `npm run deploy` - Complete deployment (build + start)

### Testing
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:prod` - Build and test production version
- `npm run test:e2e` - Run E2E tests (requires Playwright setup)
- `npm run test:e2e:ui` - Run E2E tests in interactive mode
- `npm run test:e2e:install` - Install Playwright browsers

### Database
- `npm run db:e2e:up` - Start E2E test database
- `npm run db:e2e:down` - Stop E2E test database

### Utilities
- `npm run lint` - Run ESLint
- `npm run build` - Build application (alias for build:prod)

---

## ⚙️ Environment Variables

- **Local development (`.env`):**
  ```env
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/km_todo
  NODE_ENV=development
  ```
- **Production (`.env.production` or Docker Compose env):**
  ```env
  DATABASE_URL=postgres://postgres:postgres@db:5432/km_todo
  NODE_ENV=production
  ```

---

## 📦 Project Structure

- `ai/` — All project management, contract, and status files (see below)
- `src/` — Application source code (Next.js app, API routes, components)
- `prisma/` — Prisma schema and migrations
- `tests/` — Test files (unit, integration, E2E)
- `docker-compose.yml` — Defines app and database services
- `Dockerfile` — Builds the Next.js app for production
- `.env`, `.env.production` — Environment variables for dev and prod

**Key AI Agent Files:**
- `ai/API_CONTRACT.md` — Living contract for all endpoints and data models
- `ai/ProjectStatusBoard.md` — Ticketing, integration, and decision log (curated by AIPM)
- `ai/FrontEndStatus.md` / `ai/BackEndStatus.md` — Real progress logs for each team
- `ai/TestingStrategy.md` — Comprehensive testing guidelines
- `ai/AI_AGENT_FULLSTACK_GUIDE-v2.md` — Full-stack AI agent methodology

---

## 🧪 Testing

This project includes comprehensive testing at multiple levels:

### Unit Tests
- **Backend API tests**: Test all API endpoints and business logic
- **Frontend component tests**: Test React components and user interactions
- **Database tests**: Test Prisma models and database operations

### E2E Tests
- **User workflow tests**: Test complete user journeys
- **Cross-browser testing**: Chrome, Firefox, Safari
- **Mobile testing**: Responsive design verification

### Running Tests
```bash
# All tests
npm run test

# Unit tests only
npm run test:unit

# With coverage
npm run test:coverage

# E2E tests (requires setup)
npm run test:e2e:install
npm run test:e2e
```

See [tests/e2e/README.md](tests/e2e/README.md) for detailed E2E testing instructions.

---

## 🤝 Contributing & Extending

This project is a real-world example of AI agent collaboration. To contribute or extend:
- **Follow the contract-driven workflow**: Propose changes in `ai/API_CONTRACT.md` and log all major issues in `ai/ProjectStatusBoard.md`.
- **Use the status files**: Track your progress in `ai/FrontEndStatus.md` or `ai/BackEndStatus.md`.
- **Adopt the AI agent methodology**: See `ai/AI_AGENT_FULLSTACK_GUIDE-v2.md` for best practices.
- **Testing**: Follow `ai/TestingStrategy.md` for all new features and bug fixes.

---

## 📚 Learn More

- [Product Vision](ai/ProductVision.md)
- [AI Agent Full-Stack Guide](ai/AI_AGENT_FULLSTACK_GUIDE-v2.md)
- [API Contract](ai/API_CONTRACT.md)
- [Project Status Board](ai/ProjectStatusBoard.md)
- [Testing Strategy](ai/TestingStrategy.md)
- [E2E Testing Guide](tests/e2e/README.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Compose Docs](https://docs.docker.com/compose/)

---

*KM Todo is a living example of how AI agents, guided by clear contracts and project management, can build production-grade software collaboratively and transparently.*
