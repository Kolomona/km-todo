# Git Version Control Strategy - AI Agent Development

*This document outlines the Git version control strategy for AI Agent Full-Stack Development, including workflows, branching strategies, commit conventions, and AI agent responsibilities.*

## 1. Git Workflow Overview

### Branching Strategy: Git Flow with AI Agent Adaptations

```
main (production)
├── develop (integration)
│   ├── feature/backend-auth-system
│   ├── feature/frontend-login-ui
│   └── feature/api-contract-updates
├── hotfix/critical-security-fix
└── release/v1.2.0
```

### AI Agent Branch Naming Conventions

- **Backend Features**: `feature/backend-[description]`
- **Frontend Features**: `feature/frontend-[description]`
- **API Contract Changes**: `feature/contract-[description]`
- **Integration Work**: `feature/integration-[description]`
- **Testing**: `feature/testing-[description]`
- **Documentation**: `feature/docs-[description]`

## 2. AI Agent Git Responsibilities

### Backend AI Agent Git Workflow

**Before Starting Work:**
```bash
# 1. Check current status
git status
git log --oneline -5

# 2. Update from develop
git checkout develop
git pull origin develop

# 3. Create feature branch
git checkout -b feature/backend-[description]
```

**During Development:**
```bash
# 1. Make changes and test
# 2. Stage changes
git add .

# 3. Commit with proper message
git commit -m "feat(backend): implement user authentication endpoints

- Add POST /api/auth/login endpoint
- Add POST /api/auth/register endpoint
- Add JWT token validation middleware
- Update BackEndStatus.md with progress
- Log integration issues in ProjectStatusBoard.md

Closes #123"
```

**Before Completing Work:**
```bash
# 1. Update status files
# 2. Run tests
npm run test

# 3. Push feature branch
git push origin feature/backend-[description]

# 4. Create pull request to develop
# 5. Update ProjectStatusBoard.md with PR link
```

### Frontend AI Agent Git Workflow

**Before Starting Work:**
```bash
# 1. Check current status
git status
git log --oneline -5

# 2. Update from develop
git checkout develop
git pull origin develop

# 3. Create feature branch
git checkout -b feature/frontend-[description]
```

**During Development:**
```bash
# 1. Make changes and test
# 2. Stage changes
git add .

# 3. Commit with proper message
git commit -m "feat(frontend): implement login form component

- Add LoginForm component with validation
- Add error handling and loading states
- Add responsive design for mobile
- Update FrontEndStatus.md with progress
- Log UI issues in ProjectStatusBoard.md

Closes #124"
```

**Before Completing Work:**
```bash
# 1. Update status files
# 2. Run tests
npm run test

# 3. Push feature branch
git push origin feature/frontend-[description]

# 4. Create pull request to develop
# 5. Update ProjectStatusBoard.md with PR link
```

### AIPM Agent Git Workflow

**Integration Testing:**
```bash
# 1. Check out develop for testing
git checkout develop
git pull origin develop

# 2. Run E2E tests
npm run test:e2e

# 3. Log results in ProjectStatusBoard.md
```

**Release Management:**
```bash
# 1. Create release branch
git checkout -b release/v1.2.0

# 2. Update version numbers
# 3. Update CHANGELOG.md
# 4. Final testing
npm run test:ci

# 5. Merge to main and develop
git checkout main
git merge release/v1.2.0
git tag v1.2.0
git checkout develop
git merge release/v1.2.0

# 6. Delete release branch
git branch -d release/v1.2.0
```

## 3. Commit Message Conventions

### Conventional Commits Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes
- **perf**: Performance improvements
- **build**: Build system changes

### Commit Scopes

- **backend**: Backend API changes
- **frontend**: Frontend UI changes
- **contract**: API contract changes
- **integration**: Integration work
- **testing**: Testing changes
- **docs**: Documentation changes
- **ci**: CI/CD changes

### Examples

