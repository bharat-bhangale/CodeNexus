---
name: deploy-check
description: Pre-deployment verification for CodeNexus — builds the production bundle, checks for security issues, runs the full test suite, verifies environment config, and generates a deployment readiness report.
user-invocable: true
---

# Deploy Check

Run this skill before any deployment to staging or production.

## Steps — Execute in Order

### Step 1 — Build the Production Bundle
```bash
cd client && npm run build
```
- Verify the build completes without errors
- Check the `dist/` directory for expected output files
- Note the bundle size

### Step 2 — Security Audit
```bash
npm audit --production
```
- Report: total vulnerabilities by severity (critical, high, moderate, low)
- Any critical or high vulnerabilities MUST be resolved before deployment

### Step 3 — Check Client Bundle for Secrets
```bash
# Ensure no API keys or secrets leaked into the client bundle
grep -rn "sk-\|AIza\|OPENAI_API_KEY\|MONGO\|JWT_SECRET" client/dist/ 2>/dev/null
```
- If ANY matches found: **BLOCK DEPLOYMENT**

### Step 4 — Verify Environment Variables
Check that `server/.env.example` documents ALL required environment variables:
```
PORT
MONGODB_URI
JWT_SECRET
JWT_EXPIRY
OPENAI_API_KEY
REDIS_URL (optional)
NODE_ENV
CORS_ORIGIN
```
- Compare `.env.example` with actual env references in server code
- Flag any env vars used in code but missing from `.env.example`

### Step 5 — Run Full Test Suite
```bash
npm test -- --reporter=verbose
```
- ALL tests must pass
- No skipped tests (unless documented)

### Step 6 — Check Dependencies
```bash
npx depcheck
```
- Flag unused dependencies for removal
- Flag missing dependencies that should be added

### Step 7 — Generate Deployment Report

```
═══════════════════════════════════════
  CodeNexus Deployment Readiness Report
  Date: {YYYY-MM-DD HH:MM}
  Target: {staging|production}
═══════════════════════════════════════

📦 BUILD
  Status:      ✅ Success / ❌ Failed
  Bundle Size: {size} MB
  Files:       {count}

🔒 SECURITY
  npm audit:       {critical} critical, {high} high
  Client secrets:  ✅ Clean / 🚨 EXPOSED
  Status:          ✅ PASS / 🚨 BLOCK

📋 ENVIRONMENT
  Documented vars: {count}/{total}
  Missing docs:    {list}
  Status:          ✅ PASS / ⚠️ WARNING

🧪 TESTS
  Total: {count} | Passed: {count} | Failed: {count}
  Status: ✅ PASS / ❌ FAIL

📦 DEPENDENCIES
  Unused: {list}
  Missing: {list}
  Status: ✅ Clean / ⚠️ Needs cleanup

═══════════════════════════════════════
  DEPLOYMENT: ✅ APPROVED / ❌ BLOCKED
  Blockers: {list of blocking issues}
═══════════════════════════════════════
```

## Rules
- ✅ Production build MUST succeed
- ✅ ZERO critical/high npm vulnerabilities
- ✅ ZERO secrets in client bundle
- ✅ ALL environment variables documented
- ✅ ALL tests passing
- 🚨 If ANY blocker found → deployment is BLOCKED
