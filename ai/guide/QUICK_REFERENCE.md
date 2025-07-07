# AI Agent Quick Reference Card

## Essential Files
- @API_CONTRACT.md - Single source of truth for endpoints & data models
- @ProjectStatusBoard.md - Integration & ticketing (max 5 issues, 200 lines)
- @FrontEndStatus.md / @BackEndStatus.md - Team progress logs
- @TestingStrategy.md - Testing guidelines & examples
- @GitVersionControlStrategy.md - Git workflow & conventions

## Context Primer (Paste at start of each conversation)
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

## Development Cycle
```
Update Contract → Backend Implementation → Frontend Implementation → 
Integration Testing → AIPM Summary → Repeat
```

## Team Responsibilities

### Backend AI
- Implement endpoints from @API_CONTRACT.md
- Write unit tests for all endpoints & business logic
- Update @BackEndStatus.md with progress & blockers
- Log contract compliance, migrations, integration issues in @ProjectStatusBoard.md

### Frontend AI
- Build UI using endpoints from @API_CONTRACT.md
- Write unit tests for all UI components & client logic
- Update @FrontEndStatus.md with progress & blockers
- Log contract compliance, migrations, integration issues in @ProjectStatusBoard.md

### AIPM Agent
- Coordinate all other agents
- Curate @ProjectStatusBoard.md format & archives
- Run E2E tests & log results
- Summarize progress, flag blockers, ensure contract compliance

## @ProjectStatusBoard.md Structure
```markdown
## Current Status (Top 5 Issues)
| ID | Area | Issue | Status | Owner | Priority |

## Recent Decisions (Last 5)
- [Date] Brief summary

## Test Results Summary
- Frontend: X/Y passing (Z%)
- Backend: X/Y passing (Z%)
- E2E: X/Y passing (Z%)

## Next Milestones
1. Priority 1: Description
2. Priority 2: Description

## Archive (Line-Count Based)
- [RESOLVED] #ID Description
```

## Testing Requirements
- **Unit Tests (70%)**: Individual pieces work correctly
- **Integration Tests (20%)**: Pieces work together
- **E2E Tests (10%)**: Whole application works for users
- **Tools**: Vitest, React Testing Library, Playwright
- **Test Data**: Seeding/reset before each E2E run

## Git Workflow
- Feature branches: `feature/backend-[description]` / `feature/frontend-[description]`
- Conventional commits: `feat(backend): description` / `feat(frontend): description`
- Pull requests for all changes

## Common Issues & Solutions
1. **Integration Issues**: Check API contract matches exactly
2. **Data Mismatches**: Ensure consistent naming (camelCase)
3. **Missing Features**: Review DevelopmentPlan.md vs current state
4. **Performance**: Optimize queries, add caching, check bundle size

## Best Practices
- ✅ Keep contract as single source of truth
- ✅ Update status files after each session
- ✅ Test features after implementation
- ✅ Log all issues in @ProjectStatusBoard.md
- ❌ Don't implement without updating contract
- ❌ Don't skip status updates
- ❌ Don't ignore contract violations 