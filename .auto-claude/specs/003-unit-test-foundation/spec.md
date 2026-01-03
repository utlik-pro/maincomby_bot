# Specification: Unit Test Foundation

## Overview

This task establishes automated testing infrastructure from scratch for a React/TypeScript project that currently has zero test coverage. It includes configuring Vitest and React Testing Library, implementing initial tests for critical business logic (XP calculation, rank progression) and UI components (ProfileCard, EventCard), setting up integration tests for Supabase authentication, enabling code coverage reporting, and integrating tests into the CI pipeline to block deployments with failing tests.

## Workflow Type

**Type**: feature

**Rationale**: This task introduces a new capability (automated testing) to the project. While it doesn't add user-facing features, it establishes critical infrastructure and development workflows. The "feature" classification fits because we're building a complete testing system from the ground up, including configuration, tooling, examples, and CI integration.

## Task Scope

### Services Involved
- **main** (primary) - React/TypeScript frontend application requiring test coverage

### This Task Will:
- [ ] Install and configure Vitest as the test runner with Vite integration
- [ ] Install and configure React Testing Library for component testing
- [ ] Create test infrastructure (config files, setup files, test scripts)
- [ ] Implement unit tests for XP calculation and rank progression business logic
- [ ] Implement component tests for ProfileCard and EventCard UI components
- [ ] Implement integration tests for Supabase authentication flow
- [ ] Configure code coverage reporting with v8 provider
- [ ] Integrate tests into CI pipeline to run on pull requests

### Out of Scope:
- Testing existing features beyond the specified components (ProfileCard, EventCard)
- E2E tests with browser automation (Playwright/Cypress)
- Visual regression testing
- Performance/load testing
- Testing the Telegram bot backend (if separate from miniapp)
- Achieving 100% code coverage (establishing foundation and examples)

## Service Context

### main

**Tech Stack:**
- Language: TypeScript
- Framework: React 18.3.1
- Build Tool: Vite 5.4.2
- Styling: Tailwind CSS
- State Management: Zustand
- Backend: Supabase (auth, database)
- Additional: React Query, Framer Motion, React Router

**Entry Point:** `src/App.tsx`

**How to Run:**
```bash
npm run dev
```

**Port:** 3000

**Key Directories:**
- `src/` - All source code including components, utilities, and business logic

## Files to Modify

| File | Service | What to Change |
|------|---------|---------------|
| `package.json` | main | Add test dependencies (vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, happy-dom, @vitest/coverage-v8) and test scripts (`test`, `test:coverage`, `test:ui`) |
| `vitest.config.ts` | main | Create new config file with happy-dom environment, test globals, setup file reference, and coverage configuration |
| `src/test/setup.ts` | main | Create new setup file to import @testing-library/jest-dom for custom matchers |
| `.github/workflows/*.yml` | main | Add test execution step to CI pipeline (or create new workflow if none exists) |

## Files to Create

| File | Purpose | Details |
|------|---------|---------|
| `vitest.config.ts` | Vitest configuration | Define test environment, globals, setup files, coverage settings |
| `src/test/setup.ts` | Test setup | Import jest-dom matchers for enhanced assertions |
| `src/utils/__tests__/xp.test.ts` | Unit tests | Test XP calculation logic (assumed location based on typical patterns) |
| `src/utils/__tests__/ranks.test.ts` | Unit tests | Test rank progression system |
| `src/components/__tests__/ProfileCard.test.tsx` | Component tests | Test ProfileCard rendering and interactions |
| `src/components/__tests__/EventCard.test.tsx` | Component tests | Test EventCard rendering and interactions |
| `src/services/__tests__/auth.test.ts` | Integration tests | Test Supabase authentication flow with mocking |

**Note:** Exact file paths for XP/rank logic, ProfileCard, EventCard, and auth will need to be discovered during implementation by searching the codebase.

## Files to Reference

Since this is a greenfield testing setup with no existing test patterns in the project, reference patterns will come from external documentation and best practices:

