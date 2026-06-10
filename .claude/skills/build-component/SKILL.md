---
name: build-component
description: Creates a new React component for CodeNexus with proper styling, state integration, accessibility, and tests. Use this whenever you need to create a new UI component.
user-invocable: true
---

# Build Component

You are building a React component for **CodeNexus**, an AI-powered code editor.

## Input Required
The user will provide:
- **Component name** (e.g., `ChatMessage`)
- **Feature area** (e.g., `chat`, `intent`, `visualize`, `memory`, `health`, `review`, `editor`, `explorer`, `terminal`, `common`)
- **Purpose** — what the component does and its behavior

## Steps

### Step 1 — Create the component file
**Path:** `client/src/components/{feature}/{ComponentName}.jsx`

```jsx
import { useState } from 'react';
// import relevant Zustand store
// import { Icon } from 'lucide-react';

/**
 * {ComponentName} — {purpose description}
 * @param {Object} props
 */
const ComponentName = ({ /* props */ }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (isLoading) return <div className="{feature}-loading">Loading...</div>;
  if (error) return <div className="{feature}-error">{error}</div>;

  return (
    <div className="{component-class}" id="{feature}-{component-id}">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

Requirements:
- Use functional component with `export default`
- Import from Zustand stores using selectors: `const data = useStore(s => s.data)`
- Import icons from `lucide-react`
- Include JSDoc comment with `@param` for props
- Handle three states: **loading**, **error**, and **normal**
- Include empty state handling when data is empty/null
- Every interactive element gets a unique `id` attribute
- Add `aria-label` on interactive elements for accessibility
- Use `tabIndex={0}` on custom interactive elements

### Step 2 — Create or update the CSS file
**Path:** `client/src/styles/{feature}.css`

- Use CSS variables from `index.css` (e.g., `--bg-surface`, `--text-primary`, `--accent-primary`, `--border-subtle`)
- Add `:hover` and `:focus-visible` states on interactive elements
- Add `transition: all 0.2s ease` on elements that change
- Use `border-radius: 8px` for cards, `4px` for small elements
- Responsive: use `min-width` checks, not fixed widths
- Dark-first design (assume dark theme is default)

### Step 3 — Create the test file
**Path:** `client/tests/components/{ComponentName}.test.jsx`

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ComponentName from '../../src/components/{feature}/{ComponentName}';

describe('{ComponentName}', () => {
  it('renders without crashing', () => {
    render(<ComponentName />);
    // assert element is in the document
  });

  it('displays correct content with valid props', () => {
    // test with typical data
  });

  it('shows loading state', () => {
    // test loading indicator
  });

  it('shows error state', () => {
    // test error message display
  });

  it('handles empty data gracefully', () => {
    // test empty/null data
  });
});
```

### Step 4 — Update the parent component
Import and render the new component in its parent (e.g., `PanelManager.jsx`, `AppLayout.jsx`, or the relevant feature panel).

### Step 5 — Verify
List all created/modified files and summarize what was built.

## Rules
- ✅ Vanilla CSS with CSS variables — **NOT** Tailwind
- ✅ Zustand for state — **NOT** React Context or Redux
- ✅ Lucide React for icons — **NOT** FontAwesome or Material
- ✅ Keyboard accessible: `tabIndex`, `aria-label`, `:focus-visible`
- ✅ Every interactive element has a unique `id`
- ✅ Handle: loading, error, empty, and normal states
- ✅ Single default export per file
- ✅ 2-space indent, single quotes, trailing commas
