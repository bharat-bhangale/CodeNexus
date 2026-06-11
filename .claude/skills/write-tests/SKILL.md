---
name: write-tests
description: Generates comprehensive tests for any CodeNexus source file — automatically detects the right test type (component, hook, store, controller, service) and creates appropriate test cases.
user-invocable: true
---

# Write Tests

## Input Required
- **File path** to the source file to test, OR
- **Test type** (unit, integration, component, e2e)

## Steps

### Step 1 — Read the source file
Analyze the source file to understand:
- What it exports (components, functions, classes, hooks, stores)
- What dependencies it imports
- What external services it calls (API, database, etc.)
- What side effects it has

### Step 2 — Determine the test type

| Source File Pattern | Test Type | Framework | Location |
|---|---|---|---|
| `*.jsx` component | Component test | @testing-library/react | `client/tests/components/` |
| `use*.js` hook | Hook test | @testing-library/react-hooks | `client/tests/hooks/` |
| `*Store.js` | Unit test | Vitest | `client/tests/stores/` |
| `*.controller.js` | Integration test | Supertest | `server/tests/integration/` |
| `*.service.js` (backend) | Unit test | Vitest (mocked) | `server/tests/unit/` |
| `*Service.js` (frontend) | Unit test | Vitest (mocked) | `client/tests/services/` |
| `*.js` model | Unit test | Vitest + mongodb-memory-server | `server/tests/unit/models/` |

### Step 3 — Create the test file
Use this structure for ALL tests:

```javascript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('{ModuleName}', () => {
  beforeEach(() => {
    // Reset mocks, clear state, set up fixtures
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('{functionOrComponentName}', () => {
    it('should handle the happy path correctly', () => {
      // Test normal, expected behavior
    });

    it('should handle edge case: empty input', () => {
      // Test with null, undefined, empty string, empty array
    });

    it('should handle edge case: large input', () => {
      // Test with unusually large data (if relevant)
    });

    it('should handle error case gracefully', () => {
      // Test with invalid data, network errors, etc.
    });
  });
});
```

### Step 4 — Mock external dependencies

```javascript
// Mock API calls
vi.mock('../services/api.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock Zustand store
vi.mock('../stores/aiStore.js', () => ({
  default: vi.fn(() => ({
    isLoading: false,
    error: null,
    data: [],
  })),
}));
```

### Step 5 — Run the tests
```bash
npx vitest run {test-file-path} --reporter=verbose
```

Verify all tests pass before completing.

## Test Templates

### Component Test Template
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

describe('{Component}', () => {
  it('renders without crashing', () => {
    render(<Component />);
    expect(screen.getByTestId('component-id')).toBeInTheDocument();
  });

  it('handles user click interaction', async () => {
    const onClick = vi.fn();
    render(<Component onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
```

### API Integration Test Template
```javascript
import request from 'supertest';
import app from '../../src/app.js';

describe('GET /api/v1/{resource}', () => {
  it('returns 200 with valid data', async () => {
    const res = await request(app)
      .get('/api/v1/{resource}')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/v1/{resource}');
    expect(res.status).toBe(401);
  });
});
```

## Rules
- ✅ Use Vitest (`vi.fn()`, `vi.mock()`), NOT Jest
- ✅ Mock ALL external dependencies (API calls, database, third-party services)
- ✅ Test behavior, NOT implementation details
- ✅ Every test has a descriptive name starting with "should"
- ✅ Minimum per function: 1 happy path + 1 edge case + 1 error case
- ✅ Test files go in `tests/` directories, NOT co-located with source
- ✅ Always run tests after writing to verify they pass
- ✅ Use `beforeEach` for setup, `afterEach` for cleanup
