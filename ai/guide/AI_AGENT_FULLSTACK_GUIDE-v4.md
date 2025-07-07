# AI Agent Full-Stack Development Guide v4
## Building Complete Web Applications with AI Teams

*Streamlined guide for building full-stack web applications using multiple AI agents with contract-driven development, explicit project management, and production-grade workflows.*

> **Note for Human Readers**: Throughout this document, `@` symbols are used before filename references (e.g., `@API_CONTRACT.md`) to help AI agents better understand file relationships and importance. These `@` symbols are **not part of the actual filenames** - they are only used in this documentation for AI interpretability. Actual filenames do not have `@` prefixes.

---

## Quick Start

1. **Create Project Structure**
   ```
   your-project/
   ├── ai/
   │   ├── ProductVision.md           # Business plan & requirements
   │   ├── API_CONTRACT.md            # Living contract (frontend ↔ backend)
   │   ├── ProjectStatusBoard.md      # Integration & ticketing system
   │   ├── FrontEndStatus.md          # Frontend progress log
   │   ├── BackEndStatus.md           # Backend progress log
   │   ├── TestingStrategy.md         # Testing guidelines & examples
   │   ├── GitVersionControlStrategy.md # Git workflow & conventions
   │   └── archives/                  # Archived status boards
   ```

2. **Use AI Agent Context Primer** (paste at start of each conversation)
   ```
   # Project Context Primer
   You are an AI agent working as part of a multi-agent, contract-driven development team.
   
   - @API_CONTRACT.md = single source of truth for endpoints & data models
   - @ProjectStatusBoard.md = integration & ticketing (max 5 open issues, 200 lines)
   - All agents write to @ProjectStatusBoard.md for issues/decisions
   - AIPM agent curates @ProjectStatusBoard.md format & archives
   - Check @ProjectStatusBoard.md, @API_CONTRACT.md, @TestingStrategy.md before starting
   - If @ProjectStatusBoard.md exceeds 200 lines, create issue for AIPM to archive
   
   Your role: [Backend/Frontend/AIPM]
   Your scope: [Define specific responsibilities]
   ```

3. **Development Cycle**
   ```
   Update Contract → Backend Implementation → Frontend Implementation → 
   Integration Testing → AIPM Summary → Repeat
   ```

---

## Core Concepts

### The Problem
Single AI development results in:
- ❌ Integration issues (frontend/backend mismatch)
- ❌ Inconsistent code patterns
- ❌ Missing features & quality problems

### The Solution: AI Agent Teams
- **🤖 Backend AI**: Server-side code, databases, APIs
- **🎨 Frontend AI**: UI, styling, user experience  
- **📋 AIPM Agent**: Coordination, summary, file curation
- **👤 Human PM**: Strategic decisions & validation

### Contract-Driven Method
**@API_CONTRACT.md** = living blueprint defining:
- Data models & formats
- Frontend/backend communication
- Team responsibilities
- Error handling & edge cases

**@ProjectStatusBoard.md** = streamlined integration system:
- Max 5 open issues (enforced by human PM)
- Max 200 lines (enforced by AIPM)
- Immediate archiving of resolved issues
- Archive files in `ai/archives/` with standardized naming

---

## Project Setup

### Step 1: Business Foundation
Create @ProductVision.md with:
- Market analysis & competitive review
- Target users & business goals
- User stories & feature list
- Technical requirements & architecture
- Data models & key algorithms
- Success metrics & risk assessment

### Step 2: Generate Foundation Files
Use AIPM prompt:
```
"Read @ProductVision.md and generate all foundational files:
1. @API_CONTRACT.md - Detailed, living contract
2. @DevelopmentPlan.md - Roadmap with phases
3. @FrontEndStatus.md - Frontend progress tracking
4. @BackEndStatus.md - Backend progress tracking  
5. @ProjectStatusBoard.md - Integration & ticketing system
6. @TestingStrategy.md - Testing guidelines & examples
7. @GitVersionControlStrategy.md - Git workflow & conventions

Comment each file with purpose and usage instructions."
```

