# Multi-Agent Orchestration Playbook
## CodeNexus — Phase-by-Phase Build Execution Guide

**Version:** 1.0 | **Date:** June 2026  
**Lead Orchestrator:** Claude (Opus/Sonnet with Thinking)  
**Repository:** https://github.com/bharat-bhangale/CodeNexus

---

> **How to use this playbook:**
> Each phase below gives you the **exact prompts** to give each sub-agent, the **skills** to invoke,
> the **integration steps** the lead performs, and the **verification checklist** before moving on.
> Never start the next phase until the current phase's checklist is fully green.

---

## Agent Roster

| Agent | Invoke With | Scope |
|---|---|---|
| **Lead (You)** | Direct session | Entire repo — orchestrates and integrates |
| **Frontend Agent** | "Act as the Frontend Agent defined in @.claude/agents/frontend-agent.md" | `client/` only |
| **Backend Agent** | "Act as the Backend Agent defined in @.claude/agents/backend-agent.md" | `server/` only |
| **AI Integration Agent** | "Act as the AI Integration Agent defined in @.claude/agents/ai-integration-agent.md" | `server/src/prompts/` + `server/src/services/ai/` |
| **Visualization Agent** | "Act as the Visualization Agent defined in @.claude/agents/visualization-agent.md" | `client/src/components/visualize/` + `server/src/services/GraphGenerator.ts` |
| **Testing Agent** | "Act as the Testing Agent defined in @.claude/agents/testing-agent.md" | `*/tests/` directories |
| **Security Agent** | "Act as the Security Agent defined in @.claude/agents/security-agent.md" | Entire codebase (read-only) |

## Skill Roster

| Skill | Command | Time Estimate |
|---|---|---|
| Build React Component | `/build-component` | 5–10 min |
| Create API Route | `/create-api-route` | 5–10 min |
| Add AI Feature Pipeline | `/add-ai-feature` | 15–20 min |
| Create Zustand Store | `/create-zustand-store` | 3–5 min |
| Add Mongoose Model | `/add-mongoose-model` | 5–8 min |
| Create Prompt Template | `/create-prompt-template` | 8–12 min |
| Build Visualization | `/build-visualization` | 15–25 min |
| Write Tests | `/write-tests` | 5–10 min |
| Run Full Review | `/run-full-review` | 5 min |
| Deploy Check | `/deploy-check` | 8 min |

---

---

# PHASE 1 — Foundation
**Weeks 1–3 | Single Lead Agent | Sequential**

> Phase 1 is strictly sequential — no sub-agents. The lead agent handles everything
> because these tasks are interdependent and must be set up in exact order.

---

## Phase 1, Step 1 — Initialize Monorepo

### Exact Prompt to Give Lead Agent

```
Act as a senior full-stack engineer.

Read @.claude/CLAUDE.md for full project context.
Read @docs/06_Implementation_Plan.md Phase 1 for the task list.

TASK: Initialize the CodeNexus monorepo. Do the following in exact order:

1. Create root package.tson with npm workspaces:
   - workspaces: ["client", "server", "shared"]
   - scripts: dev (runs both), test (runs both), lint (runs both), build

2. Create client/ using Next.js template:
   - npx create-vite@latest client --template react
   - Install: zustand @monaco-editor/react reactflow @xyflow/react dagre
     lucide-react framer-motion @xterm/xterm @xterm/addon-fit axios socket.io-client

3. Create server/ as Node.ts project:
   - npm init -y inside server/
   - Install: express mongoose dotenv jsonwebtoken bcryptjs cors
     helmet morgan express-rate-limit joi socket.io openai
     @babel/parser @babel/traverse
   - Install dev: nodemon vitest supertest

4. Create shared/ with:
   - constants.ts (API base URL, event names, feature flags)
   - types.ts (JSDoc type definitions for shared data shapes)

5. Create root .env.example documenting all required server env vars:
   PORT, MONGODB_URI, JWT_SECRET, JWT_EXPIRY, OPENAI_API_KEY,
   CORS_ORIGIN, NODE_ENV, REDIS_URL (optional)

6. Create root-level configs:
   - .prettierrc (singleQuote: true, trailingComma: all, tabWidth: 2)
   - .eslintrc.tson (extends eslint:recommended, react/recommended)
   - .gitattributes (normalize line endings)

7. Verify: run "npm run dev" from root. Both servers must start without errors.

OUTPUT: List every file created with its path and a one-line description.
```

### Skills to Invoke
- None (manual scaffold, then skills activate for feature work)

### Integration Steps (Lead)
1. Verify `npm run dev` starts both services
2. Verify `http://localhost:3000` shows Vite React default page
3. Verify `http://localhost:3001/api/v1/health` returns `{ success: true }`

### ✅ Phase 1, Step 1 Checklist
- [ ] Root `package.tson` has workspaces
- [ ] `client/` starts on port 3000
- [ ] `server/` starts on port 3001
- [ ] `/api/v1/health` endpoint responds
- [ ] `.env.example` documents all required vars
- [ ] Prettier and ESLint configs exist

---

## Phase 1, Step 2 — Core Folder Structure & CSS Variables

### Exact Prompt to Give Lead Agent