| Source | Pattern to Copy |
|--------|----------------|
| Vitest Official Docs | Configuration structure, test API usage |
| React Testing Library Docs | Component testing patterns, query priorities (getByRole > getByText > getByTestId) |
| Testing Library User Event v14+ | Async user interaction patterns with `userEvent.setup()` |

## Patterns to Follow

### Vitest Configuration Pattern

**vitest.config.ts structure:**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.ts',
        '**/*.test.tsx'
      ]
    }
  }
})
```

**Key Points:**
- `environment: 'happy-dom'` enables DOM APIs (required for React Testing Library)
- `globals: true` allows using `describe`, `it`, `expect` without imports
- `setupFiles` registers jest-dom matchers globally
- Coverage config uses v8 provider (faster than istanbul)

### React Testing Library Component Test Pattern

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileCard } from '../ProfileCard'

describe('ProfileCard', () => {
  it('renders user name and rank', () => {
    render(<ProfileCard name="TestUser" rank="Gold" />)

    expect(screen.getByText('TestUser')).toBeInTheDocument()
    expect(screen.getByText('Gold')).toBeInTheDocument()
  })

  it('handles button click interactions', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<ProfileCard onEdit={handleClick} />)

    await user.click(screen.getByRole('button', { name: /edit/i }))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

**Key Points:**
- Use `screen` queries over destructured render results
- Prefer `getByRole` for accessibility-first testing
- **MUST call `userEvent.setup()`** before interactions (v14+ requirement)
- **All userEvent methods are async** - use `await`
- Use `vi.fn()` for mocking functions

### Supabase Auth Integration Test Pattern

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn()
}))

describe('Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully authenticates user', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({
      data: { user: { id: '123', email: 'test@example.com' } },
      error: null
    })

    vi.mocked(createClient).mockReturnValue({
      auth: { signInWithPassword: mockSignIn }
    } as any)

    // Test auth flow
    const result = await authService.signIn('test@example.com', 'password')

    expect(mockSignIn).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    })
    expect(result.user).toBeDefined()
  })
})
```

**Key Points:**
- Mock Supabase client at module level with `vi.mock()`
- Use `vi.mocked()` for type-safe mock access
- Mock resolved values for async operations
- Clear mocks between tests with `beforeEach`

## Requirements

### Functional Requirements

1. **Test Infrastructure Setup**
   - Description: Install Vitest, React Testing Library, and related testing utilities. Configure test environment with happy-dom for DOM APIs.
   - Acceptance: `npm run test` executes tests successfully, coverage reporting works

2. **Unit Tests for Business Logic**
   - Description: Implement tests for XP calculation and rank progression systems to validate game mechanics
   - Acceptance: Tests cover edge cases (zero XP, boundary ranks, overflow scenarios), all tests pass

3. **Component Tests for UI**
   - Description: Test ProfileCard and EventCard components for rendering, user interactions, and state changes
   - Acceptance: Tests verify correct rendering with various props, interaction handlers fire correctly, accessibility queries work

4. **Integration Tests for Authentication**
   - Description: Test Supabase authentication flow including sign in, sign out, and session management
   - Acceptance: Tests mock Supabase client correctly, verify auth state changes, handle error cases

5. **CI Integration**
   - Description: Configure CI pipeline to run tests on pull requests and block merges if tests fail
   - Acceptance: Tests run automatically on PR creation, pipeline fails if any test fails, results visible in PR checks

6. **Code Coverage Reporting**
   - Description: Enable coverage collection and reporting to track test coverage metrics
   - Acceptance: `npm run test:coverage` generates coverage report, HTML report viewable locally

### Edge Cases

1. **XP Calculation Edge Cases** - Handle negative inputs, zero values, very large numbers (overflow protection), decimal precision
2. **Rank Progression Boundaries** - Test transitions at exact threshold values, minimum/maximum rank limits, invalid rank inputs
3. **Component Prop Variations** - Handle missing optional props, null/undefined values, extreme string lengths, special characters in user input
4. **Authentication Error Scenarios** - Network failures, invalid credentials, expired tokens, rate limiting, concurrent auth requests
5. **DOM Environment Limitations** - Features requiring real browser APIs not available in happy-dom (localStorage, WebSockets) may need special mocking

