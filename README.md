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

### DigitalOcean Droplet Deployment with Apache Reverse Proxy

This guide shows how to deploy KM Todo to a DigitalOcean droplet using Apache as a reverse proxy.

#### Prerequisites
- A DigitalOcean account
- A droplet with Ubuntu 22.04 LTS
- Domain name (optional but recommended)

#### Step 1: Create and Configure Droplet

1. **Create a new droplet:**
   - Choose Ubuntu 22.04 LTS
   - Select plan (minimum 1GB RAM, 1 vCPU)
   - Choose datacenter region
   - Add SSH key or create password
   - Create droplet

2. **Connect to your droplet:**
   ```bash
   ssh root@your-droplet-ip
   ```

3. **Create a non-root user:**
   ```bash
   adduser kmtodo
   usermod -aG sudo kmtodo
   su - kmtodo
   ```

#### Step 2: Install Dependencies

1. **Update system and install Node.js:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install Docker and Docker Compose:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo usermod -aG docker $USER
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

3. **Install Apache:**
   ```bash
   sudo apt install apache2 -y
   sudo a2enmod proxy
   sudo a2enmod proxy_http
   sudo a2enmod ssl
   sudo a2enmod rewrite
   ```

#### Step 3: Deploy the Application

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/km-todo.git
   cd km-todo
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.production
   nano .env.production
   ```
   
   Update the production environment:
   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/km_todo
   DB_PORT=5432
   DB_E2E_PORT=5433
   ```

4. **Build and start the application:**
   ```bash
   npm run build:prod
   npm run start:prod
   ```

#### Step 4: Configure Apache Reverse Proxy

1. **Create Apache virtual host configuration:**
   ```bash
   sudo nano /etc/apache2/sites-available/km-todo.conf
   ```

2. **Add the following configuration:**
   ```apache
   <VirtualHost *:80>
       ServerName your-domain.com
       ServerAlias www.your-domain.com
       
       ProxyPreserveHost On
       ProxyPass / http://localhost:${PORT:-3000}/
       ProxyPassReverse / http://localhost:${PORT:-3000}/
       
       ErrorLog ${APACHE_LOG_DIR}/km-todo_error.log
       CustomLog ${APACHE_LOG_DIR}/km-todo_access.log combined
   </VirtualHost>
   ```

3. **Enable the site and restart Apache:**
   ```bash
   sudo a2ensite km-todo.conf
   sudo systemctl restart apache2
   ```

#### Step 5: Set Up SSL (Optional but Recommended)

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-apache -y
   ```

2. **Obtain SSL certificate:**
   ```bash
   sudo certbot --apache -d your-domain.com -d www.your-domain.com
   ```

3. **Set up auto-renewal:**
   ```bash
   sudo crontab -e
   ```
   Add this line:
   ```
   0 12 * * * /usr/bin/certbot renew --quiet
   ```

#### Step 6: Set Up Process Management

1. **Install PM2 for process management:**
   ```bash
   sudo npm install -g pm2
   ```

2. **Create PM2 ecosystem file:**
   ```bash
   nano ecosystem.config.js
   ```
   
   Add this configuration:
   ```javascript
   module.exports = {
     apps: [{
       name: 'km-todo',
       script: 'npm',
       args: 'start:prod',
       cwd: '/home/kmtodo/km-todo',
       env: {
         NODE_ENV: 'production',
         PORT: '3000',
         DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/km_todo',
         DB_PORT: '5432',
         DB_E2E_PORT: '5433'
       },
       instances: 1,
       autorestart: true,
       watch: false,
       max_memory_restart: '1G'
     }]
   }
   ```

3. **Start the application with PM2:**
   ```bash
   pm2 start ecosystem.config.js
   pm2 startup
   pm2 save
   ```

#### Step 7: Configure Firewall

1. **Set up UFW firewall:**
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 'Apache Full'
   sudo ufw enable
   ```

#### Step 8: Database Setup

1. **Start the database:**
   ```bash
   npm run db:up
   ```

2. **Seed the database:**
   ```bash
   npm run db:seed
   ```

#### Step 9: Final Configuration

1. **Test the application:**
   - Visit `http://your-domain.com` or `http://your-droplet-ip`
   - Login with admin credentials: `admin@example.com` / `kmToDo1!1!`

2. **Set up automatic updates:**
   ```bash
   sudo apt install unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

#### Troubleshooting

- **Check application logs:**
  ```bash
  pm2 logs km-todo
  ```

- **Check Apache logs:**
  ```bash
  sudo tail -f /var/log/apache2/km-todo_error.log
  ```

- **Restart services:**
  ```bash
  pm2 restart km-todo
  sudo systemctl restart apache2
  ```

- **Check database status:**
  ```bash
  docker ps
  docker logs km-todo-db-1
  ```

#### Security Considerations

- Change default admin password after first login
- Regularly update system packages
- Monitor logs for suspicious activity
- Consider setting up fail2ban for additional security
- Use strong passwords for database and application
- Keep SSL certificates up to date

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