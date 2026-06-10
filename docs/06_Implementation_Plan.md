# Implementation Plan
## CodeNexus — Phase-by-Phase Build Guide

**Version:** 1.0  
**Date:** June 2026  
**Total Estimated Duration:** 14–16 Weeks  

---

## Phase 1: Project Setup & Core Editor (Weeks 1–3)

### Objective
Set up the project infrastructure, build the core Monaco Editor integration, file explorer, and basic layout.

---

### Week 1: Project Initialization & Infrastructure

#### Step 1.1: Initialize Monorepo Structure

**Action:** Create the project with a `client/` and `server/` directory structure.

```
codenexus/
├── client/           # React frontend (Vite)
├── server/           # Node.js backend (Express)
├── shared/           # Shared types and constants
├── .gitignore
├── package.json      # Root workspace config
└── README.md
```

**Tasks:**
- [ ] Initialize root `package.json` with npm workspaces
- [ ] Set up `client/` with Vite + React 18
  - Run: `npx -y create-vite@latest client --template react`
- [ ] Set up `server/` with Express.js
  - Initialize `package.json`, install Express, dotenv, cors, helmet
- [ ] Set up `shared/` for constants used by both client and server
- [ ] Create `.gitignore` (node_modules, .env, dist, build)
- [ ] Create `.env.example` for server
- [ ] Configure ESLint + Prettier for both client and server
- [ ] Set up VS Code workspace settings (`.vscode/settings.json`)

#### Step 1.2: Install Frontend Dependencies

```bash
cd client
npm install @monaco-editor/react react-router-dom zustand axios lucide-react 
npm install framer-motion react-resizable-panels react-markdown
npm install -D vitest @testing-library/react
```

#### Step 1.3: Install Backend Dependencies

```bash
cd server
npm install express mongoose dotenv cors helmet jsonwebtoken bcryptjs
npm install express-rate-limit winston joi socket.io
npm install -D nodemon vitest supertest
```

#### Step 1.4: Configure Development Scripts