## Implementation Notes

### DO
- **Follow installation order**: Install dependencies → Create config files → Write setup file → Add test scripts → Write tests
- **Start with unit tests** (XP, ranks) for quick wins - pure functions are easiest to test
- **Use accessibility queries first**: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- **Always await userEvent** interactions (v14+ breaking change)
- **Mock Supabase at module level** using `vi.mock()` for integration tests
- **Co-locate tests** with source files using `__tests__` folders or `.test.ts` suffixes
- **Write descriptive test names** that explain the behavior being tested
- **Test user-facing behavior**, not implementation details
- **Use `queryBy*`** when expecting elements NOT to exist (returns null instead of throwing)

### DON'T
- **Don't use `fireEvent`** - prefer `userEvent` for realistic interactions
- **Don't test implementation details** - focus on user-observable behavior
- **Don't forget `userEvent.setup()`** - required in v14+
- **Don't mock React Testing Library** - it's already a test utility
- **Don't aim for 100% coverage initially** - focus on critical paths
- **Don't skip async/await** on userEvent calls - will cause race conditions
- **Don't use `getByTestId`** as first choice - prefer semantic queries
- **Don't create complex test fixtures** in first iteration - start simple

## Development Environment

### Install Dependencies

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event happy-dom @vitest/coverage-v8
```

### Create Configuration Files

```bash
# Create Vitest config
touch vitest.config.ts

