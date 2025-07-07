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

KM Todo is designed to be deployed using Docker containers for easy deployment and management. Here are the recommended deployment methods:

#### Method 1: Docker Compose (Recommended)

1. **Clone the repository on your server:**
   ```bash
   git clone <repository-url>
   cd km-todo
   ```

2. **Set up environment variables:**
   ```bash
   cp sample.env .env.production
   nano .env.production
   ```
   
   Update the production environment:
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://postgres:postgres@db:5432/km_todo
   DB_PORT=5432
   DB_E2E_PORT=5433
   ```

3. **Build and start with Docker Compose:**
   ```bash
   # Build the application
   npm run build:prod
   
   # Start all services (app + database)
   docker-compose up -d
   ```

4. **Seed the database (first time only):**
   ```bash
   docker-compose exec app npm run db:seed
   ```

5. **Access your application:**
   - Visit `http://your-server-ip:3000`
   - Login with admin credentials: `admin@example.com` / `kmToDo1!1!`

#### Method 2: Manual Docker Deployment

1. **Build the Docker image:**
   ```bash
   docker build -t km-todo .
   ```

2. **Start PostgreSQL container:**
   ```bash
   docker run -d \
     --name km-todo-db \
     -e POSTGRES_DB=km_todo \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -p 5432:5432 \
     postgres:15
   ```

3. **Start the application container:**
   ```bash
   docker run -d \
     --name km-todo-app \
     --link km-todo-db:db \
     -e NODE_ENV=production \
     -e DATABASE_URL=postgresql://postgres:postgres@db:5432/km_todo \
     -p 3000:3000 \
     km-todo
   ```

4. **Seed the database:**
   ```bash
   docker exec km-todo-app npm run db:seed
   ```

#### Method 3: Cloud Platform Deployment

**Deploy to Vercel:**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

**Deploy to Railway:**
1. Connect your GitHub repository to Railway
2. Add PostgreSQL service
3. Set environment variables
4. Deploy automatically

**Deploy to DigitalOcean App Platform:**
1. Connect your GitHub repository
2. Add PostgreSQL database service
3. Configure environment variables
4. Deploy with automatic scaling

### Production Environment Setup

#### Environment Variables for Production

Create a `.env.production` file with these settings:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@db:5432/km_todo
DB_PORT=5432
DB_E2E_PORT=5433
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.com
```

#### Security Considerations

- **Change default passwords**: Update admin password after first login
- **Use strong secrets**: Generate strong NEXTAUTH_SECRET
- **Enable HTTPS**: Use SSL certificates for production
- **Database security**: Use strong database passwords
- **Firewall**: Configure firewall to allow only necessary ports
- **Regular updates**: Keep system and dependencies updated

#### Firewall Configuration (UFW)

For Ubuntu/Debian servers, configure UFW to secure your deployment:

1. **Install UFW (if not already installed):**
   ```bash
   sudo apt update
   sudo apt install ufw
   ```

2. **Set default policies:**
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   ```

3. **Allow SSH access (important - do this first):**
   ```bash
   sudo ufw allow ssh
   # or if using custom SSH port
   sudo ufw allow 22
   ```

4. **Allow application port:**
   ```bash
   sudo ufw allow 3000
   ```

5. **Allow HTTP/HTTPS (if using reverse proxy):**
   ```bash
   sudo ufw allow 80
   sudo ufw allow 443
   ```

6. **Enable UFW:**
   ```bash
   sudo ufw enable
   ```

7. **Check UFW status:**
   ```bash
   sudo ufw status verbose
   ```

**Important Notes:**
- Always allow SSH before enabling UFW to avoid locking yourself out
- If using Docker, UFW may not block Docker containers by default
- For Docker deployments, consider using `iptables` rules or Docker's built-in networking
- Regularly review and update firewall rules as needed

#### Monitoring and Maintenance

**View logs:**
```bash
# Docker Compose logs
docker-compose logs -f app
docker-compose logs -f db

# Individual container logs
docker logs km-todo-app
docker logs km-todo-db
```

**Restart services:**
```bash
# Docker Compose
docker-compose restart

# Individual containers
docker restart km-todo-app
docker restart km-todo-db
```

**Update application:**
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
npm run build:prod
docker-compose down
docker-compose up -d --build
```

### Reverse Proxy Setup (Optional)

For production deployments, you may want to set up a reverse proxy (Nginx/Apache) to handle SSL termination and serve static files efficiently.

**Nginx configuration example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Troubleshooting

**Common issues and solutions:**

1. **Database connection failed:**
   - Check if PostgreSQL container is running: `docker ps`
   - Verify DATABASE_URL in environment variables
   - Check database logs: `docker logs km-todo-db`

2. **Application won't start:**
   - Check application logs: `docker logs km-todo-app`
   - Verify all environment variables are set
   - Ensure port 3000 is available

3. **Build failures:**
   - Clear Docker cache: `docker system prune -a`
   - Check for syntax errors: `npm run lint`
   - Verify all dependencies are installed

4. **Performance issues:**
   - Monitor resource usage: `docker stats`
   - Check database performance
   - Consider adding caching layer (Redis)

For more detailed deployment guides, see the project documentation in the `ai/` directory.

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

### sample.env File
A `sample.env` file is provided as a template for environment configuration. Copy or rename this file to `.env` (for development) or `.env.production` (for production) and update the values as needed:

```bash
cp sample.env .env
# or for production
cp sample.env .env.production
```

This ensures all required variables are set for your environment.

### Port Configuration
The application uses environment variables for all port configurations to avoid conflicts:

- **`PORT`**: Application server port (default: 3000)
- **`DB_PORT`**: Main database port (default: 5432)
- **`DB_E2E_PORT`**: E2E test database port (default: 5433)

### Environment Files

- **Local development (`.env`):**
  ```env
  NODE_ENV=development
  PORT=3000
  DATABASE_URL=postgresql://postgres:postgres@localhost:5432/km_todo
  DB_PORT=5432
  DB_E2E_PORT=5433
  ```

- **Production (`.env.production` or Docker Compose env):**
  ```env
  NODE_ENV=production
  PORT=3000
  DATABASE_URL=postgres://postgres:postgres@db:5432/km_todo
  DB_PORT=5432
  DB_E2E_PORT=5433
  ```

### Custom Port Configuration
To use different ports, set the environment variables:

```bash
# Example: Use different ports
export PORT=8080
export DB_PORT=5434
export DB_E2E_PORT=5435

# Or create a .env file with custom ports
echo "PORT=8080" > .env
echo "DB_PORT=5434" >> .env
echo "DB_E2E_PORT=5435" >> .env
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