**Root `package.json`:**
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "cd client && npm run dev",
    "dev:server": "cd server && npm run dev",
    "build": "cd client && npm run build",
    "test": "npm run test:client && npm run test:server",
    "test:client": "cd client && npm run test",
    "test:server": "cd server && npm run test"
  }
}
```

---

### Week 2: Core Layout & Monaco Editor

#### Step 2.1: Build the Layout Shell

**Files to create:**
- `client/src/components/layout/AppLayout.jsx` — Main grid layout with resizable panels
- `client/src/components/layout/TopBar.jsx` — Top navigation bar
- `client/src/components/layout/Sidebar.jsx` — Left sidebar container
- `client/src/components/layout/BottomBar.jsx` — Status bar
- `client/src/components/layout/PanelManager.jsx` — Resizable panel wrapper

**Layout specification:**
- Use `react-resizable-panels` for the three-column layout (sidebar | editor | right panel)
- Sidebar: 240px default, collapsible
- Editor: flex-grow, minimum 400px
- Right panel: 360px default, collapsible
- Bottom panel: 200px, collapsible
- Status bar: 24px fixed

**CSS:**
- Create `client/src/styles/index.css` with all CSS variables from the UI/UX Design Brief
- Create `client/src/styles/layout.css` for layout-specific styles

#### Step 2.2: Integrate Monaco Editor

**Files to create:**
- `client/src/components/editor/CodeEditor.jsx` — Monaco Editor wrapper
- `client/src/components/editor/EditorTabs.jsx` — Tab management with dirty indicator
- `client/src/themes/monacoThemes.js` — Custom "codenexus-dark" theme

**Implementation details:**
- Wrap `@monaco-editor/react` in a `CodeEditor` component
- Register custom theme on mount using `monaco.editor.defineTheme()`
- Configure editor options per the TRD (font, minimap, bracket colorization, etc.)
- Tab component supports: open, close, reorder, dirty indicator (●), right-click menu
- Editor auto-detects language from file extension
- Handle editor resize when panels are resized (use `automaticLayout: true`)

#### Step 2.3: Create Zustand Stores

**Files to create:**
- `client/src/stores/editorStore.js` — Open files, active file, cursor position
- `client/src/stores/fileStore.js` — Virtual file system tree
- `client/src/stores/uiStore.js` — Panel visibility, theme, layout state
- `client/src/stores/projectStore.js` — Project metadata

**Key store shapes:** See TRD Section 3.2 for exact store structure.

---

### Week 3: File Explorer & Theme System

#### Step 3.1: Build File Explorer

**Files to create:**
- `client/src/components/explorer/FileExplorer.jsx` — Tree view of project files
- `client/src/components/explorer/FileTreeNode.jsx` — Individual tree node (file or folder)
- `client/src/components/explorer/FileContextMenu.jsx` — Right-click context menu

**Implementation details:**
- Recursive tree rendering from the fileStore
- Icons colored by file type (see UI/UX Brief Section 8.2)
- Single-click to select, double-click to open in editor
- Right-click context menu: New File, New Folder, Rename, Delete, Copy Path
- Drag and drop for moving files (deferred to Phase 4 if complex)
- Indent: 16px per nesting level

#### Step 3.2: Implement Theme System

**Files to create:**
- `client/src/themes/dark.js` — Dark theme CSS variable values
- `client/src/themes/light.js` — Light theme CSS variable values
- `client/src/hooks/useTheme.js` — Theme switching hook

**Implementation:**
- Set `data-theme` attribute on `<html>` element
- CSS variables change based on `data-theme`
- Persist theme choice in localStorage
- Monaco theme switches in sync

#### Step 3.3: Connect Frontend to Backend

**Files to create:**
- `client/src/services/api.js` — Axios instance with interceptors
- `client/src/services/fileService.js` — File CRUD API calls
- `server/src/app.js` — Express app with middleware
- `server/src/routes/file.routes.js` — File API endpoints
- `server/src/controllers/file.controller.js` — File handlers
- `server/src/models/File.js` — File Mongoose model

**Implementation:**
- Basic CRUD for files (create, read, update, delete)
- File tree endpoint that returns nested structure
- Auto-save: debounced PUT request on content change

#### Step 3.4: End of Phase 1 Checkpoint

**Deliverables:**
- ✅ Full editor layout with resizable panels
- ✅ Monaco Editor with custom theme and tab management
- ✅ File Explorer with tree view and context menu
- ✅ File CRUD operations (create, read, update, delete)
- ✅ Theme switching (dark/light)
- ✅ Status bar showing file info

**Testing:**
- Manually verify: open files, edit, save, create new files
- Run: `npm run dev` and verify client + server run together

---

## Phase 2: AI Core Features (Weeks 4–7)

### Objective
Implement Intent Mode, Explain My Code, and Smart Contextual Chat.

---

### Week 4: Backend AI Infrastructure

#### Step 4.1: AI Service Abstraction Layer

**Files to create:**
- `server/src/services/ai/AIService.js` — Abstract AI service class
- `server/src/services/ai/OpenAIProvider.js` — OpenAI GPT-4o integration
- `server/src/services/ai/AnthropicProvider.js` — Claude integration (fallback)
- `server/src/services/ai/PromptBuilder.js` — Prompt template engine
- `server/src/services/ai/StreamHandler.js` — SSE/WebSocket streaming handler
- `server/src/config/ai.js` — AI provider configuration

**Implementation:**
- Provider-agnostic interface: `analyze()`, `explain()`, `chat()`, `review()`, `complete()`, `stream()`
- Each provider implements the same interface
- Automatic fallback: if OpenAI fails → try Anthropic
- Token counting utility for cost tracking
- Streaming via Server-Sent Events (SSE) or WebSocket

#### Step 4.2: Prompt Templates

**Files to create:**
- `server/src/prompts/intent.prompts.js` — Intent Mode prompts
- `server/src/prompts/explain.prompts.js` — Explain My Code prompts
- `server/src/prompts/chat.prompts.js` — Contextual Chat prompts
- `server/src/prompts/system.prompts.js` — System-level prompts

**Implementation:**
- Each prompt is a template function that accepts context (code, intent, decisions, rules)
- Prompts are versioned for A/B testing
- Token budget management (truncate context if exceeding model limits)

#### Step 4.3: WebSocket Setup

**Files to create:**
- `server/src/sockets/socketManager.js` — Socket.IO initialization
- `server/src/sockets/aiStream.socket.js` — AI response streaming handler
- `client/src/services/socketService.js` — Socket.IO client
- `client/src/hooks/useWebSocket.js` — WebSocket hook

---

### Week 5: Intent Mode

#### Step 5.1: Intent Mode Backend

**Files to create:**
- `server/src/routes/ai.routes.js` — AI API routes
- `server/src/controllers/ai.controller.js` — AI request handlers

**Endpoint:** `POST /api/v1/ai/intent`

**Implementation:**
1. Receive code, intent, and context from frontend
2. Fetch recent decisions and project rules from database
3. Build prompt using PromptBuilder
4. Call AI provider with streaming
5. Parse AI response into structured suggestions
6. Stream suggestions to frontend via WebSocket

#### Step 5.2: Intent Mode Frontend

**Files to create:**
- `client/src/components/intent/IntentPanel.jsx` — Main Intent Mode UI
- `client/src/components/intent/IntentSelector.jsx` — Grid of intent buttons
- `client/src/components/intent/IntentResults.jsx` — Results with diff view
- `client/src/components/intent/ConfidenceBadge.jsx` — Score display
- `client/src/components/editor/DiffViewer.jsx` — Side-by-side diff view
- `client/src/hooks/useAI.js` — AI interaction hook
- `client/src/stores/aiStore.js` — AI state management

**Implementation:**
- IntentSelector: 8 predefined intent buttons + custom text input
- IntentResults: streaming display of suggestions
- DiffViewer: shows before/after code changes (use Monaco diff editor)
- Accept/Skip/Dismiss actions for each suggestion
- Loading state with animated progress indicator
- Keyboard shortcut: Ctrl+Shift+I to open

---

### Week 6: Explain My Code (Visualization)

#### Step 6.1: Code Analysis Engine (Backend)

**Files to create:**
- `server/src/services/CodeAnalyzer.js` — AST parsing and analysis
- `server/src/services/GraphGenerator.js` — Graph data structure builder
- `server/src/utils/astParser.js` — Babel AST parsing utilities

**Implementation:**
- Use `@babel/parser` to parse JavaScript/JSX files to AST
- Extract: imports, exports, function declarations, function calls, variable references
- Build graph data structures (nodes + edges) for:
  - Dependency graph (file imports)
  - Call graph (function calls)
  - Component tree (React component hierarchy)
  - Data flow (variable mutations)
- Layout computation using dagre (hierarchical layout algorithm)

#### Step 6.2: Visualization Frontend

**Files to create (install `reactflow` and `dagre`):**
- `client/src/components/visualize/VisualizationPanel.jsx` — Container
- `client/src/components/visualize/DependencyGraph.jsx` — File dependency graph
- `client/src/components/visualize/CallGraph.jsx` — Function call chains
- `client/src/components/visualize/DataFlowDiagram.jsx` — Data flow
- `client/src/components/visualize/ComponentTree.jsx` — React component hierarchy
- `client/src/components/visualize/GraphControls.jsx` — Zoom, pan, search
- `client/src/hooks/useVisualization.js` — Graph generation hook

**Implementation:**
- Use React Flow for interactive graph rendering
- Custom node components with file icons and labels
- Custom edge components with animated dashes for active connections
- Canvas with dot grid background
- Controls: zoom in/out, reset, fit view, search nodes
- Click node → navigate to file in editor
- AI summary panel below the graph
- Export as PNG/SVG using html-to-image

---

### Week 7: Smart Contextual Chat

#### Step 7.1: Chat Backend

**Endpoint:** `POST /api/v1/ai/chat`

**Implementation:**
- Receive message + context (active file, selection, cursor, open files, decisions)
- Build contextual prompt with file content and history
- Stream response via WebSocket
- Parse and identify code blocks in response
- Save chat message to ChatHistory collection
- Support slash commands: /explain, /refactor, /test, /doc, /debug, /perf

#### Step 7.2: Chat Frontend

**Files to create:**
- `client/src/components/chat/ChatPanel.jsx` — Main chat container
- `client/src/components/chat/ChatMessage.jsx` — Individual message bubble
- `client/src/components/chat/ChatInput.jsx` — Input with slash command palette
- `client/src/components/chat/CommandPalette.jsx` — Dropdown for / commands

**Implementation:**
- Messages render with Markdown (react-markdown + remark-gfm)
- Code blocks have syntax highlighting (prism-react-renderer) + copy/apply buttons
- "Apply to Editor" inserts code at cursor position
- Streaming response with typing animation
- Chat history scrolls to bottom on new message
- Auto-scroll stops if user scrolls up (reading history)
- Context indicator shows current file name at top of chat

#### Step 7.3: End of Phase 2 Checkpoint

**Deliverables:**
- ✅ Intent Mode with predefined and custom intents
- ✅ Diff preview for AI suggestions with accept/skip/dismiss
- ✅ Explain My Code with 4 visualization types (dependency, call, data flow, component tree)
- ✅ Interactive graph with zoom, pan, search, click-to-navigate
- ✅ Contextual AI Chat with markdown rendering and code blocks
- ✅ Slash commands in chat (/explain, /refactor, /test, /doc, /debug, /perf)
- ✅ WebSocket streaming for all AI responses

**Testing:**
- Test Intent Mode with a sample React project
- Test visualizations with 5-10 file projects
- Test chat with various coding questions
- Verify streaming works smoothly

---

## Phase 3: Intelligence Layer (Weeks 8–10)

### Objective
Implement Decision Memory, AI Code Review, and Code Health Dashboard.

---

### Week 8: Decision Memory

#### Step 8.1: Decision Memory Backend

**Files to create:**
- `server/src/models/Decision.js` — Decision Mongoose model
- `server/src/routes/memory.routes.js` — Decision API routes
- `server/src/controllers/memory.controller.js` — Decision CRUD handlers
- `server/src/services/DecisionManager.js` — Decision recording and retrieval
- `server/src/services/PatternDetector.js` — Pattern analysis using AI

**Implementation:**
- CRUD endpoints for decisions
- Auto-recording: hook into Intent accept, Chat apply, Review fix flows
- Pattern detection: analyze decisions for recurring patterns using AI
- Rule creation from detected patterns
- Full-text search on decisions (MongoDB text index)
- Tag-based filtering

#### Step 8.2: Decision Memory Frontend

**Files to create:**
- `client/src/components/memory/DecisionTimeline.jsx` — Chronological timeline
- `client/src/components/memory/DecisionCard.jsx` — Individual decision display
- `client/src/components/memory/DecisionSearch.jsx` — Search and filter UI
- `client/src/components/memory/PatternDetector.jsx` — Pattern display + rule creation
- `client/src/hooks/useDecisionMemory.js` — Decision memory hook
- `client/src/stores/memoryStore.js` — Decision memory state

**Implementation:**
- Timeline view with date grouping
- Decision cards show: title, type icon, file, timestamp, tags
- Expandable cards show full context (before/after code)
- Search: keyword search, filter by type/tag/date/file
- Pattern panel: shows detected patterns with "Create Rule" button
- Manual decision recording form

#### Step 8.3: Integrate Decision Memory with AI

**Modify:**
- Update all AI prompt templates to include recent decisions and project rules
- Intent Mode: AI references past decisions in explanations
- Chat: AI mentions relevant past decisions
- Update AI endpoints to fetch and include decision context

---

### Week 9: AI Code Review

#### Step 9.1: Review Backend

**Files to create:**
- `server/src/models/ReviewResult.js` — Review result model
- `server/src/routes/review.routes.js` — Review API routes
- `server/src/controllers/review.controller.js` — Review handlers
- `server/src/services/ReviewEngine.js` — Review orchestration
- `server/src/prompts/review.prompts.js` — Review prompt templates

**Implementation:**
- Analyze code for: bugs, security, performance, style, accessibility
- Categorize issues by severity: critical, warning, info
- Generate fix suggestions for each issue
- Track dismissed patterns (don't re-flag after 3 dismissals)
- Save review results to database

#### Step 9.2: Review Frontend

**Files to create:**
- `client/src/components/review/ReviewPanel.jsx` — Review results display
- `client/src/components/review/ReviewAnnotation.jsx` — Inline editor annotations
- `client/src/components/review/ReviewSummary.jsx` — Summary statistics

**Implementation:**
- Review panel shows issues grouped by severity
- Inline annotations in Monaco (colored squiggly underlines)
- Hover annotations show issue details
- One-click fix: shows diff, applies code change
- Dismiss tracking: 3 dismissals → auto-exclude pattern
- Fix applied → recorded as Decision

---

### Week 10: Code Health Dashboard

#### Step 10.1: Health Backend

**Files to create:**
- `server/src/models/HealthSnapshot.js` — Health snapshot model
- `server/src/routes/health.routes.js` — Health API routes
- `server/src/controllers/health.controller.js` — Health handlers
- `server/src/services/HealthCalculator.js` — Metrics calculation
- `server/src/utils/codeMetrics.js` — Individual metric calculators

**Implementation:**
- Calculate 6 metrics: complexity, duplication, coverage, documentation, dependencies, dead code
- Weighted scoring formula (see TRD Section 6.3)
- Identify hot spots (files with worst scores)
- AI-generated recommendations for improvement
- History tracking (store snapshots on each analysis)

#### Step 10.2: Health Frontend

**Files to create:**
- `client/src/components/health/HealthDashboard.jsx` — Main dashboard
- `client/src/components/health/HealthScoreCard.jsx` — Score display with gauge
- `client/src/components/health/MetricChart.jsx` — Individual metric charts (D3.js)
- `client/src/components/health/HotspotList.jsx` — Problem file list

**Implementation:**
- Animated score counter (0 → final value)
- Metric breakdown bars with color coding
- Sparkline trend chart for score history (D3.js or recharts)
- Hot spot list with click-to-navigate
- AI recommendation cards with "Apply" action (links to Intent Mode)
- Auto-recalculate on file save (debounced)

#### Step 10.3: End of Phase 3 Checkpoint

**Deliverables:**
- ✅ Decision Memory with auto-recording and manual entry
- ✅ Decision timeline, search, and filtering
- ✅ Pattern detection with rule creation
- ✅ AI uses past decisions in all suggestions
- ✅ AI Code Review with severity categorization
- ✅ Inline editor annotations for review issues
- ✅ One-click fix with diff preview
- ✅ Code Health Dashboard with 6 metrics
- ✅ Health trend tracking and hot spot detection

---

## Phase 4: Power Features (Weeks 11–13)

### Objective
Implement Terminal Integration, Smart Scaffolding, Regex Playground, and Collaboration Snapshots.

---

### Week 11: Terminal & Scaffolding

#### Step 11.1: Terminal Integration

**Install:** `@xterm/xterm @xterm/addon-fit @xterm/addon-web-links`

**Files to create:**
- `client/src/components/terminal/TerminalPanel.jsx` — Terminal container
- `client/src/components/terminal/TerminalTabs.jsx` — Multi-terminal tabs

**Implementation:**
- xterm.js for terminal emulation
- Bottom panel with resizable height
- Multiple terminal sessions
- AI command suggestions (ghost text in terminal)
- Error detection: parse output for error patterns, suggest fixes
- Keyboard shortcut: Ctrl+` to toggle
- Note: In v1, terminal runs simulated commands (no actual shell access in browser)

