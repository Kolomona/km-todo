# E2E Testing Infrastructure

This directory contains the end-to-end (E2E) tests for the KM Todo application using Playwright.

## Setup

### Prerequisites
- Node.js 20+
- Docker and Docker Compose
- Playwright browsers installed

### Installation
```bash
# Install Playwright browsers
npm run test:e2e:install

# Start E2E test database
npm run db:e2e:up
```

## Running Tests

### All E2E Tests
```bash
npm run test:e2e
```

### Interactive Mode
```bash
npm run test:e2e:ui
```

### Debug Mode
```bash
npm run test:e2e:debug
```

### Specific Test File
```bash
npx playwright test tests/e2e/auth/login.spec.ts
```

## Test Structure

```
tests/e2e/
├── auth/           # Authentication tests
├── projects/       # Project management tests
├── todos/          # Todo management tests
├── utils/          # Test utilities and helpers
├── global-setup.ts # Global test setup
├── global-teardown.ts # Global test cleanup
└── README.md       # This file
```

## Test Database

E2E tests use a separate database (`km_todo_e2e_test`) to avoid interfering with development data.

- **Database URL**: `postgresql://postgres:postgres@localhost:5433/km_todo_e2e_test`
- **Port**: 5433 (separate from development database on 5432)
- **Auto-setup**: Database is automatically created, migrated, and seeded before tests

## Test Utilities

The `TestHelpers` class provides common functions for E2E tests:

- `loginAsAdmin()` - Login with admin credentials
- `registerUser()` - Register a new user
- `logout()` - Logout current user
- `createProject()` - Create a new project
- `createTodo()` - Create a new todo
- `waitForAPIResponse()` - Wait for API responses
- `expectAccessible()` - Check accessibility

## Best Practices

### Test Data
- Use the seeded admin user for authentication tests
- Create fresh data for each test when needed
- Clean up data between tests using global setup/teardown

### Selectors
- Use `data-testid` attributes for reliable element selection
- Avoid using text content or CSS classes that might change
- Prefer semantic selectors (roles, labels) for accessibility

### Assertions
- Test user workflows, not implementation details
- Verify both UI state and API responses
- Include accessibility checks in all tests

### Performance
- Tests should complete within 30 seconds
- Use `waitForAPIResponse()` for async operations
- Avoid unnecessary waits and timeouts

## Configuration

The Playwright configuration (`playwright.config.ts`) includes:

- Multiple browsers (Chrome, Firefox, Safari)
- Mobile devices (Pixel 5, iPhone 12)
- 30-second timeout with 2 retries in CI
- Screenshot and video capture on failure
- Global setup/teardown for database management

## Troubleshooting

### Database Issues
```bash
# Reset E2E database
npm run db:e2e:down
npm run db:e2e:up
```

### Browser Issues
```bash
# Reinstall browsers
npm run test:e2e:install
```

### Test Failures
- Check screenshots in `test-results/` directory
- Review video recordings for debugging
- Verify test database is running and accessible 