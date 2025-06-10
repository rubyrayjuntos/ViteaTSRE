# Testing Documentation for ViteaTSRE

## Overview
This document outlines the testing infrastructure implemented in the ViteaTSRE project, including unit tests, component tests, and end-to-end (E2E) tests.

## Test Structure
```
frontend/
├── src/
│   ├── __tests__/          # Global test utilities
│   ├── components/
│   │   └── __tests__/      # Component-specific tests
│   ├── hooks/
│   │   └── __tests__/      # Hook-specific tests
│   ├── stores/
│   │   └── __tests__/      # Store-specific tests
│   └── test/
│       ├── setup.ts        # Test setup configuration
│       └── utils.ts        # Test utilities and mocks
└── e2e/                    # End-to-end tests
    └── reading.spec.ts     # Reading flow E2E tests
```

## Setup Instructions

1. Install Dependencies
```bash
# From the frontend directory
pnpm install
```

2. Install Playwright Browsers (for E2E tests)
```bash
# From the frontend directory
pnpm exec playwright install
```

3. Environment Setup
- Copy `.env.example` to `.env`
- Update the `VITE_BACKEND_URL` in `.env` to point to your local backend

## Running Tests

### Unit and Component Tests
```bash
# Run tests in watch mode
pnpm test

# Run tests with coverage report
pnpm test:coverage
```

### End-to-End Tests
```bash
# Run E2E tests in headless mode
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui
```

## Current Test Coverage

### Unit Tests
- `useTarotStore`: State management and card operations
- `useTarotChat`: Chat functionality and message handling
- `useTarotReading`: Card reading and loading states

### Component Tests
- `TarotCard`: Loading states, error handling, and interactions
- `ChatBox`: Message display, input handling, and loading states

### E2E Tests
- Complete reading flow
- Error handling scenarios
- State persistence

## Future Enhancements (TODO)

### High Priority
1. Add tests for:
   - `LoadingDots` component
   - `ErrorMessage` component
   - `ChatBubble` component
   - Navigation and routing
   - Form validation

2. Improve test coverage:
   - Add more edge cases for error handling
   - Test card animation states
   - Test accessibility features

### Medium Priority
1. Integration tests:
   - API error boundary testing
   - WebSocket connection handling
   - State persistence across sessions

2. Performance testing:
   - Component render performance
   - State update performance
   - Image loading optimization

### Low Priority
1. Visual regression testing:
   - Card layout snapshots
   - Dark/light theme transitions
   - Responsive design breakpoints

2. Accessibility testing:
   - Screen reader compatibility
   - Keyboard navigation
   - Color contrast compliance

### Infrastructure
1. CI/CD Integration:
   - GitHub Actions workflow
   - Automated test reporting
   - Coverage thresholds

2. Test Maintenance:
   - Test data generators
   - Shared test fixtures
   - Mock service workers for API testing

## Best Practices
- Keep tests focused and isolated
- Use meaningful test descriptions
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies
- Use data-testid attributes for E2E tests
- Maintain test documentation

## Notes
- The current setup uses Vitest for unit/component testing and Playwright for E2E testing
- Test coverage reports are generated in the `coverage` directory
- E2E tests require a running development server
- Some tests may require backend services to be running 