```bash
# Backend feature
git commit -m "feat(backend): implement user authentication

- Add JWT token generation and validation
- Add password hashing with bcrypt
- Add user session management
- Update BackEndStatus.md with progress

Closes #123"

# Frontend feature
git commit -m "feat(frontend): add responsive navigation menu

- Add mobile hamburger menu
- Add desktop navigation bar
- Add active state styling
- Update FrontEndStatus.md with progress

Closes #124"

# Contract change
git commit -m "feat(contract): update user model with profile fields

- Add firstName, lastName fields
- Add avatarUrl field
- Update API documentation
- Log change in ProjectStatusBoard.md

Closes #125"

# Integration work
git commit -m "feat(integration): complete auth flow E2E testing

- Add login/logout E2E tests
- Add registration E2E tests
- Add error handling tests
- Update ProjectStatusBoard.md with results

Closes #126"
```

## 4. Git Configuration for AI Agents

### Global Git Configuration

```bash
# Set up git configuration
git config --global user.name "AI Agent - [Role]"
git config --global user.email "ai-agent-[role]@project.com"

# Set up commit template
git config --global commit.template ~/.gitmessage
```

### Commit Template

Create `~/.gitmessage`:
```
# <type>(<scope>): <description>

# [optional body]

# [optional footer(s)]

# Types: feat, fix, docs, style, refactor, test, chore, ci, perf, build
# Scopes: backend, frontend, contract, integration, testing, docs, ci
# Examples:
# feat(backend): implement user authentication
# fix(frontend): resolve login form validation issue
# docs(contract): update API documentation
```

### Git Hooks for AI Agents

**Pre-commit Hook** (`/.git/hooks/pre-commit`):
```bash
#!/bin/bash

# Run tests before commit
echo "Running tests..."
npm run test

# Check if tests passed
if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi

# Check for TODO comments
if git diff --cached | grep -i "TODO"; then
    echo "Warning: TODO comments found in staged changes"
fi

# Check for console.log statements
if git diff --cached | grep -i "console.log"; then
    echo "Warning: console.log statements found in staged changes"
fi
```

**Commit-msg Hook** (`/.git/hooks/commit-msg`):
```bash
#!/bin/bash

# Check commit message format
commit_msg=$(cat "$1")

# Check for conventional commit format
if ! echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|ci|perf|build)\([a-z]+\): .+"; then
    echo "Error: Commit message must follow conventional commit format"
    echo "Example: feat(backend): implement user authentication"
    exit 1
fi
```

## 5. Pull Request Workflow

### Pull Request Template

Create `.github/pull_request_template.md`:
```markdown
## Description
Brief description of changes made

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Status Files Updated
- [ ] BackEndStatus.md (if backend changes)
- [ ] FrontEndStatus.md (if frontend changes)
- [ ] ProjectStatusBoard.md (if integration changes)

## Related Issues
Closes #[issue_number]

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements left in code
- [ ] No TODO comments left in code
```

### Pull Request Review Process

1. **AI Agent Creates PR**
   - Fill out PR template completely
   - Link to relevant issues
   - Update ProjectStatusBoard.md with PR link

2. **AIPM Agent Reviews PR**
   - Check for contract compliance
   - Verify status files are updated
   - Run integration tests
   - Approve or request changes

3. **Human Project Manager Final Review**
   - Strategic review of changes
   - Business logic validation
   - Final approval

## 6. Git Integration with Project Files

### Status File Updates

**BackEndStatus.md Updates:**
```markdown
## 2024-12-19 - Feature Branch: feature/backend-auth-system
- **Git Branch**: feature/backend-auth-system
- **Last Commit**: feat(backend): implement JWT token validation
- **PR Status**: Ready for review (#45)
- **Testing**: Unit tests 15/15 passing, integration tests 8/8 passing
```

**FrontEndStatus.md Updates:**
```markdown
## 2024-12-19 - Feature Branch: feature/frontend-login-ui
- **Git Branch**: feature/frontend-login-ui
- **Last Commit**: feat(frontend): add responsive login form
- **PR Status**: Ready for review (#46)
- **Testing**: Unit tests 12/12 passing, E2E tests 3/3 passing
```

