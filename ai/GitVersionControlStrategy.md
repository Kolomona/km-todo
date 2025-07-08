# Git Version Control Strategy - AI Agent Development

*Simple Git workflow for AI agent development with sequential workflow and single team.*

> **Note for Human Readers**: Throughout this document, `@` symbols are used before filename references (e.g., `@API_CONTRACT.md`) to help AI agents better understand file relationships and importance. These `@` symbols are **not part of the actual filenames** - they are only used in this documentation for AI interpretability. Actual filenames do not have `@` prefixes.

---

## Simple Git Workflow

### Branch Strategy: Main Branch Only
For AI agent development with sequential workflow, work directly on the main branch:

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

### Commit Message Format
```
<type>(<scope>): <description>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests

**Scopes:**
- `backend`: Backend API changes
- `frontend`: Frontend UI changes
- `contract`: API contract changes
- `integration`: Integration work
- `testing`: Testing changes

**Examples:**
```bash
git commit -m "feat(backend): implement user authentication"
git commit -m "feat(frontend): add login form component"
git commit -m "fix(integration): resolve login flow issues"
git commit -m "docs(contract): update API endpoints"
```

---

## AI Agent Git Responsibilities

### Before Starting Work
```bash
# Check current status
git status
git log --oneline -5

# Pull latest changes
git pull origin main
```

### During Development
```bash
# Make changes and test
# Stage changes
git add .

# Commit with proper message
git commit -m "feat(scope): description"
```

### After Completing Work
```bash
# Push changes
git push origin main

# Update status files
# Log in @ProjectStatusBoard.md
```

---

## Status File Integration

### Update Status Files with Git Info
**@BackEndStatus.md:**
```markdown
## 2024-12-19
- **Last Commit**: feat(backend): implement user authentication
- **Testing**: Unit tests 15/15 passing
- **Progress**: Authentication endpoints complete
```

**@FrontEndStatus.md:**
```markdown
## 2024-12-19
- **Last Commit**: feat(frontend): add login form component
- **Testing**: Unit tests 12/12 passing
- **Progress**: Login UI complete
```

**@ProjectStatusBoard.md:**
```markdown
## Recent Decisions (Last 5)
- [2024-12-19] Backend: User authentication implemented
- [2024-12-19] Frontend: Login form component added
```

---

## Git Best Practices

### ✅ Do:
- Work on main branch
- Write clear, descriptive commit messages
- Update status files with git information
- Test before committing
- Keep commits focused and atomic

### ❌ Don't:
- Commit broken or untested code
- Write vague commit messages
- Forget to update status files
- Mix multiple features in one commit

### Simple Checklist
- [ ] Code is tested and working
- [ ] Status files are updated
- [ ] Commit message follows format
- [ ] Changes are focused and atomic

---

## Why Simple Git Works for AI Agents

1. **Sequential Workflow**: Backend → Frontend → Integration
2. **Single Team**: One AI agent team working at a time
3. **Contract Coordination**: @API_CONTRACT.md ensures coordination
4. **Status Board**: @ProjectStatusBoard.md handles coordination
5. **Rapid Iteration**: AI agents can iterate quickly on main branch

---

*This simple Git strategy works perfectly for AI agent development where teams work sequentially and coordinate through the contract and status board system.* 