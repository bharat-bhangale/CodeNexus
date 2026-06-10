# Claude Multi-Agent Build Guide
## CodeNexus — Leveraging Claude Code's Skills, Hooks, Sub-Agents & CLAUDE.md

**Version:** 1.0  
**Date:** June 2026  
**Target Tool:** Claude Code CLI (with Claude Opus 4.6 Thinking)

---

## Table of Contents

1. [Understanding Claude Code's Agentic Architecture](#1-understanding-claude-codes-agentic-architecture)
2. [Complete Project Folder Layout](#2-complete-project-folder-layout)
3. [The CLAUDE.md File — Project Brain](#3-the-claudemd-file--project-brain)
4. [Skills System — Reusable Workflows](#4-skills-system--reusable-workflows)
5. [Hooks System — Lifecycle Automation](#5-hooks-system--lifecycle-automation)
6. [Sub-Agent Orchestration — Parallel Workflows](#6-sub-agent-orchestration--parallel-workflows)
7. [Feature-by-Feature Agent Strategy](#7-feature-by-feature-agent-strategy)
8. [Settings Configuration](#8-settings-configuration)
9. [Productivity Multiplier Tactics](#9-productivity-multiplier-tactics)

---

## 1. Understanding Claude Code's Agentic Architecture

Claude Code's power comes from four interconnected systems that, when used together, create a programmable AI development team:

```
┌────────────────────────────────────────────────────────────┐
│                    YOUR DEVELOPMENT SESSION                 │
│                                                            │
│   ┌──────────────┐    ┌──────────────┐                     │
│   │  CLAUDE.md   │    │  settings.json│                    │
│   │  (Project    │    │  (Hooks &     │                    │
│   │   Memory)    │    │   Config)     │                    │
│   └──────┬───────┘    └──────┬───────┘                     │
│          │                   │                              │
│          ▼                   ▼                              │
│   ┌──────────────────────────────────────┐                 │
│   │         LEAD AGENT (Orchestrator)     │                │
│   │   Reads CLAUDE.md → Plans → Delegates │                │
│   └───┬──────────┬──────────┬────────────┘                │
│       │          │          │                               │
│       ▼          ▼          ▼                               │
│   ┌────────┐ ┌────────┐ ┌────────┐                        │
│   │Sub-    │ │Sub-    │ │Sub-    │  ← Specialized workers │
│   │Agent 1 │ │Agent 2 │ │Agent 3 │     with own contexts  │
│   │Frontend│ │Backend │ │AI/ML   │                        │
│   └────────┘ └────────┘ └────────┘                        │
│       │          │          │                               │
│       ▼          ▼          ▼                               │
│   ┌──────────────────────────────────────┐                 │
│   │     SKILLS (Reusable Workflows)       │                │
│   │  /build-component  /create-api-route  │                │
│   │  /add-ai-feature   /run-review        │                │
│   └──────────────────────────────────────┘                 │
│       │          │          │                               │
│       ▼          ▼          ▼                               │
│   ┌──────────────────────────────────────┐                 │
│   │     HOOKS (Lifecycle Automation)      │                │
│   │  PreToolUse → Validate & Gate         │                │
│   │  PostToolUse → Lint, Format, Test     │                │
│   │  Notification → Alert Developer       │                │
│   └──────────────────────────────────────┘                 │
└────────────────────────────────────────────────────────────┘
```

### Quick Reference Table

| System | What It Does | When to Use | Mental Model |
|---|---|---|---|
| **CLAUDE.md** | Persistent project instructions loaded every session | Always — every project needs one | "How Claude should behave here" |
| **Skills** | Reusable step-by-step workflows invoked via `/slash-commands` | When you repeat the same multi-step task | "How to perform this type of task" |
| **Sub-Agents** | Isolated AI workers spawned for focused, parallel tasks | When a task is complex or can be parallelized | "A specialized worker for this sub-task" |
| **Hooks** | Deterministic code that runs at lifecycle events | For automation that must run reliably (lint, format, validate) | "When X happens, automatically do Y" |

---

## 2. Complete Project Folder Layout

This is the **full directory structure** for CodeNexus, including all Claude Code configuration files (`.claude/` directory):

```
codenexus/
│
├── .claude/                              # ← CLAUDE CODE CONFIGURATION
│   ├── CLAUDE.md                         # Project-level memory (shared via Git)
│   ├── CLAUDE.local.md                   # Personal overrides (gitignored)
│   ├── settings.json                     # Hooks + tool permissions
│   │
│   ├── skills/                           # ← REUSABLE SKILLS (slash commands)
│   │   ├── build-component/
│   │   │   └── SKILL.md                  # /build-component
│   │   ├── create-api-route/
│   │   │   └── SKILL.md                  # /create-api-route
│   │   ├── add-ai-feature/
│   │   │   └── SKILL.md                  # /add-ai-feature
│   │   ├── create-zustand-store/
│   │   │   └── SKILL.md                  # /create-zustand-store
│   │   ├── add-mongoose-model/
│   │   │   └── SKILL.md                  # /add-mongoose-model
│   │   ├── write-tests/
│   │   │   └── SKILL.md                  # /write-tests
│   │   ├── create-prompt-template/
│   │   │   └── SKILL.md                  # /create-prompt-template
│   │   ├── build-visualization/
│   │   │   └── SKILL.md                  # /build-visualization
│   │   ├── run-full-review/
│   │   │   └── SKILL.md                  # /run-full-review
│   │   └── deploy-check/
│   │       └── SKILL.md                  # /deploy-check
│   │
│   └── agents/                           # ← SUB-AGENT DEFINITIONS
│       ├── frontend-agent.md             # React/UI specialist
│       ├── backend-agent.md              # Node.js/Express specialist
│       ├── ai-integration-agent.md       # LLM/prompt engineering specialist
│       ├── visualization-agent.md        # D3.js/React Flow specialist
│       ├── testing-agent.md              # Testing specialist
│       └── security-agent.md             # Security audit specialist
│
├── docs/                                 # ← PROJECT DOCUMENTATION
│   ├── 01_PRD.md                         # Product Requirements
│   ├── 02_TRD.md                         # Technical Requirements
│   ├── 03_App_Flow.md                    # User Flows
│   ├── 04_UI_UX_Design_Brief.md          # Design System
│   ├── 05_Backend_Schema.md              # Database Schemas
│   ├── 06_Implementation_Plan.md         # Build Plan
│   ├── 07_Feature_Master_Prompts.md      # AI Agent Prompts
│   └── architecture-decisions/           # ADR records
│       └── 001-state-management.md
│
├── client/                               # ← REACT FRONTEND
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.svg
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── TopBar.jsx
│   │   │   │   ├── BottomBar.jsx
│   │   │   │   └── PanelManager.jsx
│   │   │   ├── editor/
│   │   │   │   ├── CodeEditor.jsx
│   │   │   │   ├── EditorTabs.jsx
│   │   │   │   ├── DiffViewer.jsx
│   │   │   │   └── EditorToolbar.jsx
│   │   │   ├── explorer/
│   │   │   │   ├── FileExplorer.jsx
│   │   │   │   ├── FileTreeNode.jsx
│   │   │   │   └── FileContextMenu.jsx
│   │   │   ├── chat/
│   │   │   │   ├── ChatPanel.jsx
│   │   │   │   ├── ChatMessage.jsx
│   │   │   │   ├── ChatInput.jsx
│   │   │   │   └── CommandPalette.jsx
│   │   │   ├── intent/
│   │   │   │   ├── IntentPanel.jsx
│   │   │   │   ├── IntentSelector.jsx
│   │   │   │   ├── IntentResults.jsx
│   │   │   │   └── ConfidenceBadge.jsx
│   │   │   ├── visualize/
│   │   │   │   ├── VisualizationPanel.jsx
│   │   │   │   ├── DependencyGraph.jsx
│   │   │   │   ├── CallGraph.jsx
│   │   │   │   ├── DataFlowDiagram.jsx
│   │   │   │   ├── ComponentTree.jsx
│   │   │   │   └── GraphControls.jsx
│   │   │   ├── memory/
│   │   │   │   ├── DecisionTimeline.jsx
│   │   │   │   ├── DecisionCard.jsx
│   │   │   │   ├── DecisionSearch.jsx
│   │   │   │   └── PatternDetector.jsx
│   │   │   ├── health/
│   │   │   │   ├── HealthDashboard.jsx
│   │   │   │   ├── HealthScoreCard.jsx
│   │   │   │   ├── MetricChart.jsx
│   │   │   │   └── HotspotList.jsx
│   │   │   ├── review/
│   │   │   │   ├── ReviewPanel.jsx
│   │   │   │   ├── ReviewAnnotation.jsx
│   │   │   │   └── ReviewSummary.jsx
│   │   │   ├── terminal/
│   │   │   │   ├── TerminalPanel.jsx
│   │   │   │   └── TerminalTabs.jsx
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── Tooltip.jsx
│   │   │       ├── Dropdown.jsx
│   │   │       ├── LoadingSpinner.jsx
│   │   │       ├── Toast.jsx
│   │   │       └── Badge.jsx
│   │   ├── hooks/
│   │   │   ├── useAI.js
│   │   │   ├── useEditor.js
│   │   │   ├── useFileSystem.js
│   │   │   ├── useDecisionMemory.js
│   │   │   ├── useCodeHealth.js
│   │   │   ├── useVisualization.js
│   │   │   ├── useWebSocket.js
│   │   │   └── useTheme.js
│   │   ├── stores/
│   │   │   ├── editorStore.js
│   │   │   ├── fileStore.js
│   │   │   ├── aiStore.js
│   │   │   ├── memoryStore.js
│   │   │   ├── uiStore.js
│   │   │   └── projectStore.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── aiService.js
│   │   │   ├── fileService.js
│   │   │   ├── authService.js
│   │   │   ├── memoryService.js
│   │   │   ├── healthService.js
│   │   │   └── socketService.js
│   │   ├── utils/
│   │   │   ├── codeParser.js
│   │   │   ├── graphBuilder.js
│   │   │   ├── diffGenerator.js
│   │   │   ├── metricsCalculator.js
│   │   │   ├── languageDetector.js
│   │   │   ├── formatters.js
│   │   │   └── constants.js
│   │   ├── themes/
│   │   │   ├── dark.js
│   │   │   ├── light.js
│   │   │   └── monacoThemes.js
│   │   └── styles/
│   │       ├── index.css
│   │       ├── layout.css
│   │       ├── editor.css
│   │       ├── chat.css
│   │       ├── visualize.css
│   │       └── animations.css
│   ├── tests/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── stores/
│   ├── vite.config.js
│   └── package.json
│
├── server/                               # ← NODE.JS BACKEND
│   ├── src/
│   │   ├── index.js
│   │   ├── app.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── redis.js
│   │   │   ├── ai.js
│   │   │   └── environment.js
│   │   ├── routes/
│   │   │   ├── index.js
│   │   │   ├── auth.routes.js
│   │   │   ├── project.routes.js
│   │   │   ├── file.routes.js
│   │   │   ├── ai.routes.js
│   │   │   ├── memory.routes.js
│   │   │   ├── health.routes.js
│   │   │   └── review.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── project.controller.js
│   │   │   ├── file.controller.js
│   │   │   ├── ai.controller.js
│   │   │   ├── memory.controller.js
│   │   │   ├── health.controller.js
│   │   │   └── review.controller.js
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── AIService.js
│   │   │   │   ├── OpenAIProvider.js
│   │   │   │   ├── AnthropicProvider.js
│   │   │   │   ├── GeminiProvider.js
│   │   │   │   ├── PromptBuilder.js
│   │   │   │   └── StreamHandler.js
│   │   │   ├── CodeAnalyzer.js
│   │   │   ├── GraphGenerator.js
│   │   │   ├── HealthCalculator.js
│   │   │   ├── DecisionManager.js
│   │   │   ├── PatternDetector.js
│   │   │   └── ReviewEngine.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   ├── File.js
│   │   │   ├── Decision.js
│   │   │   ├── ChatHistory.js
│   │   │   ├── ReviewResult.js
│   │   │   └── HealthSnapshot.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── rateLimiter.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   ├── errorHandler.middleware.js
│   │   │   └── logger.middleware.js
│   │   ├── sockets/
│   │   │   ├── socketManager.js
│   │   │   ├── aiStream.socket.js
│   │   │   └── collaboration.socket.js
│   │   ├── prompts/
│   │   │   ├── intent.prompts.js
│   │   │   ├── explain.prompts.js
│   │   │   ├── review.prompts.js
│   │   │   ├── chat.prompts.js
│   │   │   ├── scaffold.prompts.js
│   │   │   └── system.prompts.js
│   │   └── utils/
│   │       ├── astParser.js
│   │       ├── codeMetrics.js
│   │       ├── diffEngine.js
│   │       ├── sanitizer.js
│   │       ├── tokenCounter.js
│   │       └── responseFormatter.js
│   ├── tests/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── fixtures/
│   ├── .env.example
│   ├── package.json
│   └── Dockerfile
│
├── shared/                               # ← SHARED CONSTANTS
│   ├── constants.js
│   └── types.js
│
├── scripts/                              # ← BUILD/UTILITY SCRIPTS
│   ├── seed-db.js
│   ├── generate-test-data.js
│   └── health-check.js
│
├── .gitignore
├── .prettierrc
├── .eslintrc.json
├── package.json                          # Root workspace config
├── README.md
└── docker-compose.yml
```

---

## 3. The CLAUDE.md File — Project Brain

The `CLAUDE.md` file is the most critical file in your Claude Code workflow. It's loaded at the start of **every session** and tells Claude who it is, what the project is, and how to behave. Think of it as the onboarding doc for a new developer — but for AI.

### 3.1 CLAUDE.md Hierarchy

Claude Code loads memory files in this order (later files override earlier ones):

```
1. ~/.claude/CLAUDE.md              ← Global (your personal preferences)
2. .claude/CLAUDE.md                ← Project (shared via Git with team)
3. .claude/CLAUDE.local.md          ← Personal overrides (gitignored)
```

### 3.2 Complete CLAUDE.md for CodeNexus

Create this file at `.claude/CLAUDE.md` in your project root:

```markdown
# CodeNexus — AI-Powered Code Editor

## Project Overview
CodeNexus is a browser-based AI-powered code editor with real problem-solving features.
It is NOT a Copilot clone. It focuses on intent-based refactoring, visual code explanation,
and persistent decision memory that makes the AI smarter over time.

## Tech Stack
- **Frontend:** React 18 + Vite 5 + Zustand 4 (state) + Monaco Editor
- **Backend:** Node.js 20 + Express 4 + MongoDB 7 (Mongoose 8) + Socket.IO 4
- **AI:** OpenAI GPT-4o via `openai` npm package (provider-agnostic abstraction)
- **Visualization:** React Flow 11 + D3.js 7 + dagre (layout)
- **Terminal:** @xterm/xterm 5
- **Styling:** Vanilla CSS with CSS variables (NO Tailwind)

## Architecture
- Monorepo: `client/` (React) + `server/` (Express) + `shared/` (constants)
- State management: Zustand stores in `client/src/stores/`
- AI calls always go through the backend — NEVER expose API keys to the client
- All AI providers implement the same interface via `server/src/services/ai/AIService.js`
- Prompts are template functions in `server/src/prompts/`

## Key Design Decisions (DO NOT OVERRIDE)
- Use Zustand, NOT Redux or Context API for global state
- Use vanilla CSS with CSS variables, NOT Tailwind or CSS-in-JS
- Use Mongoose ODM, NOT raw MongoDB driver or Prisma
- Use Server-Sent Events (SSE) for AI streaming, WebSocket via Socket.IO for real-time
- JWT auth with httpOnly cookies, NOT localStorage
- Use Joi or Zod for request validation, NOT manual checks

## Coding Conventions
- ES Modules (import/export), NOT CommonJS (require)
- Functional React components with hooks, NEVER class components
- async/await, NEVER .then() chains
- camelCase for variables and functions, PascalCase for components
- 2-space indentation, single quotes, trailing commas
- Every component file exports a single default component
- Custom hooks start with `use` prefix (e.g., useAI, useEditor)
- Zustand stores use the `create` function from zustand

## File Naming
- React components: PascalCase.jsx (e.g., ChatPanel.jsx)
- Hooks: camelCase.js starting with `use` (e.g., useAI.js)
- Stores: camelCase ending with Store (e.g., aiStore.js)
- Services: camelCase ending with Service (e.g., aiService.js)
- CSS: kebab-case.css (e.g., chat-panel.css) or feature name (e.g., chat.css)
- Backend routes: kebab-case.routes.js
- Backend controllers: kebab-case.controller.js
- Backend models: PascalCase.js (e.g., Decision.js)

## API Conventions
- All API routes start with `/api/v1/`
- RESTful naming: GET /projects, POST /projects, GET /projects/:id
- Consistent response format: { success: true, data: {...} }
- Consistent error format: { success: false, error: { code, message, details } }
- All protected routes use auth middleware

## Testing
- Vitest for unit + integration tests
- @testing-library/react for component tests
- Supertest for API endpoint tests
- Test files go in `tests/` directories (not co-located)

## Commands
- Dev (both): `npm run dev` (from root)
- Dev client only: `cd client && npm run dev`
- Dev server only: `cd server && npm run dev`
- Test: `npm test`
- Lint: `npm run lint`
- Build: `npm run build`

## Reference Documentation
- Product Requirements: @docs/01_PRD.md
- Technical Requirements: @docs/02_TRD.md
- App Flow: @docs/03_App_Flow.md
- UI/UX Design: @docs/04_UI_UX_Design_Brief.md
- Backend Schema: @docs/05_Backend_Schema.md
- Implementation Plan: @docs/06_Implementation_Plan.md

## Critical Rules
1. NEVER put API keys in client-side code
2. NEVER use `any` type or skip error handling
3. ALWAYS validate request bodies on the server
4. ALWAYS include loading and error states in UI components
5. ALWAYS record accepted AI suggestions in Decision Memory
6. NEVER delete or modify existing tests without explanation
7. When creating a new feature, create BOTH frontend and backend in a single session
8. Run `npm run lint` before considering any task complete
```

### 3.3 Personal CLAUDE.local.md (gitignored)

```markdown
# Personal Overrides

## My Preferences
- I prefer verbose commit messages
- Show me the diff before applying changes
- When uncertain between two approaches, pick the more explicit/readable one
- Always explain WHY before showing code

## My API Keys for Testing
- OpenAI model to use for testing: gpt-4o-mini (cheaper)
- Default AI temperature: 0.2
```

---

## 4. Skills System — Reusable Workflows

Skills are the **biggest productivity multiplier**. Instead of re-explaining the same multi-step task every time, you package it as a slash command that Claude executes consistently.

### 4.1 How Skills Work

```
~/.claude/skills/       ← Global skills (available in all projects)
.claude/skills/         ← Project skills (available only in this project)

Each skill = a directory containing a SKILL.md file
Invoked via: /skill-name
```

### 4.2 Skill: /build-component

**File:** `.claude/skills/build-component/SKILL.md`

```yaml
---
name: build-component
description: Creates a new React component with proper styling, state integration, and tests for CodeNexus.
user-invocable: true
---

# Build Component Skill

You are building a React component for CodeNexus, an AI-powered code editor.

## Input
The user will provide:
- Component name (e.g., "ChatMessage")
- Feature area (e.g., "chat", "intent", "visualize", "memory", "health", "review")
- Component purpose and behavior description

## Steps

1. **Create the component file** at `client/src/components/{feature}/{ComponentName}.jsx`:
   - Use functional component with `export default`
   - Import from Zustand stores as needed (use `useStore` selectors)
   - Import from `lucide-react` for icons
   - Add proper prop types documentation via JSDoc
   - Include loading and error states
   - Add Framer Motion animations for enter/exit
   - Use CSS classes referencing variables from `index.css`

2. **Create or update the CSS file** at `client/src/styles/{feature}.css`:
   - Use CSS variables from index.css (--bg-surface, --text-primary, etc.)
   - Add hover and focus states
   - Add responsive considerations
   - Add transition animations (200ms ease)

3. **Create a test file** at `client/tests/components/{ComponentName}.test.jsx`:
   - Import from @testing-library/react
   - Test: renders without crashing
   - Test: displays correct content
   - Test: handles user interactions
   - Test: shows loading state
   - Test: shows error state

4. **Update the parent component** to import and render the new component.

5. **Verify** by listing the created files and summarizing what was built.

## Rules
- Use vanilla CSS with variables, NOT Tailwind
- Use Zustand for state, NOT React Context or Redux
- Use Lucide icons, NOT any other icon library
- Component must be keyboard-accessible (tabIndex, aria-labels)
- All interactive elements need unique IDs for testing
```

### 4.3 Skill: /create-api-route

**File:** `.claude/skills/create-api-route/SKILL.md`

```yaml
---
name: create-api-route
description: Creates a complete API route with route, controller, service, validation, and tests for CodeNexus backend.
user-invocable: true
---

# Create API Route Skill

You are adding a new API endpoint to the CodeNexus Express.js backend.

## Input
The user will provide:
- Route path (e.g., "/api/v1/projects/:id/decisions")
- HTTP method (GET, POST, PUT, DELETE)
- Purpose and expected request/response

## Steps

1. **Create or update the route file** at `server/src/routes/{resource}.routes.js`:
   - Import the controller function
   - Add auth middleware for protected routes
   - Add validation middleware with Joi schema

2. **Create or update the controller** at `server/src/controllers/{resource}.controller.js`:
   - Wrap handler in try-catch
   - Call the service layer (never put business logic in controllers)
   - Return consistent response format: { success: true, data: {...} }
   - Return consistent error format: { success: false, error: {...} }

3. **Create or update the service** at `server/src/services/{ServiceName}.js`:
   - Business logic goes here
   - Database operations via Mongoose
   - Input validation and sanitization
   - Return raw data (controller handles HTTP formatting)

4. **Create the Joi validation schema** in the route or a separate validation file.

5. **Register the route** in `server/src/routes/index.js` if not already registered.

6. **Create integration test** at `server/tests/integration/{resource}.test.js`:
   - Use supertest to test the endpoint
   - Test success case (200/201)
   - Test validation error (400)
   - Test not found (404)
   - Test auth required (401)

7. **Update the frontend service** at `client/src/services/{resource}Service.js`:
   - Add the corresponding Axios call
   - Handle the response/error format

## Rules
- Use Joi or Zod for validation, NOT manual checks
- Controllers are thin — delegate to services
- Always include auth middleware on protected routes
- Always include rate limiting on AI endpoints
- Response format: { success, data } or { success, error: { code, message } }
```

### 4.4 Skill: /add-ai-feature

**File:** `.claude/skills/add-ai-feature/SKILL.md`

```yaml
---
name: add-ai-feature
description: Adds a new AI-powered feature to CodeNexus with prompt template, API endpoint, streaming, and frontend integration.
user-invocable: true
---

# Add AI Feature Skill

You are adding a new AI-powered feature to CodeNexus.

## Input
The user will provide:
- Feature name and purpose
- What context the AI needs (current file, selection, project structure, decisions)
- Expected AI output format

## Steps

1. **Create the prompt template** at `server/src/prompts/{feature}.prompts.js`:
   - Export a `build{Feature}Prompt({ code, context, decisions, rules })` function
   - System prompt defines the AI's role and constraints
   - User prompt includes code, context, and output format instructions
   - Always request JSON output for structured data
   - Include recent decisions and project rules from Decision Memory
   - Add token budget management (truncate context if needed)

2. **Create or update the AI controller** at `server/src/controllers/ai.controller.js`:
   - Add handler function for the new feature
   - Validate request body
   - Fetch Decision Memory context from database
   - Build prompt using the template
   - Call AIService with streaming
   - Stream response via SSE (Content-Type: text/event-stream)

3. **Add the API route** in `server/src/routes/ai.routes.js`.

4. **Update the frontend AI service** at `client/src/services/aiService.js`:
   - Add function that calls the new endpoint
   - Handle SSE streaming with EventSource or fetch ReadableStream

5. **Create the React hook** at `client/src/hooks/use{Feature}.js`:
   - Manage loading, error, and result states
   - Call the AI service
   - Parse streaming response
   - Update Zustand store

6. **Create the UI component** using /build-component skill patterns.

7. **Integrate with Decision Memory**:
   - When user accepts AI output, record the decision
   - POST to /api/v1/projects/:id/decisions with type, context, before/after

## Rules
- ALL AI calls go through the backend, NEVER call AI APIs from the frontend
- Use SSE for streaming (Content-Type: text/event-stream)
- Always include Decision Memory context in prompts
- Always handle: loading state, streaming state, error state, empty state
- Always provide a way to dismiss/cancel AI operations
```

### 4.5 Skill: /create-zustand-store

**File:** `.claude/skills/create-zustand-store/SKILL.md`

```yaml
---
name: create-zustand-store
description: Creates a new Zustand store for CodeNexus with proper patterns, selectors, and persistence.
user-invocable: true
---

# Create Zustand Store Skill

## Input
The user provides: store name, state shape, and required actions.

## Steps

1. **Create the store** at `client/src/stores/{name}Store.js`:
   ```javascript
   import { create } from 'zustand';

   const use{Name}Store = create((set, get) => ({
     // State
     items: [],
     isLoading: false,
     error: null,

     // Actions
     setItems: (items) => set({ items }),
     addItem: (item) => set((state) => ({ items: [...state.items, item] })),
     setLoading: (isLoading) => set({ isLoading }),
     setError: (error) => set({ error }),
     reset: () => set({ items: [], isLoading: false, error: null }),
   }));

   export default use{Name}Store;
   ```

2. **Create unit test** at `client/tests/stores/{name}Store.test.js`

3. **Usage pattern** — use selectors to prevent unnecessary re-renders:
   ```javascript
   // Good — only re-renders when items change
   const items = use{Name}Store((state) => state.items);
   // Bad — re-renders on ANY state change
   const store = use{Name}Store();
   ```

## Rules
- One store per feature domain (editor, ai, memory, ui, files, project)
- Always include isLoading and error states
- Use selectors in components, not full store destructuring
- Do NOT use persist middleware unless explicitly requested
```

### 4.6 Skill: /add-mongoose-model

**File:** `.claude/skills/add-mongoose-model/SKILL.md`

```yaml
---
name: add-mongoose-model
description: Creates a new Mongoose model with schema, indexes, virtual fields, and validation for CodeNexus.
user-invocable: true
---

# Add Mongoose Model Skill

## Input
The user provides: model name, fields, and relationships.

## Steps

1. **Create the model** at `server/src/models/{ModelName}.js`:
   - Define schema with field types, required flags, defaults, and validation
   - Add indexes for frequent queries
   - Add virtual fields if needed
   - Add pre-save hooks for updatedAt timestamps
   - Add toJSON transform to exclude sensitive fields
   - Export the model

2. **Reference the Backend Schema Document** at `@docs/05_Backend_Schema.md` for established patterns.

3. **Add indexes** for:
   - Fields used in queries (especially with sorting)
   - Compound indexes for multi-field lookups
   - Text indexes for search fields
   - TTL indexes for auto-expiring documents

4. **Create seed data** function in `scripts/seed-db.js`.

## Rules
- Always add { timestamps: true } or manual createdAt/updatedAt
- Always use select: false for sensitive fields (passwords, API keys)
- Always define toJSON transform to exclude __v and sensitive data
- Use mongoose.Schema.Types.ObjectId for references with ref
```

### 4.7 Skill: /create-prompt-template

**File:** `.claude/skills/create-prompt-template/SKILL.md`

```yaml
---
name: create-prompt-template
description: Creates a new AI prompt template for CodeNexus with system prompt, user prompt, context injection, and response format.
user-invocable: true
---

# Create Prompt Template Skill

## Steps

1. **Create the prompt file** at `server/src/prompts/{feature}.prompts.js`:
   ```javascript
   export const build{Feature}Prompt = ({ code, language, context, decisionHistory, projectRules }) => ({
     system: `You are an expert ${language} developer specializing in [SPECIALTY].
              You are working within CodeNexus, an AI code editor.
              [SPECIFIC CONSTRAINTS AND BEHAVIOR]`,
     user: `
       ## Code to Analyze
       \`\`\`${language}
       ${code}
       \`\`\`

       ## Project Context
       - Recent decisions: ${JSON.stringify(decisionHistory?.slice(-10) || [])}
       - Project rules: ${JSON.stringify(projectRules || [])}

       ## Instructions
       [SPECIFIC STEP-BY-STEP INSTRUCTIONS]

       ## Response Format
       Respond ONLY with valid JSON in this format:
       {
         "result": [...],
         "summary": "...",
         "confidence": 0-100
       }
     `
   });
   ```

2. **Add token budget management**:
   - Count estimated tokens (chars / 4 as rough estimate)
   - If over budget, truncate code context (keep first and last 500 lines)
   - If still over, reduce decision history to last 5

3. **Register in PromptBuilder** if using a centralized builder.

## Rules
- Always request JSON output for structured responses
- Always include decision history and project rules
- System prompt defines the AI's role and constraints
- User prompt provides context and specific instructions
- Keep prompts under 4000 tokens of static content (leave room for code)
```

### 4.8 Skill: /write-tests

**File:** `.claude/skills/write-tests/SKILL.md`

```yaml
---
name: write-tests
description: Generates comprehensive tests for a CodeNexus file — unit, integration, or component tests.
user-invocable: true
---

# Write Tests Skill

## Input
The user provides: file path to test, or test type (unit/integration/component).

## Steps

1. **Read the source file** to understand its exports, dependencies, and behavior.

2. **Determine test type**:
   - `.jsx` component → Component test with @testing-library/react
   - `Store.js` → Unit test for Zustand store
   - `.controller.js` → Integration test with supertest
   - `.service.js` → Unit test with mocked dependencies
   - `hook` → Hook test with renderHook

3. **Create test file** in the appropriate `tests/` directory.

4. **Test structure**:
   ```javascript
   import { describe, it, expect, vi, beforeEach } from 'vitest';

   describe('{ModuleName}', () => {
     beforeEach(() => { /* reset state */ });

     describe('{functionName}', () => {
       it('should handle the happy path', () => { });
       it('should handle edge case: empty input', () => { });
       it('should handle error case', () => { });
     });
   });
   ```

5. **Run tests** with `npx vitest run {test-file}` to verify they pass.

## Rules
- Use Vitest (vi.fn(), vi.mock()), NOT Jest
- Mock external dependencies (API calls, database)
- Test behavior, not implementation details
- Every test should have a descriptive name
- Aim for: 1 happy path, 1 edge case, 1 error case per function
```

### 4.9 Skill: /build-visualization

**File:** `.claude/skills/build-visualization/SKILL.md`

```yaml
---
name: build-visualization
description: Creates an interactive React Flow visualization for CodeNexus's Explain My Code feature.
user-invocable: true
---

# Build Visualization Skill

## Input
The user provides: visualization type (dependency, call-graph, component-tree, data-flow).

## Steps

1. **Create custom React Flow node component** at `client/src/components/visualize/nodes/{NodeType}Node.jsx`:
   - 120×48px, rounded 8px
   - File/function icon on the left
   - Label text centered
   - Hover: scale(1.05), accent glow shadow
   - Selected: accent border
   - Handle positions for edge connections

2. **Create custom React Flow edge component** at `client/src/components/visualize/edges/{EdgeType}Edge.jsx`:
   - Animated dash pattern
   - Label on hover
   - Color changes on hover/selection

3. **Create the graph component** at `client/src/components/visualize/{Type}Graph.jsx`:
   - Import ReactFlow, Background (dots), Controls, MiniMap
   - Use dagre for layout computation
   - Register custom node and edge types
   - Handle: onNodeClick (navigate to file), onNodeHover (show tooltip)
   - Include fitView on initial load

4. **Create the backend graph generator** or update `server/src/services/GraphGenerator.js`:
   - Parse source files using @babel/parser
   - Extract relationships (imports, calls, components, data flow)
   - Build nodes[] and edges[] arrays
   - Compute positions using dagre layout

5. **Add export functionality** using html-to-image for PNG/SVG export.

## Rules
- Use React Flow 11, NOT vis.js or cytoscape
- Use dagre for hierarchical layout
- All nodes must be clickable (navigate to source code)
- Include zoom controls, reset, fit view, and search
- Canvas background: dot grid pattern
```

### 4.10 Skill: /run-full-review

**File:** `.claude/skills/run-full-review/SKILL.md`

```yaml
---
name: run-full-review
description: Runs a comprehensive quality review of the CodeNexus codebase — lint, tests, type safety, and manual checklist.
user-invocable: true
---

# Full Review Skill

## Steps

1. **Run linting**: `cd client && npx eslint src/ --ext .js,.jsx`
2. **Run tests**: `npm test`
3. **Check for console.log statements**: Search for `console.log` in src/ files
4. **Check for TODO/FIXME comments**: Search for `TODO` and `FIXME`
5. **Check for hardcoded values**: Look for hardcoded URLs, API keys, secrets
6. **Verify error handling**: Ensure all async functions have try-catch
7. **Verify loading states**: Every component that fetches data should have isLoading handling
8. **Report findings** in a structured format with severity levels
```

---

## 5. Hooks System — Lifecycle Automation

Hooks are deterministic scripts that run automatically at lifecycle events. Unlike prompts (suggestions), hooks are **guaranteed to execute**. They're configured in `.claude/settings.json`.

### 5.1 Complete Hooks Configuration

**File:** `.claude/settings.json`

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "cmd=$(echo $CLAUDE_TOOL_INPUT | jq -r '.command // empty'); if echo \"$cmd\" | grep -qE 'rm -rf|drop database|format|shutdown'; then echo 'BLOCKED: Destructive command detected' >&2; exit 2; fi",
            "statusMessage": "🛡️ Checking command safety..."
          }
        ]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "file_path=$(echo $CLAUDE_TOOL_INPUT | jq -r '.file_path // empty'); if echo \"$file_path\" | grep -qE '\\.env$|\\.env\\.local$'; then echo 'BLOCKED: Cannot modify .env files directly — use .env.example instead' >&2; exit 2; fi",
            "statusMessage": "🔒 Validating file access..."
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "file_path=$(echo $CLAUDE_TOOL_INPUT | jq -r '.file_path // empty'); ext=\"${file_path##*.}\"; if [[ \"$ext\" =~ ^(js|jsx|ts|tsx|css|json|md)$ ]]; then npx prettier --write \"$file_path\" 2>/dev/null; fi",
            "statusMessage": "✨ Auto-formatting with Prettier..."
          }
        ]
      },
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "file_path=$(echo $CLAUDE_TOOL_INPUT | jq -r '.file_path // empty'); ext=\"${file_path##*.}\"; if [[ \"$ext\" =~ ^(js|jsx)$ ]]; then npx eslint \"$file_path\" --fix --quiet 2>/dev/null; fi",
            "statusMessage": "🔍 Running ESLint auto-fix..."
          }
        ]
      }
    ],
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -Command \"[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Claude Code needs your attention', 'CodeNexus Dev')\"",
            "statusMessage": "📢 Sending notification..."
          }
        ]
      }
    ]
  }
}
```

### 5.2 Hook Breakdown by Purpose

| Hook Event | Matcher | Purpose | Action |
|---|---|---|---|
| **PreToolUse** | `Bash` | **Security gate** — block destructive commands | Check for `rm -rf`, `drop database`, etc. → exit 2 to block |
| **PreToolUse** | `Write\|Edit` | **Protect .env files** — prevent accidental exposure | Block writes to `.env` files → redirect to `.env.example` |
| **PostToolUse** | `Write\|Edit` | **Auto-format** — consistent code style | Run Prettier on every file Claude writes or edits |
| **PostToolUse** | `Write\|Edit` | **Auto-lint** — catch issues immediately | Run ESLint --fix on JS/JSX files after editing |
| **Notification** | `*` (all) | **Alert developer** — don't miss prompts | Windows notification popup when Claude needs input |

### 5.3 Advanced Hook: Auto-Test After Model Changes

```json
{
  "PostToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "file_path=$(echo $CLAUDE_TOOL_INPUT | jq -r '.file_path // empty'); if echo \"$file_path\" | grep -qE 'models/.*\\.js$'; then cd server && npx vitest run --reporter=verbose tests/unit/models/ 2>&1 | tail -5; fi",
          "statusMessage": "🧪 Running model tests..."
        }
      ]
    }
  ]
}
```

---

## 6. Sub-Agent Orchestration — Parallel Workflows

Sub-agents are specialized AI instances spawned by the lead agent for focused, isolated tasks. They're your key to **10x speed** — while one agent builds the frontend, another builds the backend simultaneously.

### 6.1 Agent Definitions

Create agent definition files in `.claude/agents/`:

#### Frontend Agent

**File:** `.claude/agents/frontend-agent.md`

```markdown
# Frontend Agent