# Create test setup directory and file
mkdir -p src/test
touch src/test/setup.ts
```

### Add Test Scripts to package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Start Development Server

```bash
npm run dev
```

### Service URLs
- Frontend Application: http://localhost:3000
- Vitest UI (when running): http://localhost:51204 (default port)

### Required Environment Variables

For running tests with Supabase mocking:
- `VITE_SUPABASE_URL`: Supabase project URL (mocked in integration tests)
- `VITE_SUPABASE_ANON_KEY`: Supabase anonymous key (mocked in integration tests)

**Note:** Integration tests should mock Supabase client, so actual credentials not required for test execution.

## Success Criteria

The task is complete when:

1. [ ] Vitest and React Testing Library configured and runnable (`npm run test` works)
2. [ ] Test scripts added to package.json (`test`, `test:coverage`, `test:ui`)
3. [ ] Unit tests written and passing for XP calculation logic
4. [ ] Unit tests written and passing for rank progression logic
5. [ ] Component tests written and passing for ProfileCard
6. [ ] Component tests written and passing for EventCard
7. [ ] Integration tests written and passing for Supabase authentication flow
8. [ ] Code coverage reporting enabled and functional
9. [ ] CI pipeline configured to run tests on pull requests
10. [ ] All tests pass with no console errors or warnings
11. [ ] Coverage report shows meaningful coverage of tested modules
12. [ ] Test examples demonstrate patterns for future contributors

## QA Acceptance Criteria

**CRITICAL**: These criteria must be verified by the QA Agent before sign-off.

### Unit Tests

| Test | File | What to Verify |
|------|------|----------------|
| XP calculation basic cases | `src/utils/__tests__/xp.test.ts` | Calculates XP correctly for valid inputs, handles edge cases (0, negative, large numbers) |
| Rank progression logic | `src/utils/__tests__/ranks.test.ts` | Correctly determines rank from XP, handles boundary values, returns expected rank names |

### Component Tests

| Component | File | What to Verify |
|-----------|------|----------------|
| ProfileCard rendering | `src/components/__tests__/ProfileCard.test.tsx` | Renders user data correctly, handles missing props gracefully, displays rank information |
| ProfileCard interactions | `src/components/__tests__/ProfileCard.test.tsx` | Click handlers fire correctly, user events work as expected |
| EventCard rendering | `src/components/__tests__/EventCard.test.tsx` | Renders event data correctly, formats dates properly, displays correct icons/badges |
| EventCard interactions | `src/components/__tests__/EventCard.test.tsx` | Handles user interactions (RSVP, share, etc.) |

### Integration Tests

| Test | Services | What to Verify |
|------|----------|----------------|
| Supabase sign in flow | Supabase Auth ↔ App State | Mocks Supabase client correctly, auth state updates on sign in, error handling works |
| Supabase sign out flow | Supabase Auth ↔ App State | Session cleared on sign out, UI state resets appropriately |
| Auth error handling | Supabase Auth ↔ App State | Invalid credentials handled, network errors caught, error messages displayed |

### Configuration Verification

| Check | Command | Expected |
|-------|---------|----------|
| Vitest runs | `npm run test` | Tests execute without errors, summary shows passed tests |
| Coverage generates | `npm run test:coverage` | Coverage report created in `coverage/` directory, metrics displayed in terminal |
| Vitest UI works | `npm run test:ui` | UI server starts, accessible in browser |
| Config file valid | `cat vitest.config.ts` | Contains environment, globals, setupFiles, coverage config |
| Setup file valid | `cat src/test/setup.ts` | Imports @testing-library/jest-dom |

### CI Pipeline Verification

| Check | How to Verify | Expected |
|-------|---------------|----------|
| Tests run on PR | Create test PR, check Actions tab | Workflow executes test command |
| Failed tests block merge | Create PR with failing test, attempt merge | CI fails, merge blocked (if branch protection enabled) |
| Test results visible | Check PR checks section | Test results displayed with pass/fail status |

### Code Quality Checks

| Check | What to Verify | How |
|-------|---------------|-----|
| No console errors | Run `npm run test` | No errors in test output |
| No warnings | Run `npm run test` | No deprecation or usage warnings |
| Tests are deterministic | Run `npm run test` multiple times | Same results every time |
| Fast execution | Run `npm run test` | Tests complete in reasonable time (< 10s for initial suite) |
| Coverage baseline | Run `npm run test:coverage` | Tested files show > 80% coverage |

### Documentation Verification

| Check | What to Verify |
|-------|---------------|
| Test examples clear | Tests demonstrate patterns (describe/it structure, queries, assertions, mocking) |
| File organization logical | Tests co-located or in clear directory structure |
| Comments explain complex mocks | Integration tests have comments explaining Supabase mocking setup |

### QA Sign-off Requirements

- [ ] All unit tests pass (XP calculation, rank progression)
- [ ] All component tests pass (ProfileCard, EventCard)
- [ ] All integration tests pass (Supabase auth flow)
- [ ] Coverage reporting generates successfully
- [ ] CI pipeline runs tests automatically
- [ ] No console errors or warnings during test execution
- [ ] Test execution time is reasonable (< 30 seconds for full suite)
- [ ] Coverage meets baseline expectations (> 80% for tested modules)
- [ ] Test code follows established patterns from research phase
- [ ] No regressions in existing functionality (app still builds and runs)
- [ ] Test examples are clear enough for contributors to follow
- [ ] CI integration blocks PRs with failing tests (if branch protection configured)

## Implementation Plan Preview

**Phase 1: Infrastructure Setup**
1. Install dependencies
2. Create vitest.config.ts
3. Create src/test/setup.ts
4. Add test scripts to package.json
5. Verify `npm run test` works (even with no tests)

**Phase 2: Unit Tests (Quick Wins)**
1. Locate XP calculation logic in codebase
2. Write unit tests for XP calculations
3. Locate rank progression logic
4. Write unit tests for rank progression
5. Verify all unit tests pass

**Phase 3: Component Tests**
1. Locate ProfileCard component
2. Write component tests for ProfileCard
3. Locate EventCard component
4. Write component tests for EventCard
5. Verify all component tests pass

**Phase 4: Integration Tests**
1. Locate Supabase auth implementation
2. Set up Supabase client mocking pattern
3. Write auth flow integration tests
4. Verify integration tests pass

**Phase 5: CI Integration**
1. Locate or create GitHub Actions workflow
2. Add test execution step
3. Test CI on branch
4. Configure branch protection (optional)

**Phase 6: Verification & Documentation**
1. Run full test suite
2. Generate coverage report
3. Verify all acceptance criteria met
4. Document test patterns for contributors