**ProjectStatusBoard.md Updates:**
```markdown
## Open Issues
| ID   | Date       | Area      | Title/Description                  | Status   | Owner     | Priority | Notes                |
|------|------------|-----------|------------------------------------|----------|-----------|----------|----------------------|
| #123 | 2024-12-19 | Backend   | Implement user authentication      | PR #45   | Backend   | High     | Ready for review     |
| #124 | 2024-12-19 | Frontend  | Create login UI components         | PR #46   | Frontend  | High     | Ready for review     |
```

### Git Commands for AI Agents

**Daily Workflow:**
```bash
# Start of day
git status
git log --oneline -5
git checkout develop
git pull origin develop

# During development
git add .
git commit -m "feat(scope): description"
git push origin feature/branch-name

# End of day
git status
git log --oneline -3
```

**Integration Workflow:**
```bash
# AIPM agent integration testing
git checkout develop
git pull origin develop
git merge feature/backend-auth-system
git merge feature/frontend-login-ui
npm run test:integration
npm run test:e2e
```

## 7. Git Best Practices for AI Agents

### ✅ Do:
- Always work on feature branches, never directly on main/develop
- Write descriptive commit messages following conventional commits
- Update status files with git information
- Run tests before committing
- Create pull requests for all changes
- Keep commits atomic and focused
- Use meaningful branch names

### ❌ Don't:
- Commit directly to main or develop branches
- Write vague commit messages
- Commit broken or untested code
- Mix multiple features in one commit
- Leave TODO comments in committed code
- Forget to update status files

### Git Hygiene Checklist

**Before Each Commit:**
- [ ] Code is tested and working
- [ ] Status files are updated
- [ ] No TODO comments remain
- [ ] No console.log statements remain
- [ ] Commit message follows convention
- [ ] Changes are atomic and focused

**Before Creating PR:**
- [ ] All tests pass
- [ ] Documentation is updated
- [ ] ProjectStatusBoard.md is updated
- [ ] PR template is filled out
- [ ] Code review is requested

## 8. Git Troubleshooting for AI Agents

### Common Issues and Solutions

**Issue: Merge Conflicts**
```bash
# 1. Check status
git status

# 2. Resolve conflicts in files
# 3. Add resolved files
git add .

# 4. Complete merge
git commit -m "fix(integration): resolve merge conflicts"
```

**Issue: Wrong Branch**
```bash
# 1. Stash current changes
git stash

# 2. Switch to correct branch
git checkout correct-branch

# 3. Apply stashed changes
git stash pop
```

**Issue: Commit to Wrong Branch**
```bash
# 1. Create new branch from current state
git checkout -b feature/correct-branch

# 2. Reset original branch
git checkout original-branch
git reset --hard HEAD~1

# 3. Continue work on correct branch
git checkout feature/correct-branch
```

## 9. Git Integration with CI/CD

### GitHub Actions Workflow

Create `.github/workflows/ci.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to production
        run: echo "Deploy to production"
```

## 10. Git Training for AI Agents

### Essential Git Commands

```bash
# Basic workflow
git status                    # Check current status
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin branch        # Push to remote
git pull origin branch        # Pull from remote

# Branching
git branch                    # List branches
git checkout -b new-branch    # Create and switch to new branch
git checkout branch-name      # Switch to existing branch
git merge branch-name         # Merge branch into current

# History
git log --oneline            # View commit history
git log --graph              # View branch graph
git diff                     # View unstaged changes
git diff --staged            # View staged changes

# Undoing
git reset --soft HEAD~1      # Undo last commit, keep changes
git reset --hard HEAD~1      # Undo last commit, discard changes
git revert HEAD              # Create new commit that undoes last commit
```

### Git Workflow Summary

1. **Start Work**: Checkout develop, pull latest, create feature branch
2. **During Work**: Make changes, test, commit frequently
3. **Complete Work**: Push branch, create PR, update status files
4. **Integration**: AIPM merges and tests integration
5. **Release**: Create release branch, test, merge to main

---

*This Git strategy ensures consistent version control practices across all AI agents while maintaining the contract-driven development approach.* 