## Role
You are a senior React developer specializing in IDE-like web applications.
You work exclusively within the `client/` directory.

## Expertise
- React 18 with functional components and hooks
- Zustand state management
- Monaco Editor (@monaco-editor/react) integration
- React Flow for interactive graph visualization
- Framer Motion for animations
- Vanilla CSS with CSS variables

## Constraints
- NEVER modify files outside `client/`
- NEVER modify server code
- Use CSS variables from `client/src/styles/index.css`
- Use Zustand stores from `client/src/stores/`
- Use Lucide React for icons
- All components must handle: loading, error, and empty states

## Reference
- UI/UX Design Brief: @docs/04_UI_UX_Design_Brief.md
- Component patterns: @client/src/components/
```

#### Backend Agent

**File:** `.claude/agents/backend-agent.md`

```markdown
# Backend Agent

## Role
You are a senior Node.js developer specializing in Express.js APIs and MongoDB.
You work exclusively within the `server/` directory.

## Expertise
- Express.js 4 with middleware architecture
- Mongoose 8 ODM with MongoDB 7
- JWT authentication with bcrypt
- Socket.IO for real-time communication
- OpenAI SDK for LLM integration
- Joi/Zod for request validation

## Constraints
- NEVER modify files outside `server/`
- NEVER modify client code
- ALL routes must have validation middleware
- ALL controllers must use try-catch with centralized error handler
- ALL AI calls must go through the AIService abstraction layer
- Response format: { success: true/false, data/error }