```
Act as a senior full-stack engineer.
Read @.claude/CLAUDE.md for conventions.
Read @docs/04_UI_UX_Design_Brief.md for the design system.

TASK: Create the complete folder structure and design system for CodeNexus.

1. Create ALL directories in client/src/ (create placeholder index.ts in each):
   components/{layout,editor,explorer,chat,intent,visualize,memory,health,review,terminal,common}
   hooks/, stores/, services/, utils/, themes/, styles/

2. Create client/src/styles/index.css with the COMPLETE design token system:
   - Color tokens: --bg-primary (#0d1117), --bg-secondary (#161b22), --bg-surface (#21262d),
     --bg-overlay (#30363d), --text-primary (#e6edf3), --text-secondary (#8b949e),
     --text-muted (#484f58), --accent-primary (#58a6ff), --accent-secondary (#f78166),
     --accent-success (#3fb950), --accent-warning (#d29922), --border-subtle (#30363d),
     --border-default (#21262d)
   - Spacing scale: --space-1 through --space-8 (4px to 64px)
   - Border radius: --radius-sm (4px), --radius-md (8px), --radius-lg (12px), --radius-xl (20px)
   - Typography scale: --font-size-xs through --font-size-2xl
   - Shadows: --shadow-sm, --shadow-md, --shadow-lg, --shadow-glow (accent colored)
   - Transitions: --transition-fast (0.15s ease), --transition-base (0.2s ease)
   - Font: Import 'Inter' from Google Fonts, set as base font

3. Create ALL remaining CSS files (empty with header comment):
   client/src/styles/{layout,editor,chat,intent,visualize,memory,health,review,terminal,common}.css

4. Create server/src/ complete folder structure:
   routes/, controllers/, services/ai/, models/, middleware/, sockets/, prompts/, utils/

OUTPUT: List all directories and files created.
```

### Skills to Invoke
- None yet (creating foundation for skills to use)

### ✅ Phase 1, Step 2 Checklist
- [ ] All `client/src/` directories exist
- [ ] `index.css` has all CSS custom properties (30+ tokens)
- [ ] All `server/src/` directories exist
- [ ] Inter font is imported and applied

---

## Phase 1, Step 3 — Core Layout & App Shell

### Exact Prompt to Give Lead Agent (Frontend scope)

```
Act as the Frontend Agent defined in @.claude/agents/frontend-agent.md

Read @.claude/CLAUDE.md for conventions.
Read @docs/04_UI_UX_Design_Brief.md Section 5.1–5.3 for layout specs.

TASK: Build the core application shell — the skeleton that all features plug into.

Step 1 — Invoke /create-zustand-store for each store:
  - editorStore: { openFiles, activeFile, language, fontSize, theme, cursorPosition, selection }
  - fileStore: { projectTree, selectedFile, isLoading, error }
  - uiStore: { activePanel, sidebarWidth, bottomPanelHeight, isDragging, notifications }
  - aiStore: { isStreaming, activeFeature, lastResponse, error }

Step 2 — Build AppLayout.tsx (client/src/components/layout/):
  - Three-column layout: Sidebar (240px) | Editor Area (flex) | Right Panel (320px, collapsible)
  - Top bar: 40px
  - Bottom bar: 24px
  - Bottom panel (terminal/output): 200px, collapsible
  - Use CSS Grid: "sidebar editor rightpanel" / "sidebar editor rightpanel" / "bottombar bottombar bottombar"

Step 3 — Build Sidebar.tsx:
  - Icon rail (48px wide) with icons: Files, Search, Git, Extensions
  - Active icon opens corresponding panel below
  - Panel section (192px): file explorer or search results
  - Use lucide-react icons

Step 4 — Build TopBar.tsx:
  - Left: CodeNexus logo + project name
  - Center: Breadcrumb path of active file
  - Right: Intent Mode button, AI status indicator, Settings icon

Step 5 — Build BottomBar.tsx:
  - Left: git branch name, line/column position
  - Right: language mode, encoding, spaces indicator, notifications count

Step 6 — Update client/src/App.tsx to render AppLayout with placeholder panels.

Use /build-component skill for each component.
All layout measurements use CSS variables.
```

### Skills to Invoke (in order)
1. `/create-zustand-store` × 4 (one per store)
2. `/build-component` × 4 (AppLayout, Sidebar, TopBar, BottomBar)

### ✅ Phase 1, Step 3 Checklist
- [ ] 4 Zustand stores created with tests
- [ ] App shell renders at `http://localhost:3000`
- [ ] Layout is 3-column with correct proportions
- [ ] Sidebar, TopBar, BottomBar all visible

---

## Phase 1, Step 4 — Monaco Editor Integration

### Exact Prompt to Give Lead Agent (Frontend scope)

```
Act as the Frontend Agent defined in @.claude/agents/frontend-agent.md

TASK: Integrate Monaco Editor as the core code editing surface.

1. Build CodeEditor.tsx (client/src/components/editor/):
   - Use @monaco-editor/react package
   - Props: filePath, language, value, onChange, theme
   - Configure: minimap (enabled), fontSize (from editorStore), wordWrap, tabSize: 2
   - Custom dark theme matching CodeNexus CSS variables (--bg-primary, --text-primary, --accent-primary)
   - Keyboard shortcuts: Ctrl+S (save), Ctrl+/ (toggle comment), Ctrl+Shift+P (command palette)
   - On mount: register completion provider placeholder for AI completions

2. Build EditorTabs.tsx:
   - Tab per open file (from editorStore.openFiles)
   - Active tab highlighted with --accent-primary underline
   - Close button (×) on each tab
   - Unsaved indicator: dot before filename
   - Overflow: scroll horizontally

3. Build DiffViewer.tsx:
   - Uses Monaco's built-in diff editor (@monaco-editor/react DiffEditor)
   - Props: original, modified, language
   - Used by Intent Mode and Code Review panels

4. Update editorStore to handle:
   - openFile(path, content, language)
   - closeFile(path)
   - updateContent(path, newContent)
   - markSaved(path) / markUnsaved(path)

5. Wire CodeEditor and EditorTabs into AppLayout's editor area.

Use /build-component skill for each component.
```

### Skills to Invoke
1. `/build-component` × 3 (CodeEditor, EditorTabs, DiffViewer)

### ✅ Phase 1, Step 4 Checklist
- [ ] Monaco editor renders with dark theme
- [ ] Tabs open/close/switch correctly
- [ ] Custom theme matches CodeNexus design
- [ ] DiffViewer renders side-by-side diff

