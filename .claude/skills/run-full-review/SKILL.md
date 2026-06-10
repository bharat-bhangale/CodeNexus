---
name: run-full-review
description: Runs a comprehensive quality review of the CodeNexus codebase — linting, tests, code smells, security checks, and a manual verification checklist. Use this as a quality gate after completing any feature or phase.
user-invocable: true
---

# Run Full Review

This is a **quality gate** skill. Run it after completing each feature or phase.

## Steps — Execute in Order

### Step 1 — Lint Check
```bash
cd client && npx eslint src/ --ext .js,.jsx --format compact 2>&1 | tail -20
cd server && npx eslint src/ --ext .js --format compact 2>&1 | tail -20
```
Report: number of errors and warnings.

### Step 2 — Run Tests
```bash
npm test 2>&1 | tail -30
```
Report: total tests, passed, failed, skipped.

### Step 3 — Check for Debug Statements
Search for `console.log`, `console.warn`, `console.error`, `debugger` in source files (NOT test files):
```bash
grep -rn "console\.\(log\|warn\|error\)" client/src/ server/src/ --include="*.js" --include="*.jsx" | grep -v node_modules | grep -v "logger\."
grep -rn "debugger" client/src/ server/src/ --include="*.js" --include="*.jsx"
```

### Step 4 — Check for TODO/FIXME
```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" client/src/ server/src/ --include="*.js" --include="*.jsx"
```
Report: count and locations of each.

### Step 5 — Check for Hardcoded Values
Search for potential hardcoded secrets, URLs, or API keys:
```bash
grep -rn "sk-[a-zA-Z0-9]\{20,\}\|AIza[a-zA-Z0-9_-]\{30,\}\|localhost:[0-9]\{4\}\|http://\|https://" client/src/ server/src/ --include="*.js" --include="*.jsx" | grep -v node_modules | grep -v "// allowed"
```

### Step 6 — Verify Error Handling
Check that async functions have try-catch:
- Controllers: every export should have try-catch wrapping
- Services: async methods should handle errors appropriately
- React hooks: useEffect with async calls should have error handling

### Step 7 — Verify Loading States
For every component that fetches data:
- ✅ Has `isLoading` state and renders a loading indicator
- ✅ Has `error` state and renders an error message
- ✅ Handles empty data (no items) gracefully

### Step 8 — Generate Report

Output a structured report:

```
═══════════════════════════════════════
  CodeNexus Quality Review Report
  Date: {YYYY-MM-DD HH:MM}
═══════════════════════════════════════

📋 LINT
  Errors:   {count}
  Warnings: {count}
  Status:   ✅ PASS / ❌ FAIL

🧪 TESTS
  Total:    {count}
  Passed:   {count}
  Failed:   {count}
  Skipped:  {count}
  Status:   ✅ PASS / ❌ FAIL

🔍 CODE SMELLS
  console.log:  {count} occurrences
  TODO/FIXME:   {count} items
  debugger:     {count} statements
  Status:       ⚠️ WARNING / ✅ CLEAN

🔒 SECURITY
  Hardcoded secrets: {count}
  API keys in client: {count}
  Status:   ✅ PASS / 🚨 CRITICAL

📊 COVERAGE
  Error handling: {covered}/{total} async functions
  Loading states: {covered}/{total} data components
  Status:   ✅ PASS / ⚠️ WARNING

═══════════════════════════════════════
  OVERALL: ✅ READY / ❌ NEEDS FIXES
═══════════════════════════════════════
```

## Rules
- ✅ Run this skill after completing each feature
- ✅ All lint errors must be fixed before proceeding
- ✅ All tests must pass before proceeding
- ✅ No `console.log` in production code (use a logger utility instead)
- ✅ No hardcoded API keys or secrets
- ✅ This is a READ-ONLY skill — it reports issues, does not fix them
