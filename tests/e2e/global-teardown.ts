import { execSync } from 'child_process'

async function globalTeardown() {
  console.log('Cleaning up E2E test environment...')
  
  try {
    // Stop E2E test database
    console.log('Stopping E2E test database...')
    execSync('docker compose stop db-e2e', { stdio: 'inherit' })
    
    console.log('E2E test environment cleanup complete!')
  } catch (error) {
    console.error('Error cleaning up E2E test environment:', error)
    // Don't throw error during teardown to avoid masking test failures
  }
}

export default globalTeardown 