---

## Phase 1, Step 5 — Express Server Foundation

### Exact Prompt to Give Lead Agent (Backend scope)

```
Act as the Backend Agent defined in @.claude/agents/backend-agent.md

Read @docs/05_Backend_Schema.md for API conventions.

TASK: Build the Express server foundation — all middleware, health check, and error handling.

1. Create server/src/app.ts:
   - Express app with helmet, cors (CORS_ORIGIN env var), morgan (dev), express.tson()
   - Mount all route files at /api/v1/
   - Add 404 handler for unmatched routes
   - Add centralized error handler (last middleware)
   - Export app (do NOT call app.listen here)

2. Create server/src/index.ts:
   - Import app, connect to MongoDB, then app.listen(PORT)
   - Log: "🚀 CodeNexus server running on port {PORT}"
   - Log: "📦 MongoDB connected to {DB_NAME}"
   - Graceful shutdown on SIGTERM/SIGINT

3. Create server/src/middleware/errorHandler.middleware.ts:
   - Catch all errors passed via next(error)
   - Handle: ValidationError (400), CastError (400), JWT errors (401), duplicate key (409)
   - Log error in development, sanitize in production
   - Response format: { success: false, error: { code, message, details } }

4. Create server/src/middleware/auth.middleware.ts:
   - Verify JWT from httpOnly cookie OR Authorization Bearer header
   - Attach req.user = { id, email, role }
   - Return 401 if invalid/expired

5. Create server/src/middleware/rateLimiter.middleware.ts:
   - General limit: 100 req/15min per IP
   - AI endpoints limit: 20 req/min per user

6. Create server/src/middleware/validation.middleware.ts:
   - validate(schema) → middleware that validates req.body with Joi schema
   - Returns 400 with field-level errors on failure

7. Create GET /api/v1/health route returning:
   { success: true, data: { status: "ok", timestamp, uptime, version } }

Use /create-api-route skill for the health endpoint.
```

### Skills to Invoke
1. `/create-api-route` for `/api/v1/health`

### ✅ Phase 1, Step 5 Checklist
- [ ] `GET /api/v1/health` returns 200
- [ ] 404 handler returns proper error format
- [ ] Error handler catches and formats errors correctly
- [ ] Auth middleware rejects requests without valid JWT
- [ ] Rate limiter responds with 429 when exceeded

---

## Phase 1, Step 6 — File Explorer & Virtual File System

### Prompts for Parallel Agent Work

**Backend Agent Prompt:**
```
Act as the Backend Agent defined in @.claude/agents/backend-agent.md

TASK: Build the File System API for CodeNexus.

1. Use /add-mongoose-model to create server/src/models/Project.ts:
   Fields: userId, name, description, language, framework, status (active/archived),
   settings: { tabSize, fontSize, theme }, createdAt, updatedAt

2. Use /add-mongoose-model to create server/src/models/File.ts:
   Fields: projectId, userId, path, name, extension, content, size, language,
   mimeType, isDirectory, parentPath, createdAt, updatedAt
   Index: compound (projectId + path) for fast lookups

3. Use /create-api-route to create:
   - GET  /api/v1/projects — list user projects
   - POST /api/v1/projects — create project
   - GET  /api/v1/projects/:id — get project with file tree
   - GET  /api/v1/projects/:id/files — get file tree (nested)
   - POST /api/v1/projects/:id/files — create file or folder
   - GET  /api/v1/projects/:projectId/files/:fileId — get file content
   - PUT  /api/v1/projects/:projectId/files/:fileId — update file content
   - DELETE /api/v1/projects/:projectId/files/:fileId — delete file

Reference @docs/05_Backend_Schema.md for exact schema definitions.
```

**Frontend Agent Prompt:**
```
Act as the Frontend Agent defined in @.claude/agents/frontend-agent.md

TASK: Build the File Explorer panel and connect it to the fileStore.

1. Use /build-component to create FileExplorer.tsx:
   - Tree view of project files from fileStore.projectTree
   - Collapsible folders with chevron icon
   - File icons by extension (use lucide-react icons mapped to language)
   - Click file → opens in editor (calls editorStore.openFile)
   - Right-click context menu (FileContextMenu.tsx): New File, New Folder, Rename, Delete

2. Use /build-component to create FileTreeNode.tsx:
   - Recursive component for each node
   - Indent by depth (12px per level)
   - Hover: background highlight with --bg-overlay

3. Use /build-component to create FileContextMenu.tsx:
   - Floating menu positioned at click coordinates
   - Dismiss on outside click or Escape

4. Update fileStore to add:
   - loadProject(projectId) — fetch tree from API
   - createFile(projectId, path, isDirectory)
   - deleteFile(projectId, fileId)
   - renameFile(projectId, fileId, newName)

Reference @docs/04_UI_UX_Design_Brief.md for component dimensions.
```

### Skills to Invoke
- Backend: `/add-mongoose-model` × 2, `/create-api-route` × 8
- Frontend: `/build-component` × 3

### Integration Steps (Lead)
```
After both agents complete:
1. Update client/src/services/fileService.ts with all API calls
2. Wire fileStore.loadProject() to call fileService on app startup
3. Verify: file tree loads, clicking opens file in Monaco editor
4. Run /run-full-review
```

### ✅ Phase 1 Complete Checklist
- [ ] All API endpoints return correct status codes
- [ ] File tree renders project structure
- [ ] Clicking a file opens it in Monaco
- [ ] Create/delete/rename operations work
- [ ] All tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] `/run-full-review` shows no critical issues

---
---

# PHASE 2 — AI Core Features
**Weeks 4–7 | 3-Agent Pattern Per Feature**

> For each feature in Phase 2, use the **Full Feature Pipeline (Pattern 4)**:
> AI Integration Agent → Backend Agent → Frontend Agent → Lead integrates.