## Reference
- Backend Schema: @docs/05_Backend_Schema.md
- API conventions: @docs/02_TRD.md
```

#### AI Integration Agent

**File:** `.claude/agents/ai-integration-agent.md`

```markdown
# AI Integration Agent

## Role
You are a prompt engineer and AI integration specialist.
You work on prompt templates in `server/src/prompts/` and the AI service layer in `server/src/services/ai/`.

## Expertise
- OpenAI API (GPT-4o, GPT-4o-mini) with streaming
- Prompt engineering best practices
- Token budget management
- AI response parsing and validation
- Provider-agnostic abstraction patterns

## Constraints
- ALL prompts must request JSON output for structured data
- ALL prompts must include Decision Memory context
- Keep static prompt content under 4000 tokens
- Always handle: rate limits, timeouts, malformed responses
- Implement fallback to secondary model on failure

## Reference
- Prompt patterns: @server/src/prompts/
- AI Service: @server/src/services/ai/AIService.js
```

#### Visualization Agent

**File:** `.claude/agents/visualization-agent.md`

```markdown
# Visualization Agent

## Role
You are a data visualization specialist working with React Flow and D3.js.
You build interactive code visualizations for the Explain My Code feature.

## Expertise
- React Flow 11 (nodes, edges, custom components, layout)
- dagre for hierarchical graph layout
- D3.js for charts and metrics visualization
- @babel/parser for AST parsing
- Graph algorithms (DFS, BFS, cycle detection)