### Step 3: Review & Refine
- ✅ API contract covers all features?
- ✅ Data models correct & contract-compliant?
- ✅ Phases make sense?
- ✅ Instructions & protocols clear?

---

## AI Team Workflows

### Backend AI Agent

**Context Primer:**
```
# Project Context Primer (Backend)
You are the Backend AI Agent for this project.

- Refer to @API_CONTRACT.md for endpoints & data models
- Refer to @TestingStrategy.md for testing guidelines
- Refer to @GitVersionControlStrategy.md for Git workflow
- Track progress in @BackEndStatus.md
- Check @ProjectStatusBoard.md for open issues before starting

Your role: Backend
Your scope: Backend APIs, database, integration, testing, version control

Testing Responsibilities:
- Write unit tests for all endpoints & business logic
- Test database operations & data validation
- Ensure authentication & permissions work
- Update @BackEndStatus.md with test results
- Log test failures in @ProjectStatusBoard.md

Git Responsibilities:
- Work on feature branches (feature/backend-[description])
- Use conventional commits (feat(backend): description)
- Create pull requests for all changes
```

**Implementation Prompt:**
```
"Implement backend endpoints as defined in @API_CONTRACT.md.
Focus on: [specific endpoints/features]

Requirements:
1. Follow exact request/response formats in contract
2. Add proper error handling & validation
3. Include authentication where required
4. Provide mock data for testing
5. Update @BackEndStatus.md with progress & blockers
6. Log contract compliance, migrations, integration issues in @ProjectStatusBoard.md

Testing Requirements:
- Write unit tests for all endpoints implemented
- Test database operations & data validation
- Ensure authentication & permissions work correctly
- Update @BackEndStatus.md with test results & coverage
- Log test failures in @ProjectStatusBoard.md
- Run all tests before completing work"
```

### Frontend AI Agent

**Context Primer:**
```
# Project Context Primer (Frontend)
You are the Frontend AI Agent for this project.

- Refer to @API_CONTRACT.md for endpoints & data models
- Refer to @TestingStrategy.md for testing guidelines
- Refer to @GitVersionControlStrategy.md for Git workflow
- Track progress in @FrontEndStatus.md
- Check @ProjectStatusBoard.md for open issues before starting

Your role: Frontend
Your scope: Frontend UI, client logic, integration, testing, version control

Testing Responsibilities:
- Write unit tests for all UI components & client logic
- Test user interactions & form validation
- Ensure responsive design works on different screen sizes
- Update @FrontEndStatus.md with test results
- Log UI/UX issues in @ProjectStatusBoard.md

Git Responsibilities:
- Work on feature branches (feature/frontend-[description])
- Use conventional commits (feat(frontend): description)
- Create pull requests for all changes
```

**Implementation Prompt:**
```
"Build frontend components using endpoints defined in @API_CONTRACT.md.
Focus on: [specific features]

Requirements:
1. Use only endpoints defined in contract
2. Handle loading states & errors gracefully
3. Make UI responsive & accessible
4. Use mock data for unimplemented features
5. Update @FrontEndStatus.md with progress & blockers
6. Log contract compliance, migrations, integration issues in @ProjectStatusBoard.md

Testing Requirements:
- Write unit tests for all UI components created
- Test user interactions & form validation
- Ensure responsive design works on different screen sizes
- Update @FrontEndStatus.md with test results & coverage
- Log UI/UX issues in @ProjectStatusBoard.md
- Run all tests before completing work"
```

### AIPM Agent