---

## Phase 2, Feature 1 — Intent Mode

### Step 1: AI Integration Agent Prompt

```
Act as the AI Integration Agent defined in @.claude/agents/ai-integration-agent.md

Read @docs/01_PRD.md Section "Intent Mode" for feature requirements.
Read existing prompts in @server/src/prompts/ for style reference.

TASK: Build the Intent Mode AI pipeline.

1. Use /create-prompt-template to create server/src/prompts/intent.prompts.ts:
   - Feature name: Intent Mode
   - AI specialty: "code transformation specialist who understands developer intent"
   - Context required: code, language, selectedLines, intentType, decisionHistory
   - intentType enum: "performance" | "security" | "readability" | "scalability" | "test-coverage"
   - Output format:
     {
       "transformedCode": "complete modified file content",
       "changes": [{ "line": 0, "before": "", "after": "", "reason": "" }],
       "summary": "what was changed and why",
       "confidence": 0-100,
       "alternativeApproaches": ["..."]
     }
   - System prompt must include: "You are transforming code with a specific intent.
     Do NOT change behavior — only optimize for [intentType]. Preserve all tests."
   - Include token budget management (truncate large files to 150 lines max)

2. Add streaming method to server/src/services/ai/AIService.ts:
   - Method: streamIntentAnalysis({ code, language, intentType, context, decisionHistory })
   - Must stream JSON chunks progressively
   - Emit partial tokens as they arrive, parse complete JSON at the end
   - Fallback: if streaming fails, return complete response

3. Verify prompt generates valid JSON by testing with a sample code snippet.
```

### Step 2: Backend Agent Prompt

```
Act as the Backend Agent defined in @.claude/agents/backend-agent.md

Read @server/src/prompts/intent.prompts.ts (just created).
Read @docs/05_Backend_Schema.md for API conventions.

TASK: Build the Intent Mode API endpoint.

1. Use /create-api-route to create POST /api/v1/ai/intent:
   Request body: { projectId, filePath, code, language, intentType, selectedLines? }
   Validation: all fields required except selectedLines
   Auth: required
   Rate limiting: apply aiRateLimiter middleware

2. In the controller (ai.controller.ts, handleIntent function):
   - Validate intentType is one of: performance, security, readability, scalability, test-coverage
   - Fetch last 10 Decision Memory entries from Decision model for this project
   - Build prompt using buildIntentPromptWithBudget()
   - Set SSE response headers (Content-Type: text/event-stream, Cache-Control: no-cache)
   - Stream AI response, writing each chunk as: data: {"chunk": "..."}\n\n
   - On completion, write: data: [DONE]\n\n
   - Handle: timeout (60s max), rate limit, model errors

3. Add the route to server/src/routes/ai.routes.ts (create if doesn't exist)
4. Register ai.routes.ts in server/src/routes/index.ts

5. Write integration test: POST /api/v1/ai/intent returns 200 with SSE stream.
```

### Step 3: Frontend Agent Prompt

```
Act as the Frontend Agent defined in @.claude/agents/frontend-agent.md

Read @docs/04_UI_UX_Design_Brief.md Section 5.7 for Intent Mode UI specs.

TASK: Build the Intent Mode UI and wire it to the backend.

1. Use /create-zustand-store for intentStore:
   { intentType, isStreaming, result, error, showDiff, confidence }
   Actions: setIntentType, startAnalysis, setResult, setError, reset, toggleDiff

2. Use /build-component to create IntentSelector.tsx:
   - 5 intent type buttons in a horizontal row: Performance ⚡, Security 🔒,
     Readability 📖, Scalability 📈, Test Coverage 🧪
   - Active button: filled with --accent-primary, glow shadow
   - Inactive: outlined, subtle

3. Use /build-component to create IntentPanel.tsx:
   - Header: "Intent Mode" + close button
   - IntentSelector at the top
   - "Analyze with AI" button (disabled while streaming)
   - ConfidenceBadge.tsx: circular progress showing 0-100% confidence score
   - Streaming indicator: animated three-dot pulse while isStreaming
   - Result area: summary text + DiffViewer showing before/after
   - Action buttons: "Apply Changes" | "Try Different Intent" | "Dismiss"

4. Use /build-component to create ConfidenceBadge.tsx:
   - SVG circle progress ring
   - Color: green (>80), yellow (50-80), red (<50)
   - Animates from 0 to final value over 0.8s

5. Create client/src/hooks/useIntent.ts:
   - Calls /api/v1/ai/intent via SSE fetch with ReadableStream
   - Parses streaming chunks into intentStore
   - On [DONE]: parse final JSON, update store with result and confidence

6. When "Apply Changes" is clicked:
   - Update editorStore.updateContent with transformedCode
   - POST to /api/v1/decisions with { type: "intent", intentType, before, after, filePath }
   - Show success toast
```

### Integration Steps (Lead)
```
1. Verify SSE stream flows from server to IntentPanel
2. Verify DiffViewer shows before/after correctly
3. Verify "Apply Changes" updates Monaco editor content
4. Verify Decision Memory entry is created on apply
5. Run /run-full-review
6. Record ADR: docs/architecture-decisions/002-intent-mode-sse-streaming.md
```

### Skills Invoked This Feature
`/create-prompt-template`, `/create-api-route`, `/create-zustand-store`, `/build-component` ×3

### ✅ Intent Mode Verification Checklist
- [ ] Selecting intent type highlights the correct button
- [ ] "Analyze" sends request and streams response
- [ ] Streaming indicator shows while loading
- [ ] DiffViewer shows actual code diff
- [ ] Confidence badge animates to correct score
- [ ] "Apply Changes" updates the Monaco editor
- [ ] Decision Memory entry created
- [ ] Tests pass for hook, panel, and API endpoint