#### Step 11.2: Smart Scaffolding

**Files to create:**
- `server/src/prompts/scaffold.prompts.js` — Scaffolding prompt templates
- `client/src/components/scaffold/ScaffoldModal.jsx` — Scaffolding dialog

**Implementation:**
- Modal dialog: user describes what to build
- AI generates folder structure + file contents
- Preview tree before applying
- Templates: React app, Express API, Full-stack
- Respect project rules from Decision Memory

---

### Week 12: Regex Playground & Snapshots

#### Step 12.1: Regex Playground

**Files to create:**
- `client/src/components/regex/RegexPlayground.jsx` — Main regex UI

**Implementation:**
- Split view: regex input + test string
- Live matching with highlighted groups
- AI explains regex in plain English
- AI generates regex from natural language
- Save patterns to a library

#### Step 12.2: Collaboration Snapshots

**Files to create:**
- `server/src/routes/snapshot.routes.js`
- `client/src/components/snapshot/SnapshotViewer.jsx`

**Implementation:**
- Generate unique shareable URL
- Snapshot captures: code, active visualizations, chat history
- Read-only viewer for recipients
- 30-day expiry

---

### Week 13: Authentication & Project Management

#### Step 13.1: Authentication System

**Files to create:**
- `server/src/routes/auth.routes.js` — Auth routes
- `server/src/controllers/auth.controller.js` — Auth handlers
- `server/src/middleware/auth.middleware.js` — JWT middleware
- `client/src/pages/LoginPage.jsx` — Login page
- `client/src/pages/RegisterPage.jsx` — Registration page
- `client/src/services/authService.js` — Auth API calls

