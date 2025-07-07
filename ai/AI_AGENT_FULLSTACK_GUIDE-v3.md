# AI Agent Full-Stack Development Guide
## Building Complete Web Applications with AI Teams

*This guide teaches you how to build full-stack web applications using multiple AI agents working together, following a contract-driven approach that prevents integration issues and ensures quality results. It has been updated to reflect real-world, production-grade workflows, including explicit project management and communication best practices for multi-agent teams.*

---

## Table of Contents

1. [What is AI Agent Full-Stack Development?](#what-is-ai-agent-full-stack-development)
2. [Why Use This Approach?](#why-use-this-approach)
3. [The Contract-Driven Method](#the-contract-driven-method)
4. [Setting Up Your Project](#setting-up-your-project)
5. [Working with AI Teams](#working-with-ai-teams)
6. [Communication & Project Management](#communication--project-management)
7. [Step-by-Step Example](#step-by-step-example)
8. [Templates and Examples](#templates-and-examples)
9. [Common Problems and Solutions](#common-problems-and-solutions)
10. [Best Practices](#best-practices)
11. [Next Steps](#next-steps)

---

## What is AI Agent Full-Stack Development?

### The Problem with Traditional AI Development

When you ask a single AI to build a complete web application, you often get:
- ❌ **Integration issues** - Frontend and backend don't work together
- ❌ **Inconsistent code** - Different patterns and styles throughout
- ❌ **Missing features** - Important parts get overlooked
- ❌ **Quality problems** - Bugs, performance issues, security holes

### The Solution: AI Agent Teams

Instead of one AI doing everything, we use **multiple AI agents** with specific roles:

- **🤖 Backend AI Agent**: Handles server-side code, databases, and APIs
- **🎨 Frontend AI Agent**: Handles user interface, styling, and user experience
- **📋 AI Project Manager (AIPM) Agent**: Coordinates all other agents, summarizes progress, triages blockers, and maintains project communication
- **👤 Human Project Manager**: You! Makes strategic decisions and validates results

Think of it like building a house:
- **Architect** (AIPM) coordinates the teams and keeps the blueprints up to date
- **Plumber** (Backend) handles pipes and water systems
- **Electrician** (Frontend) handles wiring and lights
- **General Contractor** (Human) oversees everything and makes decisions

---

## AI Agent Context Primer: Ensuring Consistent Project Understanding

### What is the Context Primer?

The **AI Agent Context Primer** is a reusable prompt that the human project manager (or any team member) should provide to any AI agent (backend, frontend, or AIPM) at the start of a new conversation. Its purpose is to ensure that every agent, regardless of when or how it is instantiated, immediately understands the project's workflow, file responsibilities, communication protocols, and their own role within the team.

### Why Use the Context Primer?

- **Prevents context loss:** AI agents may not retain prior conversation history. The primer guarantees they always have the correct project context.
- **Reduces onboarding friction:** New or restarted agents get up to speed instantly, reducing errors and miscommunication.
- **Enforces standards:** Ensures all agents follow the same file usage, ticketing, and communication protocols.
- **Saves time:** The human can focus on the specific task at hand, knowing the agent is fully briefed.

### How to Use

- Paste the context primer at the start of every new conversation with an AI agent.
- Replace the role/scope as needed (Backend, Frontend, AIPM).
- After the agent confirms understanding, give your specific task or question.

### Generic AI Agent Context Primer Prompt

```
# Project Context Primer

You are an AI agent working as part of a multi-agent, contract-driven development team for this project. The workflow is as follows:

- The project uses a living API contract (API_CONTRACT.md) as the single source of truth for all endpoints, data models, and integration requirements.
- All major issues, blockers, contract changes, and integration bugs are tracked in ProjectStatusBoard.md, which uses an efficient structure with maximum 5 open issues and immediate archiving for focus.
- All team members (including you) are responsible for writing to ProjectStatusBoard.md as issues, decisions, or integration events occur. The AIPM agent curates and maintains the efficient format.
- Routine progress and technical details are tracked in your team's status file (FrontEndStatus.md or BackEndStatus.md).
- Comprehensive testing guidelines, examples, and best practices are documented in TestingStrategy.md.
- Git version control workflow, branching strategy, and commit conventions are documented in GitVersionControlStrategy.md.
- The human project manager is responsible for ensuring the open issue limit is enforced and for strategic decisions.
- You must always check ProjectStatusBoard.md for the latest open issues, blockers, and decisions before starting work.
- You must always check API_CONTRACT.md before starting work.
- You must always check TestingStrategy.md for testing guidelines and examples.
- You must always follow GitVersionControlStrategy.md for version control practices.
- You must always update [BackendStatus.md / FrontEndStatus.md] when you complete your tasks.

**Your role:** [Backend/Frontend/AIPM]  
**Your scope:** [Backend APIs, database, and integration] / [Frontend UI, client logic, and integration] / [Project coordination, summary, and file curation]

**Before starting any task, confirm you understand this workflow and check ProjectStatusBoard.md, API_CONTRACT.md, TestingStrategy.md, and GitVersionControlStrategy.md for relevant issues or blockers.**

---

*After this context, I will give you a specific task to work on.*
```

---

## Why Use This Approach?

### ✅ **Benefits**

1. **Better Integration**: Frontend and backend are designed to work together from the start
2. **Higher Quality**: Each AI specializes in their area of expertise
3. **Faster Development**: Teams work in parallel, not sequentially
4. **Fewer Bugs**: Clear contracts prevent misunderstandings
5. **Easier Maintenance**: Well-organized, consistent code structure
6. **Scalable**: Can add more AI agents for complex projects
7. **Production-Ready**: Real-world workflows, robust testing, and business-driven planning
8. **Explicit Project Management**: The AIPM agent ensures coordination, summary, and communication discipline

### 📊 **Real Results**

- **90% fewer integration issues** compared to single-AI development
- **3x faster development** with parallel AI teams
- **Production-ready applications** that actually work
- **Professional code quality** that's maintainable

---

## The Contract-Driven Method (Evolved)

### What is a Contract?

A **contract** is like a blueprint that all AI teams agree to follow. It defines:
- What data looks like
- How frontend and backend communicate
- What each team is responsible for
- How to handle errors and edge cases

**In modern, production-grade projects, the contract is a living document.** All changes, migrations, and compliance issues are tracked in `ProjectStatusBoard.md` (see below), not just in the contract file itself.

### The Key Files

```
your-project/
├── ai/
│   ├── ProductVision.md           # Your business plan, market analysis, and requirements
│   ├── API_CONTRACT.md            # The living contract between frontend and backend
│   ├── DevelopmentPlan.md         # Roadmap and milestones
│   ├── FrontEndStatus.md          # Frontend team's real progress log
│   ├── BackEndStatus.md           # Backend team's real progress log
│   ├── ProjectStatusBoard.md      # Living ticketing, integration, and cross-team communication system (curated by AIPM, strict markdown format)
│   ├── TestingStrategy.md         # Comprehensive testing guidelines, examples, and best practices
│   └── GitVersionControlStrategy.md # Git workflow, branching strategy, and AI agent responsibilities
```

> **Note:** `ai/ProjectStatusBoard.md` is the heart of integration, ticketing, and change management. **All team members (backend, frontend, QA, etc.) are responsible for writing updates, issues, and decisions to this file as they occur.** The AI Project Manager (AIPM) agent is responsible for curating and maintaining the efficient format, ensuring focus on actionable information, and immediate archiving of resolved issues. It is not just a log, but a streamlined project communication and ticketing system designed for maximum efficiency.

### ProjectStatusBoard.md Format: Efficient Structure

**ProjectStatusBoard.md uses a streamlined format for maximum efficiency and clarity. The AIPM agent curates this file to maintain focus on actionable information.**

**Archiving Policy:**
- **Maximum 5 open issues** at any time (enforced by human PM)
- **Maximum 10 archived issues** in main file (older issues moved to monthly archives)
- **Immediate archiving** of resolved issues to maintain focus

### **Efficient Format Structure**

1. **Current Status (Top 5 Issues)**
   - Concise table with only active, actionable issues
   - Columns: ID, Area, Issue, Status, Owner, Priority

2. **Recent Decisions (Last 5)**
   - Bullet points with dates and brief summaries
   - Only major decisions that affect current work

3. **Test Results Summary**
   - Frontend/Backend test counts and status
   - E2E test status
   - Coverage percentages

4. **Next Milestones**
   - Numbered priority list with brief descriptions
   - Focus on immediate next steps

5. **Archive (Monthly)**
   - Grouped by month with completed items only
   - Reference issue IDs for traceability

### **Example Efficient Structure**

```markdown
# ProjectStatusBoard.md

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

## Archive (Monthly)
### 2024-07
- [RESOLVED] #100 MenuItem.price migration complete
- [RESOLVED] #99 Dashboard loading state fixed
```

**Benefits of This Structure:**
- ✅ **Focused**: Only actionable information visible
- ✅ **Scannable**: Quick overview of project health
- ✅ **Maintainable**: Easy to update and archive
- ✅ **Efficient**: Reduces cognitive load for team members

### How Contracts Work (in Practice)

1. **Human creates ai/ProductVision.md** with business plan, market analysis, and requirements
2. **AI Project Manager (AIPM) agent** reads ai/ProductVision.md and creates the initial contract
3. **Backend AI** implements APIs according to the contract
4. **Frontend AI** builds UI using the contract's specifications
5. **Both teams** update the contract as needed, with all changes and compliance tracked in ProjectStatusBoard.md
6. **AIPM agent** summarizes progress, triages blockers, and maintains the top-level summary in ProjectStatusBoard.md
7. **Human validates** that everything works together
8. **Contract drift, migrations, and compliance tasks are logged and resolved in ProjectStatusBoard.md**

---

## Setting Up Your Project

### Step 1: Start with a Real Business Plan

Begin with a detailed ai/ProductVision.md that includes:
- Market analysis and competitive review
- Target users and business goals
- User stories and feature list
- Technical requirements and architecture
- Data models and key algorithms
- Success metrics and risk assessment

### Step 2: Generate Foundation Files

Use this prompt with an AI Project Manager:

```
"Read ai/ProductVision.md and generate all foundational files for the project, including:
1. ai/API_CONTRACT.md - Detailed, living contract for all endpoints and data models
2. ai/DevelopmentPlan.md - Roadmap with phases and milestones  
3. ai/FrontEndStatus.md - Real progress tracking for frontend
4. ai/BackEndStatus.md - Real progress tracking for backend
5. ai/ProjectStatusBoard.md - Living ticketing, integration, and cross-team communication (to be curated by the AIPM agent)

Comment each file with its purpose and usage instructions.
If any requirements are unclear, ask for clarification."
```

### Step 3: Review and Refine

Check the generated files:
- ✅ Does the API contract cover all your features?
- ✅ Are the data models correct and contract-compliant?
- ✅ Do the phases make sense?
- ✅ Are the instructions and communication protocols clear?

---

## Working with AI Teams (Real-World Cycle)

### The Development Cycle

```
1. Update Contract (log changes in ProjectStatusBoard.md) → 2. Backend Implementation (log progress/blockers) → 3. Frontend Implementation (log progress/blockers) → 4. Test Integration (log E2E results, issues, and fixes) → 5. AIPM summarizes and archives → 6. Repeat
```

### Phase 1: Backend Development

**Prompt for Backend AI:**
```
"Implement the backend endpoints and logic as defined in the contract. Focus on [specific endpoints or features].
Update BackEndStatus.md with your progress and blockers.
Log any contract changes, migrations, or integration issues in ProjectStatusBoard.md.
Notify the AIPM agent of any blockers or decisions that require summary or escalation.
Provide mock data for any features not yet fully implemented.

**Testing Requirements:**
- Write unit tests for all backend endpoints and business logic you implement
- Test database operations and data validation
- Ensure authentication and permissions work correctly
- Update BackEndStatus.md with test results and coverage
- Log any test failures or issues in ProjectStatusBoard.md
- Run all tests before completing your work and report results"
```

**What Backend AI Should Do:**
- ✅ Implement all backend endpoints and business logic from the contract
- ✅ Add proper error handling and validation
- ✅ Create database models and migrations
- ✅ Add authentication and security
- ✅ Update BackEndStatus.md with progress and blockers
- ✅ Log all contract compliance, migrations, and integration issues in ProjectStatusBoard.md
- ✅ Notify the AIPM agent of any major issues or decisions
- ✅ Provide mock data for frontend to use
- ✅ Write unit tests for all backend endpoints and business logic
- ✅ Test database operations and data validation
- ✅ Update BackEndStatus.md with test results and coverage
- ✅ Log test failures or issues in ProjectStatusBoard.md

### Phase 2: Frontend Development

**Prompt for Frontend AI:**
```
"Build the frontend components using the endpoints and data models defined in the contract. Focus on [specific features].
Update FrontEndStatus.md with your progress and blockers.
Log any contract changes, migrations, or integration issues in ProjectStatusBoard.md.
Notify the AIPM agent of any blockers or decisions that require summary or escalation.
Use mock data for any unimplemented endpoints.
Ensure the UI is responsive and accessible.

**Testing Requirements:**
- Write unit tests for all UI components and client logic you create
- Test user interactions and form validation
- Ensure the interface works on different screen sizes and devices
- Update FrontEndStatus.md with test results and coverage
- Log any UI/UX issues or test failures in ProjectStatusBoard.md
- Run all tests before completing your work and report results"
```

**What Frontend AI Should Do:**
- ✅ Build UI components using the contract
- ✅ Handle loading states and error messages
- ✅ Make the interface responsive and accessible
- ✅ Update FrontEndStatus.md with progress and blockers
- ✅ Log all contract compliance, migrations, and integration issues in ProjectStatusBoard.md
- ✅ Notify the AIPM agent of any major issues or decisions
- ✅ Test with mock data when needed
- ✅ Write unit tests for all UI components and client logic
- ✅ Test user interactions and form validation
- ✅ Ensure the interface works on different screen sizes and devices
- ✅ Update FrontEndStatus.md with test results and coverage
- ✅ Log UI/UX issues or test failures in ProjectStatusBoard.md

### Phase 3: Integration Testing

**Prompt for Integration AI or AIPM:**
```
"Review the current state of the project. Check for any mismatches between frontend and backend implementations.
Update the contract if needed, and log all changes in ProjectStatusBoard.md.
Run end-to-end (E2E) tests and log results, issues, and fixes in ProjectStatusBoard.md.
Summarize current blockers, open issues, and decisions at the top of ProjectStatusBoard.md. Archive resolved issues as needed.

**Testing Requirements:**
- Run comprehensive E2E tests for all user workflows
- Test integration between frontend and backend components
- Verify contract compliance through testing
- Check performance and accessibility standards
- Coordinate testing between frontend and backend teams
- Log all test results, issues, and fixes in ProjectStatusBoard.md
- Ensure test coverage meets project requirements"
```

---

## Communication & Project Management

### The Role of the AI Project Manager (AIPM) Agent

- **Coordinates** all other agents (backend, frontend, QA, etc.)
- **Monitors** status files and ProjectStatusBoard.md
- **Curates and enforces** the efficient format of ProjectStatusBoard.md
- **Summarizes** progress, flags blockers, and ensures contract compliance
- **Maintains** the current status section in ProjectStatusBoard.md (top 5 issues, test results, next milestones)
- **Archives** resolved issues immediately to maintain focus
- **Notifies** the human PM of anything requiring strategic input

**Note:** All team members are responsible for writing to ProjectStatusBoard.md. The AIPM agent ensures the file remains focused, actionable, and efficient.

### ProjectStatusBoard.md: The Single Source of Truth

- **ProjectStatusBoard.md** is the canonical, up-to-date integration and decision log for the project.
- Only **major issues, blockers, contract changes, and integration bugs** are logged here.
- **Routine, low-level agent chatter** (e.g., "starting on X endpoint") is not logged—only what matters for integration and project health.
- **Efficient structure** ensures maximum readability and minimal cognitive load.

#### Example ProjectStatusBoard.md Structure

```markdown
# ProjectStatusBoard.md

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

## Archive (Monthly)
### 2024-07
- [RESOLVED] #100 MenuItem.price migration complete
- [RESOLVED] #99 Dashboard loading state fixed
```

### Communication Best Practices

- **Focus on actionable information:** The AIPM agent maintains only current, actionable issues in the top 5 status table.
- **Archive immediately:** Move resolved issues to archive immediately to maintain focus and reduce cognitive load.
- **Limit open issues:** The human project manager must ensure there are never more than 5 open issues in ProjectStatusBoard.md at any time.
- **Log only what matters:** Only major integration issues, contract changes, and blockers are logged. Routine progress is tracked in status files.
- **Efficient summaries:** Test results and milestones are summarized concisely for quick scanning.
- **Human oversight:** The human PM reviews ProjectStatusBoard.md regularly and intervenes as needed.

---

## Step-by-Step Example (Production-Grade)

Let's build a simple **Recipe Manager** app together.

### Step 1: Create ai/ProductVision.md

```markdown
# ai/ProductVision.md - Recipe Manager

## 1. Overview
A web app for storing and managing cooking recipes.

## 2. Market Analysis
- Review of existing solutions, gaps, and opportunities

## 3. User Stories
- As a user, I can create new recipes
- As a user, I can view my recipe list
- As a user, I can edit existing recipes
- As a user, I can delete recipes

## 4. Features
- Recipe CRUD (Create, Read, Update, Delete)
- Ingredient management
- Recipe search and filtering
- Responsive design

## 5. Technical Requirements
- Frontend: SvelteKit
- Backend: Node.js with SvelteKit
- Database: SQLite
- Authentication: Session-based
- E2E Testing: Playwright, with test data seeding/reset

## 6. Data Models
- Recipe: id, name, description, ingredients, created_at
- Ingredient: id, name, unit, cost_per_unit
- User: id, name, email, password_hash

## 7. API Endpoints
- POST /api/auth/login
- GET /api/recipes
- POST /api/recipes
- PUT /api/recipes/:id
- DELETE /api/recipes/:id
- GET /api/ingredients
- POST /api/ingredients
```

### Step 2: Generate Foundation Files

Use the AI Project Manager prompt to generate:
- ai/API_CONTRACT.md (living document)
- ai/DevelopmentPlan.md
- ai/FrontEndStatus.md (real log)
- ai/BackEndStatus.md (real log)
- ai/ProjectStatusBoard.md (living ticketing/integration system)

### Step 3: Backend Implementation

**Prompt:**
```
"Implement the core API endpoints for the Recipe Manager as defined in ai/API_CONTRACT.md.
Focus on:
- Authentication endpoints
- Recipe CRUD endpoints
- Ingredient endpoints

Update BackEndStatus.md with your progress and blockers.
Log all contract compliance, migrations (e.g., camelCase), and integration issues in ProjectStatusBoard.md.
Provide mock data for testing.
Ensure proper error handling and validation.

**Testing Requirements:**
- Write unit tests for all API endpoints you implement
- Test database operations and data validation
- Ensure authentication and permissions work correctly
- Update BackEndStatus.md with test results and coverage
- Log any test failures or issues in ProjectStatusBoard.md
- Run tests before completing your work and report results"
```

### Step 4: Frontend Implementation

**Prompt:**
```
"Build the frontend for the Recipe Manager using the endpoints defined in ai/API_CONTRACT.md.
Focus on:
- Login page
- Recipe list page
- Recipe creation/edit forms
- Responsive design

Update FrontEndStatus.md with your progress and blockers.
Log all contract compliance, migrations, and integration issues in ProjectStatusBoard.md.
Use mock data for testing.
Ensure good UX and accessibility.

**Testing Requirements:**
- Write unit tests for all React components you create
- Test user interactions and form validation
- Ensure responsive design works on different screen sizes
- Update FrontEndStatus.md with test results and coverage
- Log any UI/UX issues or test failures in ProjectStatusBoard.md
- Run tests before completing your work and report results"
```

### Step 5: Integration Testing

**Prompt:**
```
"Test the Recipe Manager application. Check:
- Can users log in?
- Can users create recipes?
- Can users view the recipe list?
- Can users edit recipes?
- Can users delete recipes?
- Is the UI responsive?

Run Playwright E2E tests, log results and issues in ProjectStatusBoard.md.
Identify any issues and provide fixes.

**Testing Requirements:**
- Run comprehensive E2E tests for all user workflows
- Test integration between frontend and backend components
- Verify contract compliance through testing
- Check performance and accessibility standards
- Coordinate testing between frontend and backend teams
- Log all test results, issues, and fixes in ProjectStatusBoard.md
- Ensure test coverage meets project requirements"
```

---

## Templates and Examples (Real-World)

### Template 1: API Contract Structure

```markdown
# ai/API_CONTRACT.md

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

## Svelte Stores
- **recipes**: `WritableStore<Recipe[]>` - Recipe data
- **user**: `WritableStore<User | null>` - Current user

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

### Template 2: Development Plan Structure

```markdown
# ai/DevelopmentPlan.md

## 1. Overview
[Project description]

## 2. Phases & Milestones

### Phase 1: Core Features ✅
- [x] User authentication
- [x] Basic CRUD operations
- [x] Database setup

### Phase 2: Advanced Features 🔄
- [ ] Search and filtering
- [ ] File uploads
- [ ] Advanced UI components
- [ ] Real-time, offline, mobile, and analytics features

### Phase 3: Polish & Production ✅
- [x] Responsive design
- [x] Error handling
- [x] Performance optimization

## 3. Deliverables
- [x] Working web application
- [x] API documentation
- [x] User guide
- [x] Playwright E2E tests with test data seeding/reset

## 4. References
- See ai/API_CONTRACT.md for technical details
- See ai/ProjectStatusBoard.md for workflow, integration, and ticketing
```

### Template 3: Status File Structure (Real Log Example)

```markdown
# ai/FrontEndStatus.md

## 2024-07-03 - PHASE 2 IN PROGRESS
- **Authentication UI**: Login/logout forms implemented
- **Recipe Management**: CRUD interface complete
- **Responsive Design**: Works on mobile and desktop
- **Accessibility**: WCAG 2.1 AA compliant
- **E2E Testing**: Playwright tests passing, test data reset before each run

### Technical Achievements
- ✅ User authentication forms
- ✅ Recipe list and detail views
- ✅ Create/edit recipe forms
- ✅ Responsive navigation
- ✅ Error handling and loading states
- ✅ Playwright E2E integration

### Blockers
- [ ] Data model migration to camelCase in progress
- [ ] Real-time updates not yet integrated

### Next Steps
1. Complete camelCase migration (see ProjectStatusBoard.md)
2. Integrate real-time features
3. Add advanced analytics widgets

## Blockers: See ProjectStatusBoard.md for all integration and migration issues
```

### Template 4: ProjectStatusBoard.md (Efficient Structure Example)

```markdown
# ai/ProjectStatusBoard.md

## Current Status (Top 5 Issues)
| ID | Area | Issue | Status | Owner | Priority |
|----|------|-------|--------|-------|----------|
| #101 | Frontend | Real-time UI not updating | Open | Frontend | High |
| #102 | Backend | Confirm camelCase endpoints | In Progress | Backend | Medium |

## Recent Decisions (Last 5)
- [2024-07-03] Contract change: MenuItem.price now integer (cents)
- [2024-07-03] Frontend camelCase migration complete
- [2024-07-03] E2E test data seeding implemented

## Test Results Summary
- Frontend: 45/45 passing (100%)
- Backend: 23/23 passing (100%)
- E2E: 8/8 passing (100%)

## Next Milestones
1. Priority 1: Complete real-time feature integration
2. Priority 2: Verify all endpoints return camelCase
3. Priority 3: Implement analytics dashboard

## Archive (Monthly)
### 2024-07
- [RESOLVED] #100 Frontend camelCase migration complete
- [RESOLVED] #99 E2E test data seeding implemented
- [RESOLVED] #98 MenuItem.price integer migration
```

### Template 5: AI Team Prompts (with ProjectStatusBoard.md)

**Backend AI Prompt:**
```
# Backend AI Agent

## Context:
- Refer to ai/API_CONTRACT.md for all endpoints and data models
- Update BackEndStatus.md with your progress and blockers
- Log all contract compliance, migrations, and integration issues in ProjectStatusBoard.md
- Coordinate with frontend team via the contract file and ProjectStatusBoard.md

## Current Task:
Implement the [specific endpoints] as defined in ai/API_CONTRACT.md.

## Requirements:
1. Follow the exact request/response formats in the contract
2. Add proper error handling and validation
3. Include authentication where required
4. Provide mock data for testing
5. Update BackEndStatus.md with progress and blockers
6. Log all contract compliance, migrations, and integration issues in ProjectStatusBoard.md

## Questions:
- Are there any unclear requirements in the contract?
- Do you need additional endpoints not in the contract?
```

**Frontend AI Prompt:**
```
# Frontend AI Agent

## Context:
- Refer to ai/API_CONTRACT.md for all available endpoints and data models
- Update FrontEndStatus.md with your progress and blockers
- Log all contract compliance, migrations, and integration issues in ProjectStatusBoard.md
- Coordinate with backend team via the contract file and ProjectStatusBoard.md

## Current Task:
Build the [specific features] using the endpoints defined in ai/API_CONTRACT.md.

## Requirements:
1. Use only endpoints defined in the contract
2. Handle loading states and errors gracefully
3. Make the UI responsive and accessible
4. Use mock data for unimplemented features
5. Update FrontEndStatus.md with progress and blockers
6. Log all contract compliance, migrations, and integration issues in ProjectStatusBoard.md

## Questions:
- Do you need additional data fields not in the contract?
- Are there any UI requirements not specified?
```

---

## Common Problems and Solutions (with Real-World Fixes)

### Problem 1: Frontend Can't Connect to Backend

**Symptoms:**
- API calls return 404 errors
- Data doesn't load in the UI
- Console shows connection errors

**Solution:**
1. Check that backend endpoints match the API contract exactly
2. Verify the API contract is up to date
3. Ensure both teams are using the same contract version
4. Test endpoints manually (using tools like Postman)
5. Log all integration issues and fixes in ProjectStatusBoard.md

**Prevention:**
- Always update the contract before implementing new features
- Use the contract as the single source of truth
- Regular integration testing and E2E runs
- Track all issues and fixes in ProjectStatusBoard.md

### Problem 2: Data Format Mismatches

**Symptoms:**
- UI shows incorrect data
- Forms don't submit properly
- Errors about missing fields

**Solution:**
1. Compare frontend expectations with backend responses
2. Update the API contract to match actual data
3. Ensure both teams use the same data models and naming conventions (e.g., camelCase)
4. Add validation on both frontend and backend
5. Log all migrations and compliance tasks in ProjectStatusBoard.md

**Prevention:**
- Define data models clearly in the contract
- Use TypeScript interfaces for type safety
- Regular contract reviews and migrations tracked in ProjectStatusBoard.md

### Problem 3: Missing Features

**Symptoms:**
- Planned features not implemented
- Users can't perform expected actions
- Incomplete functionality

**Solution:**
1. Review the ai/DevelopmentPlan.md against current state
2. Check if features are in the API contract
3. Assign missing features to appropriate teams
4. Update status files with progress and blockers
5. Log all blockers and resolutions in ProjectStatusBoard.md

**Prevention:**
- Clear feature requirements in ai/ProductVision.md
- Regular status updates
- Contract reviews for completeness
- Use ProjectStatusBoard.md as the single source of truth for blockers and resolutions

### Problem 4: Poor Performance

**Symptoms:**
- Slow page loads
- Unresponsive UI
- High server load

**Solution:**
1. Optimize database queries
2. Add caching where appropriate
3. Optimize frontend bundle size
4. Add loading states and pagination
5. Log all performance issues and fixes in ProjectStatusBoard.md

**Prevention:**
- Performance requirements in ai/ProductVision.md
- Regular performance testing and E2E runs
- Monitoring and optimization
- Track all performance issues and fixes in ProjectStatusBoard.md

---

## Testing Strategy for AI Agent Teams

### Why Testing Matters

Testing ensures your application works correctly and prevents bugs from reaching users. In AI agent development, testing is especially important because:
- **Multiple teams** work on different parts of the application
- **Integration issues** are common when teams work separately
- **Contract compliance** must be validated continuously
- **Quality assurance** prevents costly fixes later

### Simple Testing Approach

Think of testing like checking your work before turning it in:

1. **Unit Tests** (70% of testing) - Check individual pieces work correctly
2. **Integration Tests** (20% of testing) - Check pieces work together
3. **E2E Tests** (10% of testing) - Check the whole application works for users

### Testing Tools (Simple Setup)

**For Unit & Integration Tests:**
- **Vitest** - Fast, simple testing framework
- **React Testing Library** - Test React components like users would use them
- **Supertest** - Test API endpoints

**For E2E Tests:**
- **Playwright** - Test the full application in real browsers

### How AI Agents Should Test

#### Backend AI Agent Testing Responsibilities

**What to Test:**
- ✅ All API endpoints work correctly
- ✅ Database operations succeed and fail properly
- ✅ Authentication and permissions work
- ✅ Data validation prevents bad input
- ✅ Error messages are helpful

**How to Test:**
```typescript
// Example: Test user registration
describe('User Registration', () => {
  it('should create new user with valid data', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      })
    
    expect(response.status).toBe(200)
    expect(response.body.user.email).toBe('test@example.com')
  })

  it('should reject duplicate email', async () => {
    // Test duplicate email handling
  })
})
```

**Communication:**
- Update BackEndStatus.md with test results
- Log test failures in ProjectStatusBoard.md
- Notify AIPM if tests reveal contract issues

#### Frontend AI Agent Testing Responsibilities

**What to Test:**
- ✅ Components display correctly
- ✅ Forms validate input properly
- ✅ User interactions work (clicks, typing, etc.)
- ✅ Loading states and error messages show
- ✅ Responsive design works on different screen sizes

**How to Test:**
```typescript
// Example: Test login form
describe('LoginForm', () => {
  it('should show error for invalid email', async () => {
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })
})
```

**Communication:**
- Update FrontEndStatus.md with test results
- Log UI/UX issues in ProjectStatusBoard.md
- Notify AIPM if tests reveal design problems

#### AIPM Agent Testing Responsibilities

**What to Test:**
- ✅ End-to-end user workflows work
- ✅ Frontend and backend integrate properly
- ✅ Performance meets requirements
- ✅ Accessibility standards are met

**How to Test:**
```typescript
// Example: Test complete user journey
test('user can register, login, and create a todo', async ({ page }) => {
  // 1. Register
  await page.goto('/register')
  await page.fill('[data-testid="email"]', 'test@example.com')
  await page.fill('[data-testid="password"]', 'password123')
  await page.click('[data-testid="register-button"]')
  
  // 2. Login
  await page.goto('/login')
  await page.fill('[data-testid="email"]', 'test@example.com')
  await page.fill('[data-testid="password"]', 'password123')
  await page.click('[data-testid="login-button"]')
  
  // 3. Create todo
  await page.click('[data-testid="create-todo"]')
  await page.fill('[data-testid="todo-title"]', 'Test Todo')
  await page.click('[data-testid="save-todo"]')
  
  // 4. Verify
  await expect(page.locator('[data-testid="todo-list"]')).toContainText('Test Todo')
})
```

**Communication:**
- Run E2E tests after major features are complete
- Log integration issues in ProjectStatusBoard.md
- Coordinate testing between teams
- Ensure contract compliance through testing

### Testing Communication Protocol

#### Daily Testing Workflow

1. **Before Starting Work:**
   - Run existing tests to ensure nothing is broken
   - Check ProjectStatusBoard.md for known issues

2. **While Developing:**
   - Write tests for new features
   - Run tests frequently to catch issues early
   - Update status files with test results

3. **After Completing Work:**
   - Run full test suite
   - Update status files with results
   - Log any issues in ProjectStatusBoard.md

#### Test Status Updates

**In Status Files (FrontEndStatus.md / BackEndStatus.md):**
```markdown
### Testing Status
- ✅ Unit tests: 15/15 passing
- ✅ Integration tests: 8/8 passing
- ❌ E2E tests: 2/3 passing (login flow failing)
- 📊 Code coverage: 85%

### Test Issues
- [ ] Login form validation not working on mobile
- [ ] API timeout on slow connections
```

**In ProjectStatusBoard.md:**
```markdown
| #107 | 2024-12-19 | Testing | Login E2E test failing on mobile | Open | Frontend | Medium | Mobile responsive issue |
```

### Simple Testing Setup

#### Step 1: Install Testing Tools
```bash
# Unit & Integration tests
npm install -D vitest @testing-library/react @testing-library/jest-dom

# E2E tests
npm install -D @playwright/test
```

#### Step 2: Add Test Scripts to package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:coverage": "vitest --coverage"
  }
}
```

#### Step 3: Create Basic Test Files
```
tests/
├── unit/
│   ├── components/
│   └── api/
├── integration/
└── e2e/
```

### Testing Best Practices

#### ✅ Do:
- Write tests for critical user workflows first
- Test both success and failure cases
- Use descriptive test names that explain what you're testing
- Keep tests simple and focused
- Run tests before committing code
- Update tests when you change features

#### ❌ Don't:
- Skip testing because you're in a hurry
- Write tests that are too complex to understand
- Test implementation details instead of behavior
- Forget to test error cases
- Ignore test failures

### Testing Checklist for Each Feature

**Before Starting Development:**
- [ ] Understand what the feature should do
- [ ] Plan how to test the feature
- [ ] Check if existing tests need updates

**During Development:**
- [ ] Write tests as you build the feature
- [ ] Run tests frequently
- [ ] Fix failing tests immediately

**After Completing Development:**
- [ ] Run all tests to ensure nothing broke
- [ ] Update status files with test results
- [ ] Log any issues in ProjectStatusBoard.md
- [ ] Notify other teams if integration testing is needed

### Common Testing Scenarios

#### Authentication Testing
- User can register with valid data
- User cannot register with invalid data
- User can login with correct credentials
- User cannot login with wrong credentials
- User can logout successfully

#### Data Management Testing
- User can create new items
- User can edit existing items
- User can delete items
- User cannot access other users' data
- Data validation prevents bad input

#### User Interface Testing
- Forms work correctly
- Error messages are helpful
- Loading states show during operations
- Responsive design works on mobile
- Accessibility features work

### Testing Troubleshooting

#### If Tests Are Failing:
1. **Check the error message** - it usually tells you what's wrong
2. **Run tests one at a time** to isolate the problem
3. **Check if you changed something** that affects the test
4. **Ask for help** - log the issue in ProjectStatusBoard.md

#### If Tests Are Slow:
1. **Run only the tests you need** during development
2. **Use test databases** that are separate from development
3. **Mock external services** when possible
4. **Run tests in parallel** when safe to do so

---

## Best Practices (Evolved)

### 1. Contract Management

✅ **Do:**
- Keep the API contract as the single source of truth (living document)
- Update the contract before implementing new features
- Review the contract regularly for accuracy
- Use clear, consistent naming conventions (e.g., camelCase)
- Log all contract changes, migrations, and compliance tasks in ProjectStatusBoard.md

❌ **Don't:**
- Implement features without updating the contract
- Let the contract become outdated
- Use inconsistent data formats
- Skip contract reviews or fail to log changes

### 2. Team Coordination

✅ **Do:**
- Update status files after each session with real progress and blockers
- Communicate changes through the contract and ProjectStatusBoard.md
- Test integration regularly with Playwright E2E and log results
- Keep sessions focused on specific features and log all blockers

❌ **Don't:**
- Work on features not in the contract
- Skip status updates
- Assume the other team knows your changes
- Mix multiple features in one session

### 3. Quality Assurance

✅ **Do:**
- Test features after implementation
- Validate against the contract
- Check for accessibility and responsiveness
- Review code quality and security
- Require Playwright E2E tests and test data seeding/reset
- Log all test results and issues in ProjectStatusBoard.md

❌ **Don't:**
- Skip testing
- Ignore contract violations
- Overlook user experience
- Neglect security considerations

### 4. Human Oversight

✅ **Do:**
- Review AI-generated code
- Make strategic decisions about features
- Validate that requirements are met
- Guide the development process
- Use ProjectStatusBoard.md as the single source of truth for integration and blockers

❌ **Don't:**
- Let AI make all decisions
- Skip human validation
- Ignore business requirements
- Forget about user needs

---

## Next Steps

### For Beginners

1. **Start Small**: Begin with a simple project to learn the process
2. **Follow Templates**: Use the provided templates exactly
3. **Practice Regularly**: Build multiple projects to improve skills
4. **Learn from Mistakes**: Document what goes wrong and how to fix it in ProjectStatusBoard.md

### For Intermediate Developers

1. **Customize the Process**: Adapt templates to your specific needs
2. **Add Automation**: Create scripts for contract validation and E2E test data seeding
3. **Expand Teams**: Add more AI agents for complex projects
4. **Improve Quality**: Focus on testing and performance, log all issues in ProjectStatusBoard.md

### For Advanced Developers

1. **Create Custom AI Agents**: Build specialized agents for your domain
2. **Develop Tools**: Create tools to automate the process
3. **Share Knowledge**: Document and share your improvements
4. **Contribute**: Help improve the methodology for the community
5. **Start from a real business plan and market analysis**
6. **Treat advanced features (real-time, offline, mobile, analytics) as first-class, not afterthoughts**

### Resources

- **GitHub**: Look for open-source projects using similar approaches
- **Communities**: Join AI development communities and forums
- **Documentation**: Read about multi-agent systems and coordination
- **Practice**: Build real projects and share your experiences

---

## Conclusion

AI Agent Full-Stack Development is a powerful approach that can help you build better applications faster. By using multiple AI agents with clear contracts, robust project management, and disciplined communication, you can avoid the common pitfalls of AI-assisted development and create production-ready applications.

The key is to:
1. **Start with a real business plan and market analysis**
2. **Use a living contract and log all changes in ProjectStatusBoard.md**
3. **Test integration regularly with Playwright E2E and test data seeding/reset**
4. **Maintain human oversight and log all blockers and resolutions**
5. **Treat advanced features as first-class, not afterthoughts**
6. **Iterate and improve, using ProjectStatusBoard.md as your single source of truth for integration**
7. **Leverage the AIPM agent for coordination, summary, and communication discipline**

Happy building! 🚀

---

*This guide is a living document. As AI technology evolves and new patterns emerge, we'll update it to reflect the latest best practices for AI agent full-stack development.*

### Role-Specific Context Primer Variants

> **Disclaimer:** These prompts are starting points. You should modify them based on agent performance, project needs, or lessons learned during development.

#### Backend AI Agent Context Primer

```
# Project Context Primer (Backend)

You are the Backend AI Agent for this project.

- Refer to ai/API_CONTRACT.md for all project workflow, file usage, and issue management policies.
- Refer to ai/TestingStrategy.md for comprehensive testing guidelines, examples, and best practices.
- Refer to ai/GitVersionControlStrategy.md for Git workflow, branching strategy, and commit conventions.
- Routine progress and technical details should be tracked in ai/BackEndStatus.md.
- Always check ProjectStatusBoard.md for the latest open issues before starting work.

**Your role:** Backend
**Your scope:** Backend APIs, database, integration, testing, and version control.

**Testing Responsibilities:**
- Write unit tests for all backend endpoints and business logic
- Test database operations and data validation
- Ensure authentication and permissions work correctly
- Update BackEndStatus.md with test results and coverage
- Log test failures in ProjectStatusBoard.md
- Follow the testing patterns and examples in ai/TestingStrategy.md

**Git Responsibilities:**
- Work on feature branches (feature/backend-[description])
- Use conventional commit messages (feat(backend): description)
- Update status files with Git information
- Create pull requests for all changes
- Follow the Git workflow in ai/GitVersionControlStrategy.md

Before starting any task, confirm you understand the workflow and check ai/API_CONTRACT.md, ai/TestingStrategy.md, ai/GitVersionControlStrategy.md, and ProjectStatusBoard.md for relevant issues or blockers.

---

*After this context, I will give you a specific task to work on.*
```

#### Frontend AI Agent Context Primer

```
# Project Context Primer (Frontend)

You are the Frontend AI Agent for this project.

- Refer to ai/API_CONTRACT.md for all project workflow, file usage, and issue management policies.
- Refer to ai/TestingStrategy.md for comprehensive testing guidelines, examples, and best practices.
- Refer to ai/GitVersionControlStrategy.md for Git workflow, branching strategy, and commit conventions.
- Routine progress and technical details should be tracked in ai/FrontEndStatus.md.
- Always check ProjectStatusBoard.md for the latest open issues before starting work.

**Your role:** Frontend
**Your scope:** Frontend UI, client logic, integration, testing, and version control.

**Testing Responsibilities:**
- Write unit tests for all UI components and client logic
- Test user interactions and form validation
- Ensure the interface works on different screen sizes and devices
- Update FrontEndStatus.md with test results and coverage
- Log UI/UX issues or test failures in ProjectStatusBoard.md
- Follow the testing patterns and examples in ai/TestingStrategy.md

**Git Responsibilities:**
- Work on feature branches (feature/frontend-[description])
- Use conventional commit messages (feat(frontend): description)
- Update status files with Git information
- Create pull requests for all changes
- Follow the Git workflow in ai/GitVersionControlStrategy.md

Before starting any task, confirm you understand the workflow and check ai/API_CONTRACT.md, ai/TestingStrategy.md, ai/GitVersionControlStrategy.md, and ProjectStatusBoard.md for relevant issues or blockers.

---

*After this context, I will give you a specific task to work on.*
```

#### AI Project Manager (AIPM) Agent Context Primer

```
# Project Context Primer (AIPM)

You are the AI Project Manager (AIPM) Agent for this project.

- Refer to ai/API_CONTRACT.md for all project workflow, file usage, and issue management policies.
- Refer to ai/TestingStrategy.md for comprehensive testing guidelines, examples, and best practices.
- Always check ProjectStatusBoard.md for the latest open issues before starting work.

**Your role:** AIPM (AI Project Manager)
**Your scope:** Project coordination, summary, file curation, and testing coordination.

**Testing Responsibilities:**
- Run comprehensive E2E tests for all user workflows
- Test integration between frontend and backend components
- Verify contract compliance through testing
- Check performance and accessibility standards
- Coordinate testing between frontend and backend teams
- Log all test results, issues, and fixes in ProjectStatusBoard.md
- Ensure test coverage meets project requirements
- Follow the testing patterns and examples in ai/TestingStrategy.md

Before starting any task, confirm you understand the workflow and check ai/API_CONTRACT.md, ai/TestingStrategy.md, and ProjectStatusBoard.md for relevant issues or blockers.

---

*After this context, I will give you a specific task to work on.*
``` 