## Constraints
- Use React Flow, NOT vis.js or cytoscape
- Use dagre for layout computation
- All graph nodes must be clickable (navigate to source)
- Canvas background: dot grid pattern
- Export support: PNG and SVG via html-to-image

## Reference
- Visualization specs: @docs/04_UI_UX_Design_Brief.md (Section 5.8)
```

#### Testing Agent

**File:** `.claude/agents/testing-agent.md`

```markdown
# Testing Agent

## Role
You are a QA engineer writing comprehensive tests for CodeNexus.

## Expertise
- Vitest for unit and integration tests
- @testing-library/react for component tests
- Supertest for API endpoint tests
- Playwright for E2E tests

## Constraints
- Use Vitest (vi.fn(), vi.mock()), NOT Jest
- Test files go in `tests/` directories
- Mock external dependencies (API, database)
- Every test file must have: happy path, edge case, error case
- Run tests after writing to verify they pass
```

#### Security Agent

**File:** `.claude/agents/security-agent.md`

```markdown
# Security Agent

## Role
You are a security auditor reviewing the CodeNexus codebase for vulnerabilities.

## Focus Areas
- API key exposure in client-side code
- SQL/NoSQL injection vulnerabilities
- XSS attack vectors
- JWT implementation issues
- Rate limiting effectiveness
- Input validation completeness
- Dependency vulnerabilities (npm audit)