**Implementation:**
- Registration with email + password
- Login with JWT (access + refresh tokens)
- Protected routes (middleware checks JWT on every request)
- Password hashing with bcrypt (12 rounds)

#### Step 13.2: Dashboard & Project Management

**Files to create:**
- `client/src/pages/DashboardPage.jsx` — Project list
- `client/src/components/dashboard/ProjectCard.jsx` — Project card
- `client/src/components/dashboard/NewProjectModal.jsx` — Create project dialog
- `server/src/routes/project.routes.js` — Project routes
- `server/src/controllers/project.controller.js` — Project handlers
- `server/src/models/Project.js` — Project model

**Implementation:**
- Project list with cards (name, last edited, health score)
- Create project (blank or from template)
- Open project → navigate to editor workspace
- Delete project with confirmation
- Settings page for user preferences and AI configuration

#### Step 13.3: End of Phase 4 Checkpoint

**Deliverables:**
- ✅ Terminal integration with AI command suggestions
- ✅ Smart Scaffolding with template support
- ✅ Regex Playground with AI explanations
- ✅ Collaboration Snapshots with shareable URLs
- ✅ Full authentication system (register, login, JWT)
- ✅ Dashboard with project management
- ✅ Settings page for preferences and AI config

---

## Phase 5: Polish & Launch (Weeks 14–16)

