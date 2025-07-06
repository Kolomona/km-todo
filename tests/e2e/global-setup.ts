import { execSync } from 'child_process'

async function globalSetup() {
  console.log('Setting up E2E test environment...')
  
  // Set environment variables for E2E testing
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/km_todo_e2e_test'
  
  try {
    // Start E2E test database if not running
    console.log('Starting E2E test database...')
    execSync('docker compose up -d db-e2e', { stdio: 'inherit' })
    
    // Wait for database to be ready
    console.log('Waiting for database to be ready...')
    execSync('npx wait-on tcp:5433', { stdio: 'inherit' })
    
    // Run database migrations
    console.log('Running database migrations...')
    execSync('npx prisma migrate deploy', { 
      env: { ...process.env, DATABASE_URL: 'postgresql://postgres:postgres@localhost:5433/km_todo_e2e_test' },
      stdio: 'inherit' 
    })
    
    // Seed test data
    console.log('Seeding test data...')
    execSync('npx tsx prisma/seed.ts', { 
      env: { ...process.env, DATABASE_URL: 'postgresql://postgres:postgres@localhost:5433/km_todo_e2e_test' },
      stdio: 'inherit' 
    })
    
    console.log('E2E test environment setup complete!')
  } catch (error) {
    console.error('Error setting up E2E test environment:', error)
    throw error
  }
}

export default globalSetup 