## Output Format
Report findings as:
- CRITICAL: Must fix before deployment
- WARNING: Should fix soon
- INFO: Improvement suggestion
```

### 6.2 Multi-Agent Orchestration Patterns

Here's how to use sub-agents for each development phase:

#### Pattern 1: Parallel Frontend + Backend Development

```
Lead Agent (You)
  │
  ├─ Spawn: Frontend Agent
  │   └─ Task: "Build the IntentPanel, IntentSelector, IntentResults,
  │            and ConfidenceBadge components following the UI/UX
  │            Design Brief Section 5.7. Use the aiStore for state."
  │
  ├─ Spawn: Backend Agent
  │   └─ Task: "Build the POST /api/v1/ai/intent endpoint with
  │            route, controller, service, and prompt template.
  │            Follow the Backend Schema Doc for response format."
  │
  └─ Lead: Wait for both → Wire frontend to backend → Test end-to-end
```

#### Pattern 2: Research → Plan → Execute

```
Lead Agent (You)
  │
  ├─ Spawn: Research Sub-Agent
  │   └─ Task: "Read @docs/01_PRD.md and @docs/02_TRD.md. Summarize
  │            all requirements for the Decision Memory feature. List
  │            every file that needs to be created or modified."
  │
  └─ Lead: Receive summary → Create plan → Execute with skills