### Objective
Performance optimization, accessibility audit, testing, documentation, and launch preparation.

---

### Week 14: Performance Optimization

**Tasks:**
- [ ] Implement code splitting with React.lazy for all panels
- [ ] Add virtual scrolling for file tree (if 500+ files)
- [ ] Add Web Worker for AST parsing and code metrics
- [ ] Optimize Monaco Editor loading (lazy load)
- [ ] Implement Redis caching for AI responses
- [ ] Add debouncing to auto-save (500ms) and health recalculation
- [ ] Optimize graph rendering with memoization
- [ ] Run Lighthouse audits and fix performance issues
- [ ] Bundle size analysis and tree-shaking optimization

---

### Week 15: Testing & Bug Fixes

**Tasks:**
- [ ] Write unit tests for all Zustand stores
- [ ] Write unit tests for all backend services
- [ ] Write integration tests for all API endpoints
- [ ] Write component tests for critical UI flows
- [ ] Write E2E tests for: Login → Create Project → Edit → Use AI
- [ ] Fix all P0 and P1 bugs
- [ ] Cross-browser testing (Chrome, Firefox, Edge, Safari)
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Security audit (API key exposure, XSS, injection)

---

### Week 16: Documentation & Launch

**Tasks:**
- [ ] Write README.md with setup instructions
- [ ] Create CONTRIBUTING.md for open-source contributions
- [ ] API documentation (Swagger/OpenAPI or Postman collection)
- [ ] User guide with screenshots
- [ ] Record demo video
- [ ] Deploy: client to Vercel/Netlify, server to Railway/Render
- [ ] Set up MongoDB Atlas for production database
- [ ] Configure environment variables in production
- [ ] Set up error monitoring (Sentry)
- [ ] Launch announcement (GitHub, LinkedIn, Twitter)