**Context Primer:**
```
# Project Context Primer (AIPM)
You are the AI Project Manager (AIPM) Agent for this project.

- Refer to @API_CONTRACT.md for project workflow & file usage
- Refer to @TestingStrategy.md for testing guidelines
- Check @ProjectStatusBoard.md for open issues before starting

Your role: AIPM (AI Project Manager)
Your scope: Project coordination, summary, file curation, testing coordination

Testing Responsibilities:
- Run comprehensive E2E tests for all user workflows
- Test integration between frontend & backend components
- Verify contract compliance through testing
- Check performance & accessibility standards
- Coordinate testing between teams
- Log all test results, issues, fixes in @ProjectStatusBoard.md
- Ensure test coverage meets requirements
```

**Integration Testing Prompt:**
```
"Review current project state. Check for mismatches between frontend & backend implementations.
Update contract if needed, log changes in @ProjectStatusBoard.md.
Run E2E tests, log results, issues, fixes in @ProjectStatusBoard.md.
Summarize current blockers, open issues, decisions at top of @ProjectStatusBoard.md.
Archive resolved issues as needed.

Testing Requirements:
- Run comprehensive E2E tests for all user workflows
- Test integration between frontend & backend components
- Verify contract compliance through testing
- Check performance & accessibility standards
- Coordinate testing between teams
- Log all test results, issues, fixes in @ProjectStatusBoard.md
- Ensure test coverage meets requirements"
```

---

## ProjectStatusBoard.md Structure

### Efficient Format (Max 200 Lines)

```markdown
# @ProjectStatusBoard.md

## Current Status (Top 5 Issues)
| ID | Area | Issue | Status | Owner | Priority |
|----|------|-------|--------|-------|----------|
| #101 | Backend | Analytics endpoints missing | Open | Backend | High |
| #102 | Frontend | Mobile responsive issues | In Progress | Frontend | Medium |

## Recent Decisions (Last 5)
- [2024-07-04] Contract updated: all payloads use camelCase
- [2024-07-03] Playwright E2E required for new features

## Test Results Summary
- Frontend: 254/256 passing (99.2%)
- Backend: 73/73 passing (100%)
- E2E: 3/3 passing (100%)

## Next Milestones
1. Priority 1: Complete analytics API endpoints
2. Priority 2: Fix mobile responsive issues
3. Priority 3: Implement real-time features

## Archive (Line-Count Based)
### Current Archive
- [RESOLVED] #100 MenuItem.price migration complete
- [RESOLVED] #99 Dashboard loading state fixed

*Note: When this file exceeds 200 lines, older resolved issues will be moved to archive files.*
```

### Archiving Workflow

**When @ProjectStatusBoard.md exceeds 200 lines:**
  1. AIPM creates new archive file: `ai/archives/ProjectStatusBoard-Archive-YY-MM-DD-XXX.md`
2. Moves oldest resolved issues to archive
3. Updates @ProjectStatusBoard.md to remove archived items
4. Maintains same 5-section structure in archive files

**Archive File Discovery:**
- AI agents use `ls -l ai/archives/` to find relevant files
- Archive files maintain same structure for AI readability
- Complex historical research handled by human PM when needed

---

## Testing Strategy

### Testing Approach
- **Unit Tests (70%)**: Individual pieces work correctly
- **Integration Tests (20%)**: Pieces work together
- **E2E Tests (10%)**: Whole application works for users

### Testing Tools
- **Unit/Integration**: Vitest, React Testing Library, Supertest
- **E2E**: Playwright with test data seeding/reset

### Testing Responsibilities

**Backend AI:**
- Test all API endpoints work correctly
- Test database operations & data validation
- Test authentication & permissions
- Update @BackEndStatus.md with test results
- Log test failures in @ProjectStatusBoard.md

**Frontend AI:**
- Test components display correctly
- Test user interactions & form validation
- Test responsive design on different screen sizes
- Update @FrontEndStatus.md with test results
- Log UI/UX issues in @ProjectStatusBoard.md

**AIPM:**
- Run E2E tests for all user workflows
- Test integration between frontend & backend
- Verify contract compliance through testing
- Log all test results, issues, fixes in @ProjectStatusBoard.md