```

#### Pattern 3: Build → Test → Review

```
Lead Agent (You)
  │
  ├─ Phase 1: Build (Lead handles, uses skills)
  │   └─ /build-component ChatPanel
  │   └─ /create-api-route POST /ai/chat
  │
  ├─ Phase 2: Spawn Testing Agent
  │   └─ Task: "Write comprehensive tests for ChatPanel.jsx,
  │            ai.controller.js handleChat, and aiService.js chat"
  │
  └─ Phase 3: Spawn Security Agent
      └─ Task: "Review server/src/controllers/ai.controller.js and
               server/src/services/ai/ for security vulnerabilities.
               Check for: API key exposure, injection, rate limiting."
```

---

## 7. Feature-by-Feature Agent Strategy

This is the **master reference** for which Claude capabilities to use for each CodeNexus feature:

### Feature 1: Project Setup & Infrastructure

| Capability | Usage |
|---|---|
| **CLAUDE.md** | Load project context, tech stack, and conventions |
| **Lead Agent** | Run Vite scaffolding, install dependencies, configure workspaces |
| **Hooks** | PostToolUse → auto-format all generated config files |
| **Skills Used** | None yet — this is foundation work |
| **Sub-Agents** | Not needed — single-agent task |

**Best Approach:** Single agent session. Use Claude Code's `/init` to generate initial CLAUDE.md, then manually refine.

---

### Feature 2: Core Layout & Monaco Editor

| Capability | Usage |
|---|---|
| **CLAUDE.md** | References UI/UX Design Brief for colors, spacing, typography |
| **Skills Used** | `/build-component` for AppLayout, Sidebar, TopBar, BottomBar |
| **Skills Used** | `/create-zustand-store` for editorStore, fileStore, uiStore |
| **Hooks** | PostToolUse → Prettier formats all new CSS and JSX files |
| **Sub-Agents** | Not needed — focused frontend work |

**Best Approach:** Single agent using `/build-component` skill repeatedly. Create stores first, then layout components, then Monaco wrapper.

---

### Feature 3: File Explorer & Virtual File System

| Capability | Usage |
|---|---|
| **Skills Used** | `/build-component` for FileExplorer, FileTreeNode, FileContextMenu |
| **Skills Used** | `/create-api-route` for GET/POST/PUT/DELETE /files endpoints |
| **Skills Used** | `/add-mongoose-model` for File model |
| **Sub-Agents** | **2 parallel agents:** Frontend Agent (components) + Backend Agent (API + model) |
| **Hooks** | PostToolUse → auto-lint JS files |

**Best Approach:** Spawn 2 sub-agents in parallel. Frontend Agent builds the tree UI; Backend Agent builds the File model, routes, controllers. Lead agent wires them together.

---

### Feature 4: Intent Mode

| Capability | Usage |
|---|---|
| **Skills Used** | `/add-ai-feature` — creates the full AI pipeline |
| **Skills Used** | `/create-prompt-template` for intent.prompts.js |
| **Skills Used** | `/build-component` for IntentPanel, IntentSelector, IntentResults |
| **Skills Used** | `/create-api-route` for POST /ai/intent |
| **Sub-Agents** | **3 parallel agents:** Frontend Agent + Backend Agent + AI Integration Agent |
| **Hooks** | PostToolUse → run lint + format on all new files |

**Best Approach:** This is the most complex feature. Use the Orchestrator pattern:
1. AI Integration Agent → builds prompt template + AIService provider abstraction
2. Backend Agent → builds the endpoint, controller, SSE streaming
3. Frontend Agent → builds IntentPanel UI with diff viewer
4. Lead agent → integrates and tests end-to-end

---

### Feature 5: Explain My Code (Visualization)

| Capability | Usage |
|---|---|
| **Skills Used** | `/build-visualization` for each graph type |
| **Skills Used** | `/create-api-route` for POST /ai/explain |
| **Sub-Agents** | **2 parallel agents:** Visualization Agent + Backend Agent |
| **Hooks** | PostToolUse → format generated code |

**Best Approach:** Spawn Visualization Agent (React Flow components + dagre layout) and Backend Agent (AST parsing + graph generation) in parallel.

---

### Feature 6: Decision Memory

| Capability | Usage |
|---|---|
| **Skills Used** | `/add-mongoose-model` for Decision model |
| **Skills Used** | `/create-api-route` for CRUD + pattern detection endpoints |
| **Skills Used** | `/build-component` for DecisionTimeline, DecisionCard, PatternDetector |
| **Skills Used** | `/create-prompt-template` for pattern detection prompts |
| **Sub-Agents** | **3 agents:** Frontend Agent + Backend Agent + AI Agent (pattern detection) |
| **Hooks** | PostToolUse → run model tests after schema changes |

**Best Approach:** This feature touches everything. Build backend first (model, API), then frontend (timeline, search), then AI integration (pattern detection), then wire Decision Memory context into all existing AI prompts.

---

### Feature 7: Smart Contextual Chat

| Capability | Usage |
|---|---|
| **Skills Used** | `/add-ai-feature` for full chat pipeline |
| **Skills Used** | `/build-component` for ChatPanel, ChatMessage, ChatInput, CommandPalette |
| **Skills Used** | `/create-prompt-template` for chat.prompts.js |
| **Sub-Agents** | **2 agents:** Frontend Agent (chat UI) + Backend Agent (streaming endpoint) |
| **Hooks** | PostToolUse → format all new files |

---

### Feature 8: AI Code Review

| Capability | Usage |
|---|---|
| **Skills Used** | `/add-ai-feature` for review pipeline |
| **Skills Used** | `/create-prompt-template` for review.prompts.js |
| **Skills Used** | `/build-component` for ReviewPanel, ReviewAnnotation |
| **Sub-Agents** | **2 agents:** Frontend Agent + Backend Agent |
| **Hooks** | PostToolUse → run lint after review-related code changes |

---

### Feature 9: Code Health Dashboard

| Capability | Usage |
|---|---|
| **Skills Used** | `/build-component` for HealthDashboard, HealthScoreCard, MetricChart |
| **Skills Used** | `/build-visualization` for D3.js sparkline charts |
| **Skills Used** | `/create-api-route` for health endpoints |
| **Sub-Agents** | **2 agents:** Visualization Agent (D3 charts) + Backend Agent (metrics engine) |
| **Hooks** | PostToolUse → format code |

---

### Feature 10: Authentication & Project Management

| Capability | Usage |
|---|---|
| **Skills Used** | `/add-mongoose-model` for User and Project models |
| **Skills Used** | `/create-api-route` for auth + project endpoints |
| **Skills Used** | `/build-component` for LoginPage, DashboardPage, ProjectCard |
| **Sub-Agents** | **2 agents:** Frontend Agent + Backend Agent |
| **Security Agent** | Spawn to review auth implementation |
| **Hooks** | PreToolUse → block writes to .env (use .env.example) |

---

### Feature 11: Terminal Integration & Regex

| Capability | Usage |
|---|---|
| **Skills Used** | `/build-component` for TerminalPanel, RegexPlayground |
| **Sub-Agents** | Single agent — these are self-contained features |
| **Hooks** | PostToolUse → format code |

---

### Feature 12: Landing Page & Polish

| Capability | Usage |
|---|---|
| **Skills Used** | `/build-component` for landing page sections |
| **Sub-Agents** | **2 agents:** Frontend Agent (landing page) + Testing Agent (E2E tests) |
| **Skills Used** | `/run-full-review` for final quality check |
| **Security Agent** | Final security audit |

---

### Summary: Agent Deployment Map

```
Phase 1 (Weeks 1-3)  → 1 Lead Agent (setup is sequential)
Phase 2 (Weeks 4-7)  → 3 Sub-Agents per feature (Frontend + Backend + AI)
Phase 3 (Weeks 8-10) → 3 Sub-Agents per feature + Testing Agent
Phase 4 (Weeks 11-13)→ 2 Sub-Agents per feature
Phase 5 (Weeks 14-16)→ Testing Agent + Security Agent + Lead (polish)
```

---

## 8. Settings Configuration

### 8.1 Global Settings (~/.claude/settings.json)

These are your personal preferences that apply to ALL projects:

```json
{
  "model": "claude-opus-4-6-thinking",
  "theme": "dark",
  "verbose": true,
  "autoApprove": ["Write", "Edit", "Bash(npm run *)"],
  "hooks": {
    "Notification": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "powershell -Command \"[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('Claude needs attention', 'Claude Code')\""
          }
        ]
      }
    ]
  }
}
```

### 8.2 Project Settings (.claude/settings.json)

See Section 5.1 for the complete project hooks configuration.

---

## 9. Productivity Multiplier Tactics

### 9.1 The "Skill Chain" Pattern

Instead of giving Claude a massive prompt, chain skills together:

```
You: "Build the Intent Mode feature"

