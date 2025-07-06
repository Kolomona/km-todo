# KM-TODO: Next.js + Docker + Postgres

This project is a [Next.js](https://nextjs.org) app with a Dockerized Postgres database, ready for both local development and self-hosted production deployment (e.g., on a DigitalOcean VPS).

---

## 🚀 Getting Started (Local Development)

1. **Start the Postgres database (in Docker):**
   ```bash
   npm run db:up
   ```
   This uses Docker Compose to start a local Postgres container.

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   This will:
   - Ensure the database is running
   - Wait for Postgres to be ready
   - Start Next.js in development mode (with hot reload)

3. **Open your browser:**
   [http://localhost:3000](http://localhost:3000)

---

## 🐳 Production Deployment (VPS, e.g., DigitalOcean)

1. **Copy your project to your VPS.**
2. **Set up your environment variables:**
   - Use `.env.production` or set `DATABASE_URL` and `NODE_ENV` in your deployment environment.
3. **Build and start everything with Docker Compose:**
   ```bash
   docker compose up --build -d
   ```
   This will:
   - Build your Next.js app image
   - Start both the app and Postgres containers
   - Serve your app on port 3000 (and Postgres on 5432)

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

## 🛠️ Useful Commands

- `npm run db:up`    – Start the Postgres container
- `npm run db:down`  – Stop and remove containers
- `npm run dev`      – Start dev server (with DB)

---

## 📦 Project Structure
- `docker-compose.yml` – Defines both app and database services
- `Dockerfile`         – Builds the Next.js app for production
- `.env`, `.env.production` – Environment variables for dev and prod

---

## Prisma
- The `DATABASE_URL` is used by Prisma for migrations and queries.
- Use `npx prisma migrate dev` for local development.

---

## Learn More
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Compose Docs](https://docs.docker.com/compose/)