---

## Phase 2, Feature 2 — Explain My Code (Visualization)

### Step 1: AI Integration Agent Prompt

```
Act as the AI Integration Agent defined in @.claude/agents/ai-integration-agent.md

TASK: Build the Explain My Code AI pipeline.

1. Use /create-prompt-template to create server/src/prompts/explain.prompts.ts:
   - Feature name: Explain My Code
   - AI specialty: "code analysis expert who creates educational explanations"
   - Context required: code, language, filePath, context (surrounding files)
   - Output format:
     {
       "summary": "plain English explanation of what this code does",
       "complexity": "simple|moderate|complex",
       "keyComponents": [{ "name": "", "type": "function|class|variable", "purpose": "", "line": 0 }],
       "dependencies": [{ "name": "", "path": "", "usedFor": "" }],
       "dataFlow": [{ "from": "", "to": "", "description": "" }],
       "potentialIssues": [{ "line": 0, "severity": "info|warning|error", "description": "" }],
       "suggestedReads": ["concept or pattern to learn more about"]
     }

2. Create server/src/services/GraphGenerator.ts:
   - Method: generateDependencyGraph(sourceFiles[]) → { nodes[], edges[] }
   - Method: generateCallGraph(sourceCode, filePath) → { nodes[], edges[] }
   - Method: generateComponentTree(sourceCode) → { nodes[], edges[] }
   - Use @babel/parser to parse JS/JSX/TS files
   - Use @babel/traverse to extract: imports, exports, function calls, React components
   - Return React Flow compatible node/edge format with dagre layout positions
```

### Step 2: Backend Agent Prompt

```
Act as the Backend Agent defined in @.claude/agents/backend-agent.md

TASK: Build the Explain My Code API endpoints.

1. Use /create-api-route to create POST /api/v1/ai/explain:
   Request: { projectId, filePath, code, language }
   Returns SSE stream of explanation JSON

2. Use /create-api-route to create POST /api/v1/ai/visualize:
   Request: { projectId, type: "dependency"|"call-graph"|"component-tree", filePaths[] }
   Returns: { nodes[], edges[] } (React Flow format, with dagre positions)
   Note: This endpoint does NOT use AI — it uses GraphGenerator service directly
   Auth: required, no rate limiting needed (no AI cost)
```

### Step 3: Visualization Agent Prompt

```
Act as the Visualization Agent defined in @.claude/agents/visualization-agent.md

Read @docs/04_UI_UX_Design_Brief.md Section 5.8 for visualization specs.

TASK: Build all four interactive graph visualizations.

1. Use /build-visualization for type: "dependency"
2. Use /build-visualization for type: "call-graph"
3. Use /build-visualization for type: "component-tree"
4. Use /build-visualization for type: "data-flow"

For each:
- Custom node: 120×48px, rounded 8px, file/function icon + label
- Custom edge: bezier curve, animated dots on hover
- dagre layout with TB direction (top to bottom)
- Controls toolbar: Zoom In, Zoom Out, Fit View, Reset, Export PNG

5. Build VisualizationPanel.tsx:
   - Tab switcher: Dependency | Call Graph | Component Tree | Data Flow
   - Graph canvas takes remaining height
   - Node click → navigate to file in editor
   - Search box: highlight matching nodes
   - "Export PNG" button → html-to-image

6. Build ExplainPanel.tsx (text explanation side):
   - AI streaming text explanation
   - Complexity badge (Simple/Moderate/Complex)
   - Key Components list (clickable → navigate to line)
   - Potential Issues list (color-coded by severity)
   - Suggested Reads list
```

### Skills Invoked This Feature
`/create-prompt-template`, `/create-api-route` ×2, `/build-visualization` ×4, `/build-component` ×2

### ✅ Explain My Code Verification Checklist
- [ ] Dependency graph renders for a multi-file project
- [ ] Call graph shows function relationships
- [ ] Clicking a node navigates to correct file/line in Monaco
- [ ] AI explanation streams into ExplainPanel
- [ ] Complexity badge shows correct level
- [ ] Export PNG downloads a valid image

---

## Phase 2, Feature 3 — Smart Contextual Chat

### Step 1: AI Integration Agent Prompt

```
Act as the AI Integration Agent defined in @.claude/agents/ai-integration-agent.md

TASK: Build the Smart Chat AI pipeline.

1. Use /create-prompt-template to create server/src/prompts/chat.prompts.ts:
   - Feature name: Smart Chat
   - AI specialty: "senior developer who answers questions about the current codebase"
   - Context required: message, chatHistory, activeFile, fileContent, selection, decisionHistory
   - Slash command handling: detect /explain, /review, /fix, /test, /scaffold prefixes
   - Output format: streaming plain text (NOT JSON — conversational responses)
   - System prompt must include the active file path and last 10 chat messages

2. Add to ChatHistory Mongoose model (if not exists):
   Create /add-mongoose-model for ChatHistory:
   Fields: projectId, userId, messages[{ role, content, timestamp, codeContext }],
   title (auto-generated from first message), createdAt, updatedAt
```

### Step 2: Backend Agent Prompt

```
Act as the Backend Agent defined in @.claude/agents/backend-agent.md

TASK: Build the Chat API.

1. Use /create-api-route to create POST /api/v1/ai/chat:
   Request: { projectId, message, chatId?, fileContext?: { path, content, selection } }
   - Load or create ChatHistory document
   - Append user message to history
   - Build chat prompt with last 10 messages as context
   - Stream AI response via SSE
   - Append assistant response to ChatHistory on completion
   - Rate limit: aiRateLimiter

2. Use /create-api-route to create:
   - GET  /api/v1/chat — list chat sessions for project
   - GET  /api/v1/chat/:id — get full chat history
   - DELETE /api/v1/chat/:id — delete chat session
```