Claude (internally):
  1. /create-prompt-template → server/src/prompts/intent.prompts.js
  2. /create-api-route → POST /api/v1/ai/intent
  3. /create-zustand-store → aiStore.js
  4. /build-component → IntentPanel.jsx
  5. /build-component → IntentSelector.jsx
  6. /build-component → IntentResults.jsx
  7. /write-tests → tests for all new files
```

### 9.2 The "Context Injection" Pattern

Before complex work, prime Claude with the right context:

```
You: "Read @docs/04_UI_UX_Design_Brief.md Section 5.7 (Intent Panel Design) 
      and @docs/05_Backend_Schema.md Section 3.2 (AI Endpoints), then build 
      Intent Mode."
```

This uses the `@file` reference syntax to load specific documentation into context before executing.

### 9.3 The "Checkpoint" Pattern

After each feature, run a quality checkpoint:

```
You: "/run-full-review"
Claude:
  ✅ Lint: 0 errors
  ✅ Tests: 47/47 passing
  ⚠️ Found 2 console.log statements in ChatPanel.jsx
  ⚠️ Missing error handling in memoryService.js line 34
  ✅ No hardcoded values detected
```

### 9.4 The "Git Worktree" Pattern for True Parallelism

For maximum speed, create git worktrees so multiple agents can work on the codebase simultaneously without conflicts:

```bash
# Create worktrees for parallel work
git worktree add ../codenexus-frontend feature/frontend
git worktree add ../codenexus-backend feature/backend