### Testing Communication Protocol

**Daily Workflow:**
1. **Before Starting**: Run existing tests, check @ProjectStatusBoard.md
2. **During Development**: Write tests for new features, run frequently
3. **After Completing**: Run full test suite, update status files, log issues

**Test Status Updates:**
```markdown
### Testing Status (in status files)
- ✅ Unit tests: 15/15 passing
- ✅ Integration tests: 8/8 passing
- ❌ E2E tests: 2/3 passing (login flow failing)
- 📊 Code coverage: 85%

### Test Issues (in @ProjectStatusBoard.md)
| #107 | Testing | Login E2E test failing on mobile | Open | Frontend | Medium |
```

---

## Common Problems & Solutions

### Problem 1: Frontend Can't Connect to Backend
**Symptoms:** 404 errors, data doesn't load, connection errors

**Solution:**
1. Check backend endpoints match API contract exactly
2. Verify API contract is up to date
3. Test endpoints manually (Postman)
4. Log integration issues in @ProjectStatusBoard.md

### Problem 2: Data Format Mismatches
**Symptoms:** Incorrect data display, form submission issues, missing fields

**Solution:**
1. Compare frontend expectations with backend responses
2. Update API contract to match actual data
3. Ensure consistent naming conventions (camelCase)
4. Log migrations in @ProjectStatusBoard.md

### Problem 3: Missing Features
**Symptoms:** Planned features not implemented, incomplete functionality

**Solution:**
1. Review @DevelopmentPlan.md against current state
2. Check if features are in API contract
3. Assign missing features to appropriate teams
4. Log blockers in @ProjectStatusBoard.md

### Problem 4: Poor Performance
**Symptoms:** Slow page loads, unresponsive UI, high server load

**Solution:**
1. Optimize database queries & add caching
2. Optimize frontend bundle size
3. Add loading states & pagination
4. Log performance issues in @ProjectStatusBoard.md

---

## Best Practices

### Contract Management
✅ **Do:**
- Keep API contract as single source of truth
- Update contract before implementing new features
- Use clear, consistent naming conventions (camelCase)
- Log all contract changes in @ProjectStatusBoard.md

❌ **Don't:**
- Implement features without updating contract
- Let contract become outdated
- Use inconsistent data formats

### Team Coordination
✅ **Do:**
- Update status files after each session
- Communicate through contract & @ProjectStatusBoard.md
- Test integration regularly with E2E tests
- Keep sessions focused on specific features

❌ **Don't:**
- Work on features not in contract
- Skip status updates
- Assume other team knows your changes

### Quality Assurance
✅ **Do:**
- Test features after implementation
- Validate against contract
- Check accessibility & responsiveness
- Require E2E tests with test data seeding/reset
- Log all test results in @ProjectStatusBoard.md

❌ **Don't:**
- Skip testing
- Ignore contract violations
- Overlook user experience

### Human Oversight
✅ **Do:**
- Review AI-generated code
- Make strategic decisions about features
- Validate requirements are met
- Use @ProjectStatusBoard.md as single source of truth

❌ **Don't:**
- Let AI make all decisions
- Skip human validation
- Ignore business requirements

---

## Templates

### API Contract Structure
```markdown
# @API_CONTRACT.md

## Authentication Endpoints
- **POST /api/auth/login**
  - Request: `{ email: string, password: string }`
  - Response: `{ user: User, session: Session }`

## Data Endpoints
- **GET /api/recipes**
  - Request: None
  - Response: `Recipe[]`

## Data Models
```typescript
interface Recipe {
  id: number;
  name: string;
  description?: string;
  ingredients: RecipeIngredient[];
  createdAt: string; // camelCase enforced
}
```

## Example Payloads
```json
{
  "name": "Chocolate Cake",
  "description": "Rich chocolate cake",
  "ingredients": [
    { "name": "Flour", "quantity": 2, "unit": "cups" }
  ]
}
```
```

