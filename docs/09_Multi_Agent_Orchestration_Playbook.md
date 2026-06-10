# CodeNexus: Multi-Agent Orchestration Playbook

This playbook defines the exact orchestration strategy, sub-agent prompts, and skills to invoke for building CodeNexus phase by phase. As the Lead Orchestrator, use this guide to direct your AI team.

---

## Phase 1: Foundation (Sequential)
**Strategy:** Single-agent mode. The Lead Agent (you) handles infrastructure setup to establish the project base before parallelizing work.

### Execution Steps
1. **Scaffold Project:**
   ```bash
   npm create vite@latest client -- --template react
   mkdir server && cd server && npm init -y
   ```
2. **Install Dependencies:** (React, Zustand, Express, Mongoose, Socket.IO, Tailwind/CSS variables)
3. **Setup Monorepo:** Create root `package.json` with workspaces.
4. **Agent Infrastructure:** (Already completed via Prompt 18).

### Skills to Invoke
- *None needed in this phase.*

### Verification Checklist
- [ ] Both `client/` and `server/` directories exist.
- [ ] Root `npm run dev` starts both client and server successfully.
- [ ] `.claude/CLAUDE.md` and agent definitions are in place.
- [ ] Git repository is initialized and pushed.

---

## Phase 2: AI Core Features (Parallel Orchestration)
**Strategy:** 3-Agent Pattern (AI + Backend + Frontend) per feature.

### Feature 1: Intent Mode
**1. Spawn AI Integration Agent:**
> **Prompt:** "Read `@docs/01_PRD.md` Section 3.1 and `@docs/05_Backend_Schema.md`. Create the prompt template at `server/src/prompts/intent.prompts.js` and add the `analyzeIntent` streaming method to `AIService`. Ensure it requests JSON output and includes Decision Memory context."

**2. Spawn Backend Agent:**
> **Prompt:** "Read `@docs/02_TRD.md` Section 4.2. Create the `POST /api/v1/ai/intent` endpoint. Build the route, controller, and service. Implement SSE streaming and rate limiting. Use Joi for validation."

**3. Spawn Frontend Agent:**
> **Prompt:** "Read `@docs/04_UI_UX_Design_Brief.md` Section 5.7. Build `IntentPanel.jsx`, `IntentSelector.jsx`, and `IntentResults.jsx`. Create the `useIntent` hook and wire it to `aiStore`. Handle loading, error, streaming, and empty states."

**Skills to Invoke:**
- `/add-ai-feature IntentMode`
- `/create-prompt-template intent`
- `/create-api-route ai/intent`
- `/build-component IntentPanel intent`

**Integration Steps (Lead):**
1. Wait for all 3 agents to complete.
2. Wire the `useIntent` hook to the `AIService` API endpoint.
3. Test the end-to-end flow with a sample code snippet.
4. Run `/run-full-review`.

*(Repeat this 3-agent pattern for **Explain My Code** and **Smart Chat**).*

---

## Phase 3: Intelligence Layer (Parallel + Testing)
**Strategy:** 3-Agent Pattern + Testing Agent.

### Feature: Decision Memory
**1. Spawn Backend Agent:**
> **Prompt:** "Create the `Decision` Mongoose model, and the CRUD endpoints at `POST/GET /api/v1/decisions`. Include the logic to extract patterns from past decisions."

**2. Spawn Frontend Agent:**
> **Prompt:** "Build `DecisionTimeline.jsx` and `DecisionCard.jsx`. Create `memoryStore.js`. Ensure the UI reflects manual overrides vs. AI-inferred decisions."

**3. Spawn AI Integration Agent:**
> **Prompt:** "Update ALL existing prompts (`intent.prompts.js`, `explain.prompts.js`, `chat.prompts.js`) to strictly inject the last 10 relevant items from Decision Memory into the context."

**4. Spawn Testing Agent (After Integration):**
> **Prompt:** "Write comprehensive Vitest unit tests for `Decision.js` model and `memoryStore.js`. Write Supertest integration tests for `/api/v1/decisions`."

**Skills to Invoke:**
- `/add-mongoose-model Decision`
- `/create-zustand-store memory`
- `/write-tests server/src/models/Decision.js`
- `/write-tests client/src/stores/memoryStore.js`

**Integration Steps (Lead):**
1. Ensure the DB seeds decisions correctly.
2. Verify that AI responses actually change based on injected decisions.
3. Run `/run-full-review`.

*(Repeat pattern for **Code Review** and **Health Dashboard**).*

---

## Phase 4: Power Features (Pair Agents)
**Strategy:** 2-Agent Pattern (Frontend + Backend) + Security Agent for Auth.

### Feature: Authentication & Projects
**1. Spawn Backend Agent:**
> **Prompt:** "Create `User` and `Project` models. Build JWT-based auth endpoints (`/auth/register`, `/auth/login`, `/auth/logout`) using httpOnly cookies. Secure project routes."

**2. Spawn Frontend Agent:**
> **Prompt:** "Build `LoginPage.jsx` and `DashboardPage.jsx`. Create `authStore.js` to manage session state and route protection guards."

**3. Spawn Security Agent (Crucial Step):**
> **Prompt:** "Review the authentication implementation in `server/src/controllers/auth.controller.js` and `client/src/stores/authStore.js`. Look for JWT leakage, XSS vectors, and ensure passwords are hashed securely."

**Skills to Invoke:**
- `/add-mongoose-model User`
- `/create-api-route auth`
- `/build-component LoginPage auth`

*(Repeat 2-Agent pattern for **Terminal Integration** and **Regex Playground**).*

---

## Phase 5: Polish & Launch (Quality Focus)
**Strategy:** Testing + Security + Lead Optimization.

**1. Spawn Testing Agent:**
> **Prompt:** "Write E2E tests for the critical user paths: Logging in, opening a project, using Intent Mode to refactor code, and accepting the suggestion to trigger a Decision Memory save."

**2. Spawn Security Agent:**
> **Prompt:** "Perform a full security audit of the codebase. Focus on API key exposure, injection vulnerabilities, and rate-limiting effectiveness on AI endpoints. Produce a structured severity report."

**Integration Steps (Lead):**
1. Review the Security Agent's report and patch any High/Critical issues.
2. Perform performance optimization (e.g., dynamic imports for Monaco Editor).
3. Conduct an accessibility (a11y) audit.
4. Run the `/deploy-check` skill.

### Final Verification Checklist
- [ ] No API keys hardcoded (verified by Security Agent).
- [ ] All tests passing with decent coverage.
- [ ] Production build succeeds (`npm run build`).
- [ ] Environment variables are fully documented in `.env.example`.
- [ ] `/deploy-check` reports "DEPLOYMENT: APPROVED".