# Spawn agents in different worktrees
# Agent 1: works in ../codenexus-frontend/
# Agent 2: works in ../codenexus-backend/

# Merge results
git merge feature/frontend
git merge feature/backend
```

### 9.5 The "Decision Log" Pattern

After every significant coding session, ask Claude to record decisions:

```
You: "Summarize the 5 most important decisions made in this session 
      and add them to docs/architecture-decisions/ as ADR files."
```

This creates a paper trail that feeds back into Decision Memory.

### 9.6 Session Kickoff Template

Start every coding session with this prompt to prime Claude:

```
"I'm continuing work on CodeNexus. Current phase: [Phase 2 - AI Core Features].
Today's focus: [Intent Mode backend and frontend].
Read CLAUDE.md for project context.
Read @docs/06_Implementation_Plan.md Phase 2, Week 5 for today's tasks.
Let's start with Step 5.1: Intent Mode Backend."
```

---

## 10. Quick Command Reference

| What You Want to Do | Command / Action |
|---|---|
| Start a new session | `claude` (reads CLAUDE.md automatically) |
| Initialize project CLAUDE.md | `/init` |
| Build a component | `/build-component {name}` |
| Create an API route | `/create-api-route {path}` |
| Add an AI feature | `/add-ai-feature {name}` |
| Create a Zustand store | `/create-zustand-store {name}` |
| Add a database model | `/add-mongoose-model {name}` |
| Create a prompt template | `/create-prompt-template {name}` |
| Build a visualization | `/build-visualization {type}` |
| Write tests for a file | `/write-tests {filepath}` |
| Run full quality review | `/run-full-review` |
| Spawn a sub-agent | "Spawn a frontend agent to build [component]" |
| Configure hooks | Edit `.claude/settings.json` |
| Check hook status | `/hooks` |
| Manage agents | `/agents` |
| View all available skills | `/skills` |
