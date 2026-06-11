# Sub-Agent Orchestration Guide
## How to Use Multi-Agent Workflows for CodeNexus

---

## Available Agents

| Agent | File | Scope | Purpose |
|---|---|---|---|
| **Frontend** | `frontend-agent.md` | `client/` only | React components, hooks, stores, CSS |
| **Backend** | `backend-agent.md` | `server/` only | Express routes, controllers, services, models |
| **AI Integration** | `ai-integration-agent.md` | `server/src/prompts/` + `server/src/services/ai/` | Prompt templates, AI service layer |
| **Visualization** | `visualization-agent.md` | `client/src/components/visualize/` + `server/src/services/GraphGenerator.js` | React Flow graphs, D3 charts |
| **Testing** | `testing-agent.md` | `*/tests/` directories | All test types |
| **Security** | `security-agent.md` | Entire codebase (read-only) | Vulnerability scanning |

---

## Orchestration Patterns

### Pattern 1: Parallel Frontend + Backend
**When:** Building a new feature that needs both UI and API

```
Lead Agent (You)
  ├── Spawn: Frontend Agent
  │   └── "Build the IntentPanel, IntentSelector, and IntentResults
  │        components following @docs/04_UI_UX_Design_Brief.md Section 5.7.
  │        Use aiStore for state management."
  │
  ├── Spawn: Backend Agent
  │   └── "Build the POST /api/v1/ai/intent endpoint with route,
  │        controller, service, and SSE streaming. Follow
  │        @docs/05_Backend_Schema.md for response format."
  │
  └── Lead: Wait for both → Wire frontend to backend → Test end-to-end
```

### Pattern 2: Research → Plan → Execute
**When:** Starting a complex feature with unclear requirements

```
Lead Agent (You)
  ├── Phase 1 - Spawn: Research Sub-Agent
  │   └── "Read @docs/01_PRD.md and @docs/02_TRD.md. Summarize all
  │        requirements for the Decision Memory feature. List every
  │        file that needs to be created or modified."
  │
  ├── Phase 2 - Lead: Review summary → Create implementation plan
  │
  └── Phase 3 - Execute with Parallel Agents (Pattern 1)
```

### Pattern 3: Build → Test → Review
**When:** Completing a feature and ensuring quality

```
Lead Agent (You)
  ├── Phase 1 - Build (uses skills)
  │   └── /build-component ChatPanel
  │   └── /create-api-route POST /ai/chat
  │
  ├── Phase 2 - Spawn: Testing Agent
  │   └── "Write comprehensive tests for ChatPanel.jsx,
  │        ai.controller.js handleChat, and aiService.js chat"
  │
  └── Phase 3 - Spawn: Security Agent
      └── "Review server/src/controllers/ai.controller.js and
           server/src/services/ai/ for security vulnerabilities.
           Check for: API key exposure, injection, rate limiting."
```

### Pattern 4: Full Feature Pipeline (3 Agents)
**When:** Building AI-powered features (Intent Mode, Explain, Chat, Review)

```
Lead Agent (You)
  ├── Spawn: AI Integration Agent
  │   └── "Create the prompt template at server/src/prompts/intent.prompts.js
  │        and add streaming method to AIService for intent analysis."
  │
  ├── Spawn: Backend Agent
  │   └── "Create POST /api/v1/ai/intent endpoint with controller,
  │        SSE streaming, rate limiting, and integration test."
  │
  ├── Spawn: Frontend Agent
  │   └── "Build IntentPanel.jsx with IntentSelector and IntentResults.
  │        Create useIntent hook. Wire to aiStore."
  │
  └── Lead: Integrate all three → Test end-to-end → /run-full-review
```

### Pattern 5: Git Worktree Parallelism
**When:** Need true filesystem isolation for parallel work

```bash
# Create worktrees for parallel development
git worktree add ../codenexus-frontend feature/frontend-work
git worktree add ../codenexus-backend feature/backend-work

# Agent 1 works in ../codenexus-frontend/client/
# Agent 2 works in ../codenexus-backend/server/

# After completion, merge results
git checkout main
git merge feature/frontend-work
git merge feature/backend-work

# Clean up
git worktree remove ../codenexus-frontend
git worktree remove ../codenexus-backend
```

---

## Phase-by-Phase Agent Deployment

| Phase | Weeks | Agents Used | Pattern |
|---|---|---|---|
| **1 — Foundation** | 1–3 | Lead only | Single agent (sequential setup) |
| **2 — AI Core** | 4–7 | Frontend + Backend + AI Integration | Pattern 4 (3 agents per feature) |
| **3 — Intelligence** | 8–10 | Frontend + Backend + AI + Testing | Pattern 4 + Testing after each |
| **4 — Power Features** | 11–13 | Frontend + Backend + Security | Pattern 1 + Security for Auth |
| **5 — Polish** | 14–16 | Testing + Security + Lead | Pattern 3 (quality focus) |

---

## Tips for Effective Multi-Agent Work

1. **Always scope agents tightly** — tell them exactly which files to create/modify
2. **Reference documentation** — use `@docs/filename.md` to load context
3. **Check for conflicts** — agents working in the same directory can cause issues
4. **Use skills first** — if a skill exists for the task, use it instead of raw instructions
5. **Review before integrating** — always review agent output before merging
6. **One feature at a time** — complete, test, and merge one feature before starting the next