### Step 3: Frontend Agent Prompt

```
Act as the Frontend Agent defined in @.claude/agents/frontend-agent.md

Read @docs/04_UI_UX_Design_Brief.md for Chat panel specs.

TASK: Build the Smart Chat UI.

1. Use /build-component to create ChatPanel.tsx:
   - Full-height scrollable message list
   - Auto-scroll to bottom on new message
   - Empty state: "Ask anything about your code — I know your project."

2. Use /build-component to create ChatMessage.tsx:
   - User messages: right-aligned, --accent-primary background
   - Assistant messages: left-aligned, --bg-surface, with code block syntax highlighting
   - Code blocks: Monaco-themed, copy button
   - Streaming indicator: blinking cursor appended while isStreaming

3. Use /build-component to create ChatInput.tsx:
   - Multi-line textarea (Shift+Enter for newline, Enter to send)
   - Slash command autocomplete palette (shows suggestions as user types /)
   - "Include current file" toggle button (paperclip icon)
   - Send button: arrow icon, disabled while streaming

4. Create client/src/hooks/useChat.ts:
   - Manages chat session, streaming, history
   - Parses slash commands and adds appropriate context
```

### Skills Invoked This Feature
`/create-prompt-template`, `/add-mongoose-model`, `/create-api-route` ×4, `/build-component` ×3

### ✅ Chat Verification Checklist
- [ ] Messages stream in real-time
- [ ] Code blocks are syntax highlighted
- [ ] Slash commands (`/explain`, `/review`) trigger with context
- [ ] "Include current file" attaches file content to message
- [ ] Chat history persists across sessions
- [ ] Auto-scroll works on new messages

---

## Phase 2 — After Each Feature

### Testing Agent Prompt (run after each feature)

```
Act as the Testing Agent defined in @.claude/agents/testing-agent.md

TASK: Write comprehensive tests for [FEATURE NAME].

Files to test:
- server/src/prompts/{feature}.prompts.ts
- server/src/controllers/ai.controller.ts (new handler only)
- client/src/hooks/use{Feature}.ts
- client/src/components/{feature}/{FeaturePanel}.tsx
- client/src/stores/{feature}Store.ts

For each file, use /write-tests.
Ensure all tests pass: npx vitest run tests/ --reporter=verbose
```

---
---

# PHASE 3 — Intelligence Layer
**Weeks 8–10 | 3-Agent Pattern + Testing Agent**

---

## Phase 3, Feature 1 — Decision Memory

### AI Integration Agent Prompt

```
Act as the AI Integration Agent defined in @.claude/agents/ai-integration-agent.md

TASK: Build the Decision Memory system and pattern detection.

1. Use /add-mongoose-model to create server/src/models/Decision.ts:
   Fields: projectId, userId, type (intent|review|chat|scaffold),
   context: { filePath, language, selection }, before (code), after (code),
   aiSuggestion (full AI response), summary (one-line), tags[], accepted: Boolean,
   timestamp, sessionId

2. Use /create-prompt-template for server/src/prompts/pattern.prompts.ts:
   - Feature: Pattern Detection
   - Input: decisions[] (array of past decisions)
   - Output: { patterns: [{ name, frequency, description, recommendation }] }
   - Detects recurring coding patterns (e.g., "always uses const over let")

3. CRITICAL: Update ALL existing prompt files to include Decision Memory context:
   - server/src/prompts/intent.prompts.ts → add decisionHistory to user prompt
   - server/src/prompts/explain.prompts.ts → add decisionHistory
   - server/src/prompts/chat.prompts.ts → add decisionHistory
   This makes the AI smarter with every accepted suggestion.
```

### Backend Agent Prompt

```
Act as the Backend Agent defined in @.claude/agents/backend-agent.md

TASK: Build the Decision Memory API.

Use /create-api-route to create:
- POST /api/v1/decisions — record a new decision (called when user accepts AI suggestion)
- GET  /api/v1/decisions?projectId=&type=&limit= — list decisions with filters
- GET  /api/v1/decisions/patterns?projectId= — AI-detected patterns from history
- DELETE /api/v1/decisions/:id — remove a decision
- PUT /api/v1/decisions/:id/tag — add/remove tags from a decision
```

### Frontend Agent Prompt

```
Act as the Frontend Agent defined in @.claude/agents/frontend-agent.md

TASK: Build the Decision Memory panel.

1. Use /build-component to create DecisionTimeline.tsx:
   - Vertical timeline of past decisions (newest first)
   - Group by date (Today, Yesterday, This Week, Older)
   - Filterable by type (intent/review/chat/scaffold)
   - Search box to find specific decisions

2. Use /build-component to create DecisionCard.tsx:
   - Shows: type badge, file path, one-line summary, timestamp
   - Expandable: shows before/after code diff (DiffViewer)
   - Tags: editable inline
   - Delete button with confirmation

3. Use /build-component to create PatternDetector.tsx:
   - "Detect Patterns" button → calls /api/v1/decisions/patterns
   - Displays detected patterns as cards with frequency and recommendation
```

### Skills Invoked This Feature
`/add-mongoose-model`, `/create-prompt-template` ×2, `/create-api-route` ×5, `/build-component` ×3

### ✅ Decision Memory Verification Checklist
- [ ] Decisions are recorded when user accepts Intent Mode / Code Review suggestions
- [ ] Timeline shows past decisions correctly
- [ ] Filtering and search work
- [ ] Pattern Detection AI returns useful patterns
- [ ] All existing AI features now include decision history in their prompts

---

## Phase 3, Feature 2 — AI Code Review

### Prompts (same 3-agent pattern)