### Development Plan Structure
```markdown
# @DevelopmentPlan.md

## Phases & Milestones

### Phase 1: Core Features ✅
- [x] User authentication
- [x] Basic CRUD operations
- [x] Database setup

### Phase 2: Advanced Features 🔄
- [ ] Search and filtering
- [ ] File uploads
- [ ] Advanced UI components

### Phase 3: Polish & Production ✅
- [x] Responsive design
- [x] Error handling
- [x] Performance optimization

## Deliverables
- [x] Working web application
- [x] API documentation
- [x] User guide
- [x] E2E tests with test data seeding/reset
```

### Status File Structure
```markdown
# @FrontEndStatus.md

## 2024-07-03 - PHASE 2 IN PROGRESS
- **Authentication UI**: Login/logout forms implemented
- **Recipe Management**: CRUD interface complete
- **Responsive Design**: Works on mobile and desktop
- **E2E Testing**: Playwright tests passing, test data reset before each run

### Technical Achievements
- ✅ User authentication forms
- ✅ Recipe list and detail views
- ✅ Create/edit recipe forms
- ✅ Responsive navigation

### Blockers
- [ ] Data model migration to camelCase in progress
- [ ] Real-time updates not yet integrated

### Next Steps
1. Complete camelCase migration (see @ProjectStatusBoard.md)
2. Integrate real-time features
3. Add advanced analytics widgets

## Blockers: See @ProjectStatusBoard.md for all integration and migration issues
```

---

## Step-by-Step Example: Recipe Manager

### Step 1: Create @ProductVision.md
```markdown
# @ProductVision.md - Recipe Manager

## Overview
Web app for storing and managing cooking recipes.

## User Stories
- As a user, I can create new recipes
- As a user, I can view my recipe list
- As a user, I can edit existing recipes
- As a user, I can delete recipes

## Features
- Recipe CRUD (Create, Read, Update, Delete)
- Ingredient management
- Recipe search and filtering
- Responsive design

## Technical Requirements
- Frontend: SvelteKit
- Backend: Node.js with SvelteKit
- Database: SQLite
- Authentication: Session-based
- E2E Testing: Playwright with test data seeding/reset

## Data Models
- Recipe: id, name, description, ingredients, created_at
- Ingredient: id, name, unit, cost_per_unit
- User: id, name, email, password_hash
```

### Step 2: Generate Foundation Files
Use AIPM prompt to generate all foundational files.

### Step 3: Backend Implementation
Use Backend AI prompt to implement core API endpoints.

### Step 4: Frontend Implementation
Use Frontend AI prompt to build UI components.

### Step 5: Integration Testing
Use AIPM prompt to test complete application.

---

## Next Steps

### For Beginners
1. Start with simple project to learn process
2. Follow templates exactly
3. Practice regularly with multiple projects
4. Document mistakes in @ProjectStatusBoard.md

### For Intermediate Developers
1. Customize process for specific needs
2. Add automation for contract validation
3. Expand teams for complex projects
4. Focus on testing & performance

### For Advanced Developers
1. Create custom AI agents for domain
2. Develop tools to automate process
3. Share knowledge & improvements
4. Start from real business plan & market analysis
5. Treat advanced features as first-class

---

## Conclusion

AI Agent Full-Stack Development enables building better applications faster through:
1. **Multiple AI agents** with specific roles
2. **Living contract** as single source of truth
3. **Streamlined project management** with @ProjectStatusBoard.md
4. **Comprehensive testing** with E2E validation
5. **Human oversight** for strategic decisions
6. **Production-ready workflows** from day one

The key is maintaining discipline in:
- Contract management & updates
- Status tracking & communication
- Testing & quality assurance
- Human validation & oversight

Happy building! 🚀

---

*This guide is a living document. Updates reflect latest best practices for AI agent full-stack development.* 