---

## Verification Plan

### Automated Tests

```bash
# Run all tests
npm run test

# Run frontend tests
cd client && npx vitest run

# Run backend tests
cd server && npx vitest run

# Run E2E tests
cd client && npx playwright test

# Run linting
npm run lint

# Run type checking (if TypeScript is added later)
npx tsc --noEmit
```

### Manual Verification Checklist

- [ ] Create a new project → verify file creation works
- [ ] Open a file → verify Monaco Editor loads with correct syntax highlighting
- [ ] Edit a file → verify auto-save works
- [ ] Use Intent Mode → verify AI suggestions appear with diff preview
- [ ] Accept a suggestion → verify code updates and Decision is recorded
- [ ] Open Explain My Code → verify dependency graph renders
- [ ] Click graph node → verify navigation to file
- [ ] Send a chat message → verify streaming response
- [ ] Use /explain command → verify code explanation
- [ ] Check Decision Memory → verify timeline shows past decisions
- [ ] Run Code Review → verify issues appear with inline annotations
- [ ] Apply a fix → verify code changes
- [ ] Check Health Dashboard → verify score and metrics display
- [ ] Open terminal → verify it loads
- [ ] Switch themes → verify dark/light switch
- [ ] Test with 50+ files → verify performance is acceptable

---

## Risk Mitigation During Build

| Risk | Mitigation Action |
|---|---|
| AI API costs during development | Use GPT-4o-mini for testing, GPT-4o for demos |
| Monaco Editor performance issues | Profile with Chrome DevTools, disable unused features |
| Complex visualization rendering | Start with dependency graph only, add others incrementally |
| Scope creep | Stick to Phase priorities (P0 → P1 → P2) |
| Backend complexity | Keep services focused and testable |
| State management complexity | Use Zustand's simple API, avoid deep nesting |

---

## Assumptions

1. Developer has Node.js 20+ and npm 9+ installed
2. MongoDB is available locally or via Atlas free tier
3. At least one AI API key (OpenAI, Anthropic, or Google) is available
4. Development machine has at least 8GB RAM
5. Chrome DevTools is available for debugging
6. Git is installed for version control
7. The terminal in v1 is a simulated/sandboxed environment (no direct OS shell access from browser)