**AI Integration Agent:**
```
Use /create-prompt-template for server/src/prompts/review.prompts.ts:
- AI specialty: "senior code reviewer who finds bugs, security issues, and anti-patterns"
- Input: code, language, filePath, decisionHistory
- Output: { issues: [{ line, severity, type, title, description, suggestion, codeSnippet }],
  overallScore: 0-100, summary, positives[] }
- severity: critical | warning | suggestion
- type: bug | security | performance | style | maintainability
```

**Backend Agent:**
```
Use /create-api-route for POST /api/v1/ai/review:
- Request: { projectId, filePath, code, language }
- Returns SSE stream of review JSON
- Also: GET /api/v1/reviews?projectId= to list past review results
- Use /add-mongoose-model for ReviewResult model
```

**Frontend Agent:**
```
Use /build-component to create ReviewPanel.tsx:
- "Start Review" button triggers AI analysis
- Progress indicator while streaming
- ReviewAnnotation.tsx: Monaco editor gutter annotations (click to expand)
- Issue list: filterable by severity, color-coded
- ReviewSummary.tsx: score gauge (0-100) + top positives + top issues
- "Apply Fix" on fixable issues → calls Intent Mode with the suggestion
```

---

## Phase 3, Feature 3 — Code Health Dashboard

### Prompts (same 3-agent pattern)

**Backend Agent:**
```
Create server/src/services/HealthCalculator.ts:
- Calculate: complexity score (cyclomatic), duplication %, doc coverage %, test coverage %
- Use @babel/parser for AST-based analysis
- Store results in HealthSnapshot model (/add-mongoose-model)
- Create GET /api/v1/health/project/:id → calculate and return metrics
- Schedule: recalculate on file save (via Socket.IO event)
```

**Visualization Agent:**
```
Build HealthDashboard.tsx with D3.ts charts:
- Overall score gauge (0-100, color: red < 50, yellow 50-75, green > 75)
- 4 metric cards: Complexity, Duplication, Documentation, Test Coverage
- Trend chart: sparkline of score over last 30 days
- Hotspot list: top 5 files with worst metrics (clickable → open in editor)
- HealthScoreCard.tsx: animated counter from 0 to score value
```

---
---

# PHASE 4 — Power Features
**Weeks 11–13 | 2-Agent Pattern (Frontend + Backend)**

---

## Phase 4, Feature 1 — Authentication & User Management

### Backend Agent Prompt

```
Act as the Backend Agent defined in @.claude/agents/backend-agent.md

TASK: Build complete authentication system.

1. Use /add-mongoose-model for User.ts:
   Fields: email (unique, indexed), password (select: false),
   name, avatar, plan (free/pro), projectIds[], preferences:{},
   createdAt, lastLoginAt

2. Use /create-api-route for all auth endpoints:
   - POST /api/v1/auth/register — hash password (bcrypt, 12 rounds), create user, set JWT cookie
   - POST /api/v1/auth/login — verify password, set JWT httpOnly cookie (7d expiry)
   - POST /api/v1/auth/logout — clear cookie
   - GET  /api/v1/auth/me — return current user (requires auth)
   - POST /api/v1/auth/refresh — refresh JWT token

3. JWT must be stored in httpOnly, Secure, SameSite=Strict cookie
4. NEVER return password field in any response
```

### Frontend Agent Prompt

```
Act as the Frontend Agent defined in @.claude/agents/frontend-agent.md

TASK: Build auth pages and project dashboard.

1. Use /build-component for LoginPage.tsx:
   - Email + password form with validation
   - "Sign up" link to RegisterPage
   - Error state for invalid credentials
   - Auto-redirect to dashboard on success

2. Use /build-component for RegisterPage.tsx:
   - Name, email, password, confirm password
   - Password strength indicator
   - Terms of service checkbox

3. Use /build-component for DashboardPage.tsx:
   - Grid of ProjectCard.tsx components
   - "New Project" button → creates project and navigates to editor
   - ProjectCard: name, language icon, last modified, file count

4. Update App.tsx routing: public routes (login/register) vs protected routes (dashboard/editor)
```

### Security Agent Prompt (after auth is built)

```
Act as the Security Agent defined in @.claude/agents/security-agent.md

TASK: Security audit of the authentication implementation.

Review these files specifically:
- server/src/controllers/auth.controller.ts
- server/src/middleware/auth.middleware.ts
- server/src/models/User.ts
- Any file that handles passwords or JWTs

Check for:
1. Password hashing: must use bcrypt with ≥10 rounds
2. JWT: must be in httpOnly cookie, not localStorage or response body
3. Token expiry: must be set (check JWT_EXPIRY env)
4. Password not returned: verify select: false on User.password
5. No timing attacks in password comparison (use bcrypt.compare)
6. Rate limiting on auth endpoints

Generate full CRITICAL/WARNING/INFO report.
```

### ✅ Auth Verification Checklist
- [ ] Register creates user, password is hashed
- [ ] Login returns JWT in httpOnly cookie (check DevTools)
- [ ] Protected routes return 401 without valid JWT
- [ ] Password field never appears in API responses
- [ ] Security Agent report shows zero CRITICALs

---

## Phase 4, Feature 2 — Terminal Integration

**Frontend Agent:**
```
Build TerminalPanel.tsx using @xterm/xterm and @xterm/addon-fit:
- Full xterm.ts terminal
- Multiple tabs (TerminalTabs.tsx): "Terminal 1", "Terminal 2" + button to open new
- Shell: connect to server WebSocket for command execution
- Resize: fit-addon auto-resizes on panel resize
- Theme: match CodeNexus dark colors via Terminal.options
```

**Backend Agent:**
```
Build server/src/sockets/terminal.socket.ts:
- On connection: spawn shell process (PowerShell on Windows, bash on Linux)
- Pipe stdin/stdout/stderr through Socket.IO
- Clean up process on disconnect
- Security: block dangerous commands via PreToolUse hook logic
```

---

## Phase 4, Feature 3 — Smart Scaffolding

