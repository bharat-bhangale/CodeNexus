---
name: create-zustand-store
description: Creates a new Zustand state store for CodeNexus with proper patterns, actions, selectors, and unit tests.
user-invocable: true
---

# Create Zustand Store

## Input Required
- **Store name** (e.g., `editor`, `ai`, `memory`, `ui`, `file`, `project`)
- **State shape** — what data the store manages
- **Actions needed** — what operations to support

## Steps

### Step 1 — Create the store
**Path:** `client/src/stores/{name}Store.js`

```javascript
import { create } from 'zustand';

const use{Name}Store = create((set, get) => ({
  // ─── State ───
  items: [],
  activeItem: null,
  isLoading: false,
  error: null,

  // ─── Actions ───
  setItems: (items) => set({ items }),

  addItem: (item) => set((state) => ({
    items: [...state.items, item],
  })),

  removeItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
  })),

  updateItem: (id, updates) => set((state) => ({
    items: state.items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    ),
  })),

  setActiveItem: (item) => set({ activeItem: item }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // ─── Computed / Derived ───
  getItemById: (id) => get().items.find((item) => item.id === id),

  // ─── Reset ───
  reset: () => set({
    items: [],
    activeItem: null,
    isLoading: false,
    error: null,
  }),
}));

export default use{Name}Store;
```

### Step 2 — Create the unit test
**Path:** `client/tests/stores/{name}Store.test.js`

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import use{Name}Store from '../../src/stores/{name}Store.js';

describe('{name}Store', () => {
  beforeEach(() => {
    use{Name}Store.getState().reset();
  });

  it('initializes with default state', () => {
    const state = use{Name}Store.getState();
    expect(state.items).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('adds an item', () => {
    use{Name}Store.getState().addItem({ id: '1', name: 'Test' });
    expect(use{Name}Store.getState().items).toHaveLength(1);
  });

  it('removes an item', () => {
    use{Name}Store.getState().setItems([{ id: '1' }, { id: '2' }]);
    use{Name}Store.getState().removeItem('1');
    expect(use{Name}Store.getState().items).toHaveLength(1);
  });

  it('updates an item', () => {
    use{Name}Store.getState().setItems([{ id: '1', name: 'Old' }]);
    use{Name}Store.getState().updateItem('1', { name: 'New' });
    expect(use{Name}Store.getState().items[0].name).toBe('New');
  });

  it('resets to default state', () => {
    use{Name}Store.getState().setItems([{ id: '1' }]);
    use{Name}Store.getState().setError('some error');
    use{Name}Store.getState().reset();
    expect(use{Name}Store.getState().items).toEqual([]);
    expect(use{Name}Store.getState().error).toBeNull();
  });
});
```

### Step 3 — Document selector usage patterns
```javascript
// ✅ GOOD — only re-renders when `items` changes
const items = use{Name}Store((state) => state.items);
const isLoading = use{Name}Store((state) => state.isLoading);

// ❌ BAD — re-renders on ANY state change
const store = use{Name}Store();
const { items, isLoading } = use{Name}Store();
```

## Rules
- ✅ One store per feature domain (editor, ai, memory, ui, files, project)
- ✅ Always include `isLoading` and `error` states
- ✅ Always include a `reset()` action
- ✅ Use selectors in components — never destructure the entire store
- ✅ Use `get()` for accessing current state within actions
- ✅ Do NOT use `persist` middleware unless explicitly requested
- ✅ Export as default export