**AI Integration Agent:**
```
Use /create-prompt-template for server/src/prompts/scaffold.prompts.ts:
- Input: description (natural language), targetDirectory, projectType
- Output: { files: [{ path, content, description }], explanation }
- Example: "Create a React hook for fetching paginated data" →
  generates usePagedFetch.ts + usePagedFetch.test.ts
```

**Backend Agent:**
```
Use /create-api-route for POST /api/v1/ai/scaffold:
- Receives description, generates file tree with AI
- Does NOT write files directly — returns structure for user approval
- User clicks "Generate All" → files created via File API
```

---

## Phase 4, Feature 4 — Regex Playground

**Frontend Agent (standalone — no backend needed):**
```
Build RegexPlayground.tsx:
- Regex input field with flags checkboxes (g, i, m, s)
- Test string textarea (multi-line)
- Live match highlighting (re-run on every keystroke, debounce 200ms)
- Match list: shows all matches with index and capture groups
- "Explain this regex" button → calls /api/v1/ai/chat with the regex as context
- Common patterns library: Email, URL, Phone, Date, etc.
- Error display: show regex syntax errors inline
```

---
---

# PHASE 5 — Polish & Launch
**Weeks 14–16 | Testing + Security + Lead**

---

## Phase 5, Step 1 — Comprehensive Testing

### Testing Agent Prompt

```
Act as the Testing Agent defined in @.claude/agents/testing-agent.md

TASK: Write E2E and integration tests for all critical user flows.

Priority flows to test:
1. User registers → logs in → creates project → opens file in editor
2. User triggers Intent Mode → reviews diff → applies changes → decision recorded
3. User opens Explain My Code → views dependency graph → clicks node → navigates to file
4. User sends chat message → receives streamed response → uses /review slash command
5. User views Code Health → sees hotspot → opens file → runs AI Review

Use Playwright for E2E tests in tests/e2e/.
Write test scripts that run headlessly for CI.
Also run /write-tests for any source file with less than 50% coverage.
```

---

## Phase 5, Step 2 — Security Audit

### Security Agent Prompt

```
Act as the Security Agent defined in @.claude/agents/security-agent.md

TASK: Full security audit of the complete CodeNexus codebase.

Review all files in:
- server/src/controllers/ — check all endpoints for injection, auth, validation
- server/src/models/ — check schema validation and sensitive field protection
- server/src/services/ai/ — check API key handling and input sanitization
- client/src/ — check for XSS, API key exposure, insecure data handling

Also run: npm audit (in both client/ and server/)
Check: CORS configuration is not using wildcard in production

Generate comprehensive CRITICAL/WARNING/INFO security report.
All CRITICALs must be fixed before deployment.
```

---

## Phase 5, Step 3 — Performance & Accessibility

### Lead Agent Prompt

```
TASK: Performance and accessibility audit.

Performance:
1. Run: cd client && npm run build — check bundle size
2. Identify largest dependencies (use --analyze flag)
3. Add lazy loading for heavy components: VisualizationPanel, TerminalPanel
4. Add React.memo to pure components that render frequently (ChatMessage, DecisionCard)
5. Verify: Monaco Editor loads lazily (not in initial bundle)

Accessibility:
1. Audit all interactive elements for aria-labels
2. Verify keyboard navigation works: Tab through all panels, Enter/Space on buttons
3. Check color contrast ratios (text on background) meet WCAG AA
4. Add skip-to-content link at top of page

SEO (Landing Page if applicable):
1. Add <title> and <meta description> to index.html
2. Add Open Graph tags for social sharing
```

---

## Phase 5, Step 4 — Final Deploy Check

```
Invoke /deploy-check skill.
All blockers must be resolved before merging to main.
```

### ✅ Phase 5 / Launch Verification Checklist
- [ ] E2E tests cover all 5 critical user flows
- [ ] Security Agent reports ZERO CRITICALs
- [ ] Bundle size < 2MB (initial load)
- [ ] All interactive elements are keyboard accessible
- [ ] `/deploy-check` shows APPROVED (not BLOCKED)
- [ ] `git log --oneline` shows clean, meaningful commit history
- [ ] GitHub repo is up to date
- [ ] README.md has updated setup instructions

---
---

# Master Execution Timeline

```
WEEK  1–2   Phase 1, Steps 1–3  (Monorepo, folders, layout shell)
WEEK  3     Phase 1, Steps 4–6  (Monaco, Express server, file explorer)
WEEK  4–5   Phase 2, Feature 1  (Intent Mode — 3 agents)
WEEK  5–6   Phase 2, Feature 2  (Explain My Code — 3 agents + Visualization)
WEEK  6–7   Phase 2, Feature 3  (Smart Chat — 3 agents)
WEEK  8     Phase 3, Feature 1  (Decision Memory — 3 agents, update all prompts)
WEEK  9     Phase 3, Feature 2  (Code Review — 3 agents)
WEEK  10    Phase 3, Feature 3  (Health Dashboard — 2 agents)
WEEK  11    Phase 4, Features 1–2 (Auth + Terminal — 2 agents each)
WEEK  12    Phase 4, Features 3–4 (Scaffolding + Regex)
WEEK  13    Phase 4 wrap-up + Security audit of auth
WEEK  14–15 Phase 5 (E2E tests, full security audit, performance, accessibility)
WEEK  16    /deploy-check → final fixes → merge to main → launch
```

---

# Quick Reference: Session Kickoff Template

At the start of **every** coding session, give this prompt to prime the AI:

```
Read @.claude/CLAUDE.md for project context.

Current status: Phase [X], Feature [Y], Step [Z].
Today's goal: [Specific task from this playbook].

Start by reading @docs/[relevant-doc].md Section [X].
Then execute: [exact step from this playbook].
```

---

*Playbook complete. Follow phase-by-phase. Never skip the verification checklist.*
