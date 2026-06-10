# Technical Requirements Document (TRD)
## CodeNexus — AI-Powered Code Editor

**Version:** 1.0  
**Date:** June 2026  
**Status:** Draft  

---

## 1. System Architecture Overview

CodeNexus follows a **client-server architecture** with a React-based frontend, Node.js/Express backend, and external AI model integration.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │  React   │ │  Monaco  │ │ React    │ │ Visualization │  │
│  │  App     │ │  Editor  │ │ Flow     │ │ Engine        │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬────────┘  │
│       │             │            │               │           │
│       └─────────────┴────────────┴───────────────┘           │
│                          │                                   │
│                   Axios / Fetch                              │
└──────────────────────────┼───────────────────────────────────┘
                           │ HTTPS / WSS
┌──────────────────────────┼───────────────────────────────────┐
│                    SERVER (Node.js)                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────┐  │
│  │ Express  │ │ AI       │ │ Auth     │ │ File          │  │
│  │ Router   │ │ Service  │ │ Service  │ │ Service       │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬────────┘  │
│       │             │            │               │           │
│  ┌────┴─────┐ ┌─────┴────┐ ┌────┴─────┐ ┌──────┴────────┐  │
│  │ Decision │ │ LLM      │ │ JWT      │ │ Virtual FS    │  │
│  │ Memory   │ │ Provider │ │ Manager  │ │ Manager       │  │
│  │ Store    │ │          │ │          │ │               │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬────────┘  │
│       │             │            │               │           │
└───────┴─────────────┴────────────┴───────────────┴───────────┘
        │             │            │               │
   ┌────┴────┐   ┌────┴────┐  ┌───┴───┐     ┌─────┴─────┐
   │MongoDB/ │   │OpenAI / │  │Redis  │     │Local/S3   │
   │PostgreSQL│  │Anthropic│  │Cache  │     │Storage    │
   └─────────┘   └─────────┘  └───────┘     └───────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool and dev server |
| Monaco Editor | @monaco-editor/react 4.x | Code editing |
| React Flow | 11.x | Node-based graph visualization (Explain My Code) |
| D3.js | 7.x | Data-driven visualizations (Code Health charts) |
| Zustand | 4.x | State management (lightweight, no boilerplate) |
| React Router | 6.x | Client-side routing |
| Axios | 1.x | HTTP client |
| @xterm/xterm | 5.x | Terminal emulation |
| React Markdown | 9.x | Rendering AI responses with code blocks |
| Framer Motion | 11.x | Animations and transitions |
| Lucide React | Latest | Icon library |
| React Resizable Panels | Latest | Resizable editor layout |
| Prism React Renderer | 2.x | Syntax highlighting in chat |

### 2.2 Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20.x LTS | Runtime environment |
| Express.js | 4.x | HTTP server and API framework |
| Socket.IO | 4.x | Real-time communication (streaming AI responses) |
| jsonwebtoken | 9.x | JWT authentication |
| bcryptjs | 2.x | Password hashing |
| mongoose | 8.x | MongoDB ODM (if MongoDB is chosen) |
| pg / Prisma | Latest | PostgreSQL ORM (if PostgreSQL is chosen) |
| dotenv | 16.x | Environment variable management |
| cors | 2.x | Cross-origin resource sharing |
| helmet | 7.x | Security headers |
| express-rate-limit | 7.x | Rate limiting |
| winston | 3.x | Logging |
| joi / zod | Latest | Request validation |
| node-cache | 5.x | In-memory caching |
| bull / bullmq | 5.x | Job queue for async AI processing |

### 2.3 AI Integration

| Provider | Model | Use Case |
|---|---|---|
| OpenAI | GPT-4o / GPT-4o-mini | Primary LLM for code analysis, generation, and chat |
| Anthropic | Claude 3.5 Sonnet | Alternative/fallback LLM |
| Google | Gemini 2.0 Flash | Fast, cost-effective model for simple tasks |

**Integration Pattern:** Provider-agnostic abstraction layer that supports switching between models.

### 2.4 Database

**Primary:** MongoDB 7.x (chosen for flexible schema — ideal for Decision Memory's evolving data structure)

**Alternative:** PostgreSQL 16 with Prisma ORM (if relational integrity is preferred)

**Caching:** Redis 7.x (for session management, AI response caching, rate limiting)

### 2.5 DevOps & Tooling

| Tool | Purpose |
|---|---|
| ESLint + Prettier | Code linting and formatting |
| Vitest | Unit and integration testing |
| Playwright | End-to-end testing |
| Docker | Containerization |
| GitHub Actions | CI/CD pipeline |
| Nginx | Reverse proxy (production) |

---

## 3. Frontend Architecture

### 3.1 Project Structure

```
client/
├── public/
│   ├── index.html
│   └── favicon.svg
├── src/
│   ├── main.jsx                    # Entry point
│   ├── App.jsx                     # Root component with routing
│   ├── assets/                     # Static assets (images, fonts)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx       # Main layout wrapper
│   │   │   ├── Sidebar.jsx         # Left sidebar (file explorer + tools)
│   │   │   ├── TopBar.jsx          # Top menu bar
│   │   │   ├── BottomBar.jsx       # Status bar
│   │   │   └── PanelManager.jsx    # Resizable panel container
│   │   ├── editor/
│   │   │   ├── CodeEditor.jsx      # Monaco Editor wrapper
│   │   │   ├── EditorTabs.jsx      # Tab management
│   │   │   ├── DiffViewer.jsx      # Side-by-side diff view
│   │   │   ├── MiniMap.jsx         # Code minimap
│   │   │   └── EditorToolbar.jsx   # Editor-specific actions
│   │   ├── explorer/
│   │   │   ├── FileExplorer.jsx    # File tree component
│   │   │   ├── FileTreeNode.jsx    # Individual tree node
│   │   │   └── FileContextMenu.jsx # Right-click menu
│   │   ├── chat/
│   │   │   ├── ChatPanel.jsx       # Main chat container
│   │   │   ├── ChatMessage.jsx     # Individual message
│   │   │   ├── ChatInput.jsx       # Message input with commands
│   │   │   └── CommandPalette.jsx  # Slash command palette
│   │   ├── intent/
│   │   │   ├── IntentPanel.jsx     # Intent Mode UI
│   │   │   ├── IntentSelector.jsx  # Intent type picker
│   │   │   ├── IntentResults.jsx   # AI suggestions display
│   │   │   └── ConfidenceBadge.jsx # Confidence score display
│   │   ├── visualize/
│   │   │   ├── VisualizationPanel.jsx # Container for all visualizations
│   │   │   ├── DependencyGraph.jsx    # File dependency graph
│   │   │   ├── CallGraph.jsx          # Function call graph
│   │   │   ├── DataFlowDiagram.jsx    # Data flow visualization
│   │   │   ├── ComponentTree.jsx      # React component hierarchy
│   │   │   └── GraphControls.jsx      # Zoom, pan, search controls
│   │   ├── memory/
│   │   │   ├── DecisionTimeline.jsx   # Decision history timeline
│   │   │   ├── DecisionCard.jsx       # Individual decision
│   │   │   ├── DecisionSearch.jsx     # Search and filter
│   │   │   └── PatternDetector.jsx    # Pattern suggestions
│   │   ├── health/
│   │   │   ├── HealthDashboard.jsx    # Code health overview
│   │   │   ├── HealthScoreCard.jsx    # Score display
│   │   │   ├── MetricChart.jsx        # Individual metric chart
│   │   │   └── HotspotList.jsx        # Problem file list
│   │   ├── review/
│   │   │   ├── ReviewPanel.jsx        # Code review results
│   │   │   ├── ReviewAnnotation.jsx   # Inline annotation
│   │   │   └── ReviewSummary.jsx      # Review summary
│   │   ├── terminal/
│   │   │   ├── TerminalPanel.jsx      # Terminal container
│   │   │   └── TerminalTabs.jsx       # Multi-terminal tabs
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Modal.jsx
│   │       ├── Tooltip.jsx
│   │       ├── Dropdown.jsx
│   │       ├── LoadingSpinner.jsx
│   │       ├── Toast.jsx
│   │       └── Badge.jsx
│   ├── hooks/
│   │   ├── useAI.js                # AI interaction hook
│   │   ├── useEditor.js            # Editor state hook
│   │   ├── useFileSystem.js        # Virtual file system hook
│   │   ├── useDecisionMemory.js    # Decision memory hook
│   │   ├── useCodeHealth.js        # Code health metrics hook
│   │   ├── useVisualization.js     # Graph generation hook
│   │   ├── useWebSocket.js         # WebSocket connection hook
│   │   └── useTheme.js             # Theme management hook
│   ├── stores/
│   │   ├── editorStore.js          # Editor state (Zustand)
│   │   ├── fileStore.js            # File system state
│   │   ├── aiStore.js              # AI interaction state
│   │   ├── memoryStore.js          # Decision memory state
│   │   ├── uiStore.js              # UI layout state
│   │   └── projectStore.js         # Project metadata state
│   ├── services/
│   │   ├── api.js                  # Axios instance + interceptors
│   │   ├── aiService.js            # AI API calls
│   │   ├── fileService.js          # File operations API
│   │   ├── authService.js          # Authentication API
│   │   ├── memoryService.js        # Decision memory API
│   │   ├── healthService.js        # Code health API
│   │   └── socketService.js        # WebSocket service
│   ├── utils/
│   │   ├── codeParser.js           # AST parsing utilities
│   │   ├── graphBuilder.js         # Graph data structure builder
│   │   ├── diffGenerator.js        # Diff computation
│   │   ├── metricsCalculator.js    # Code metrics computation
│   │   ├── languageDetector.js     # File language detection
│   │   ├── formatters.js           # Data formatting utilities
│   │   └── constants.js            # App-wide constants
│   ├── themes/
│   │   ├── dark.js                 # Dark theme tokens
│   │   ├── light.js                # Light theme tokens
│   │   └── monacoThemes.js         # Custom Monaco themes
│   └── styles/
│       ├── index.css               # Global styles + CSS variables
│       ├── layout.css              # Layout-specific styles
│       ├── editor.css              # Editor-specific styles
│       ├── chat.css                # Chat panel styles
│       ├── visualize.css           # Visualization styles
│       └── animations.css          # Shared animations
```

### 3.2 State Management Strategy

Use **Zustand** for global state with these stores:

```javascript
// editorStore.js — manages open files, active tab, cursor position
{
  openFiles: [],         // Array of { id, name, path, content, language, isDirty }
  activeFileId: null,    // Currently focused file
  cursorPosition: {},    // { lineNumber, column }
  selection: null,       // Selected text range
  editorInstance: null,   // Monaco editor instance reference
}

// fileStore.js — virtual file system
{
  fileTree: {},          // Nested object representing folder structure
  projectName: '',       // Current project name
  projectId: '',         // Project unique identifier
}

// aiStore.js — AI interaction state
{
  isLoading: false,      // Whether AI is processing
  streamingResponse: '', // Current streaming response
  chatHistory: [],       // Array of { role, content, timestamp }
  activeIntent: null,    // Currently selected intent
  suggestions: [],       // AI suggestions for current context
}

// memoryStore.js — Decision Memory state
{
  decisions: [],         // Array of decision records
  patterns: [],          // Detected patterns
  projectRules: [],      // User-defined project rules
}
```

### 3.3 Monaco Editor Configuration

```javascript
// Key Monaco Editor configuration
{
  theme: 'codenexus-dark',           // Custom theme
  language: 'javascript',            // Auto-detected
  minimap: { enabled: true },
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  lineNumbers: 'on',
  wordWrap: 'on',
  automaticLayout: true,
  suggestOnTriggerCharacters: true,
  tabSize: 2,
  formatOnPaste: true,
  bracketPairColorization: { enabled: true },
  scrollBeyondLastLine: false,
  smoothScrolling: true,
  cursorBlinking: 'smooth',
  cursorSmoothCaretAnimation: 'on',
  renderWhitespace: 'selection',
  // Custom providers registered separately:
  // - Completion provider (AI autocomplete)
  // - Hover provider (AI explanations on hover)
  // - Code lens provider (inline AI actions)
  // - Code action provider (quick fixes)
}
```

### 3.4 Component Communication

```
┌──────────────────────────────────────────────────────────────┐
│                      AppLayout                               │
│  ┌──────┐ ┌──────────────────────────┐ ┌──────────────────┐ │
│  │      │ │      EditorArea          │ │    RightPanel    │ │
│  │      │ │  ┌────────────────────┐  │ │  ┌────────────┐ │ │
│  │ Side │ │  │   EditorTabs       │  │ │  │  ChatPanel │ │ │
│  │ bar  │ │  ├────────────────────┤  │ │  │     OR     │ │ │
│  │      │ │  │   CodeEditor       │  │ │  │ IntentPanel│ │ │
│  │      │ │  │   (Monaco)         │  │ │  │     OR     │ │ │
│  │      │ │  │                    │  │ │  │MemoryPanel │ │ │
│  │      │ │  └────────────────────┘  │ │  └────────────┘ │ │
│  │      │ ├──────────────────────────┤ │                  │ │
│  │      │ │   BottomPanel            │ │                  │ │
│  │      │ │   (Terminal / Output)    │ │                  │ │
│  └──────┘ └──────────────────────────┘ └──────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐│
│  │                     BottomBar (Status)                   ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

All panels communicate through **Zustand stores** — no prop drilling beyond one level. Events that need real-time sync (like AI streaming) use **Socket.IO**.

---

## 4. Backend Architecture

### 4.1 Project Structure

```
server/
├── src/
│   ├── index.js                    # Entry point
│   ├── app.js                      # Express app configuration
│   ├── config/
│   │   ├── database.js             # Database connection
│   │   ├── redis.js                # Redis connection
│   │   ├── ai.js                   # AI provider configuration
│   │   └── environment.js          # Environment variables
│   ├── routes/
│   │   ├── index.js                # Route aggregator
│   │   ├── auth.routes.js          # /api/auth/*
│   │   ├── project.routes.js       # /api/projects/*
│   │   ├── file.routes.js          # /api/files/*
│   │   ├── ai.routes.js            # /api/ai/*
│   │   ├── memory.routes.js        # /api/memory/*
│   │   ├── health.routes.js        # /api/health/*
│   │   └── review.routes.js        # /api/review/*
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   ├── file.controller.js
│   │   ├── ai.controller.js
│   │   ├── memory.controller.js
│   │   ├── health.controller.js
│   │   └── review.controller.js
│   ├── services/
│   │   ├── ai/
│   │   │   ├── AIService.js        # Abstract AI service
│   │   │   ├── OpenAIProvider.js    # OpenAI implementation
│   │   │   ├── AnthropicProvider.js # Anthropic implementation
│   │   │   ├── GeminiProvider.js    # Google Gemini implementation
│   │   │   ├── PromptBuilder.js     # Prompt template engine
│   │   │   └── StreamHandler.js     # SSE/WebSocket streaming
│   │   ├── CodeAnalyzer.js          # Static code analysis
│   │   ├── GraphGenerator.js        # Dependency/call graph generation
│   │   ├── HealthCalculator.js      # Code metrics computation
│   │   ├── DecisionManager.js       # Decision memory CRUD
│   │   ├── PatternDetector.js       # Pattern recognition in decisions
│   │   └── ReviewEngine.js          # Code review orchestration
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   ├── File.js
│   │   ├── Decision.js
│   │   ├── ChatHistory.js
│   │   ├── ReviewResult.js
│   │   └── HealthSnapshot.js
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT verification
│   │   ├── rateLimiter.middleware.js # Rate limiting
│   │   ├── validation.middleware.js  # Request validation
│   │   ├── errorHandler.middleware.js # Global error handler
│   │   └── logger.middleware.js      # Request logging
│   ├── sockets/
│   │   ├── socketManager.js         # Socket.IO initialization
│   │   ├── aiStream.socket.js       # AI response streaming
│   │   └── collaboration.socket.js  # Real-time collaboration events
│   ├── prompts/
│   │   ├── intent.prompts.js        # Intent Mode prompt templates
│   │   ├── explain.prompts.js       # Explain My Code prompts
│   │   ├── review.prompts.js        # Code Review prompts
│   │   ├── chat.prompts.js          # Contextual Chat prompts
│   │   ├── scaffold.prompts.js      # Scaffolding prompts
│   │   └── system.prompts.js        # System-level prompts
│   └── utils/
│       ├── astParser.js             # AST parsing (Babel/Acorn)
│       ├── codeMetrics.js           # Cyclomatic complexity, etc.
│       ├── diffEngine.js            # Diff computation
│       ├── sanitizer.js             # Input sanitization
│       ├── tokenCounter.js          # LLM token counting
│       └── responseFormatter.js     # AI response formatting
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
├── .env.example
├── package.json
└── Dockerfile
```

### 4.2 API Design

All APIs follow RESTful conventions. Base URL: `/api/v1`

#### Authentication APIs
```
POST   /api/v1/auth/register          # Create new account
POST   /api/v1/auth/login             # Login and receive JWT
POST   /api/v1/auth/refresh           # Refresh JWT token
POST   /api/v1/auth/logout            # Invalidate token
GET    /api/v1/auth/me                # Get current user profile
```

#### Project APIs
```
GET    /api/v1/projects               # List user's projects
POST   /api/v1/projects               # Create new project
GET    /api/v1/projects/:id           # Get project details
PUT    /api/v1/projects/:id           # Update project metadata
DELETE /api/v1/projects/:id           # Delete project
POST   /api/v1/projects/:id/clone     # Clone/duplicate project
```

#### File APIs
```
GET    /api/v1/projects/:id/files           # Get file tree
GET    /api/v1/projects/:id/files/:fileId   # Get file content
POST   /api/v1/projects/:id/files           # Create new file
PUT    /api/v1/projects/:id/files/:fileId   # Update file content
DELETE /api/v1/projects/:id/files/:fileId   # Delete file
POST   /api/v1/projects/:id/files/bulk      # Bulk file operations
```

#### AI APIs
```
POST   /api/v1/ai/intent                    # Intent Mode analysis
POST   /api/v1/ai/explain                   # Explain My Code
POST   /api/v1/ai/chat                      # Contextual chat message
POST   /api/v1/ai/review                    # Code review
POST   /api/v1/ai/complete                  # Code completion
POST   /api/v1/ai/scaffold                  # Generate scaffolding
POST   /api/v1/ai/regex                     # Regex generation/explanation
POST   /api/v1/ai/suggest-command           # Terminal command suggestion
```

#### Decision Memory APIs
```
GET    /api/v1/projects/:id/decisions       # List decisions
POST   /api/v1/projects/:id/decisions       # Record a decision
GET    /api/v1/projects/:id/decisions/:did  # Get decision details
PUT    /api/v1/projects/:id/decisions/:did  # Update/annotate decision
DELETE /api/v1/projects/:id/decisions/:did  # Delete a decision
GET    /api/v1/projects/:id/patterns        # Get detected patterns
POST   /api/v1/projects/:id/rules           # Create project rule from pattern
```

#### Code Health APIs
```
GET    /api/v1/projects/:id/health          # Get current health score
GET    /api/v1/projects/:id/health/history  # Get health score history
GET    /api/v1/projects/:id/health/hotspots # Get problem files
POST   /api/v1/projects/:id/health/analyze  # Trigger full analysis
```

### 4.3 AI Service Abstraction

```javascript
// AIService.js — Provider-agnostic interface
class AIService {
  constructor(provider) {
    // provider is one of: OpenAIProvider, AnthropicProvider, GeminiProvider
    this.provider = provider;
  }

  async analyze(code, intent, context) { /* ... */ }
  async explain(code, depth, format) { /* ... */ }
  async chat(messages, context) { /* ... */ }
  async review(code, categories) { /* ... */ }
  async complete(code, cursorPosition) { /* ... */ }
  async *stream(prompt, context) { /* yields chunks */ }
}
```

Each provider implements the same interface, enabling:
- **Fallback:** If OpenAI fails, automatically try Anthropic
- **Model selection:** Use cheaper models for simple tasks, powerful models for complex analysis
- **A/B testing:** Compare model outputs for quality

### 4.4 Prompt Engineering Strategy

Prompts are stored as **template functions** in `/src/prompts/`:

```javascript
// Example: intent.prompts.js
export const buildIntentPrompt = ({ code, intent, language, decisionHistory, projectRules }) => ({
  system: `You are an expert ${language} developer. Analyze the provided code 
           with the goal of improving its ${intent}. Consider the project's 
           established patterns and past decisions.`,
  user: `
    ## Code to Analyze
    \`\`\`${language}
    ${code}
    \`\`\`
    
    ## Intent: ${intent}
    
    ## Project Context
    - Past decisions: ${JSON.stringify(decisionHistory.slice(-10))}
    - Project rules: ${JSON.stringify(projectRules)}
    
    ## Instructions
    1. Identify specific areas for ${intent} improvement
    2. Provide the improved code
    3. Explain each change with a confidence score (0-100)
    4. Reference any relevant best practices
    
    Respond in JSON format: { suggestions: [{ original, improved, explanation, confidence, references }] }
  `
});
```

### 4.5 Real-Time Communication

**Socket.IO** for:
- AI response streaming (word-by-word for chat, chunk-by-chunk for code)
- Real-time code health score updates
- Notification of completed background analysis

```javascript
// Socket events
io.on('connection', (socket) => {
  socket.on('ai:stream:start', handleStreamStart);
  socket.on('ai:stream:cancel', handleStreamCancel);
  socket.emit('ai:stream:chunk', { content, done });
  socket.emit('health:update', { score, metrics });
  socket.emit('review:complete', { results });
});
```

---

## 5. Database Design

### 5.1 MongoDB Collections

See **05_Backend_Schema.md** for complete schema definitions.

Key collections:
- `users` — User accounts and preferences
- `projects` — Project metadata
- `files` — Virtual file system entries
- `decisions` — Decision Memory records
- `chatHistories` — Chat conversation logs
- `healthSnapshots` — Code health history
- `reviewResults` — Code review records

### 5.2 Indexing Strategy

```javascript
// Critical indexes for performance
users:       { email: 1 } (unique)
projects:    { userId: 1, updatedAt: -1 }
files:       { projectId: 1, path: 1 } (unique compound)
decisions:   { projectId: 1, timestamp: -1 }
decisions:   { projectId: 1, tags: 1 }  // For tag-based search
chatHistories: { projectId: 1, createdAt: -1 }
healthSnapshots: { projectId: 1, createdAt: -1 }
```

---

## 6. Code Analysis Engine

### 6.1 AST Parsing

Use **Babel Parser** (for JS/TS) and **Tree-sitter** (for multi-language support) to:

1. **Extract function declarations and calls** — builds the call graph
2. **Extract import/export statements** — builds the dependency graph
3. **Extract variable declarations and references** — builds data flow
4. **Extract React component definitions** — builds component tree
5. **Calculate cyclomatic complexity** — for code health metrics
6. **Detect code patterns** — for Decision Memory pattern detection

### 6.2 Graph Generation Pipeline

```
Source Code → AST Parser → Graph Builder → Layout Engine → React Flow Nodes
```

1. **Parse** all files in the project to AST
2. **Extract** relationships (imports, calls, data flow)
3. **Build** graph data structure (nodes + edges)
4. **Apply** layout algorithm (dagre for hierarchical, force-directed for dependencies)
5. **Transform** to React Flow format (nodes with positions, styled edges)
6. **Cache** the result (invalidate on file change)

### 6.3 Code Health Calculation

```javascript
healthScore = (
  complexityScore * 0.25 +    // Lower complexity = higher score
  duplicationScore * 0.15 +   // Less duplication = higher score
  coverageScore * 0.20 +      // Higher coverage = higher score
  docScore * 0.15 +           // Better documentation = higher score
  depScore * 0.10 +           // Fresher dependencies = higher score
  deadCodeScore * 0.15        // Less dead code = higher score
) * 100;
```

---

## 7. Security Architecture

### 7.1 Authentication Flow

```
1. User registers with email/password → password hashed with bcrypt (12 rounds)
2. User logs in → server validates credentials → issues JWT (1h access + 7d refresh)
3. Client stores JWT in httpOnly cookie (not localStorage)
4. Every API request includes JWT in Authorization header
5. Middleware validates JWT on every protected route
6. Refresh token rotated on each use (rotation invalidation)
```

### 7.2 API Key Security

```
- AI API keys stored in environment variables (never in code)
- All AI calls routed through backend (client never calls AI directly)
- Rate limiting: 100 AI requests/hour per user (configurable)
- Token budget per user per day (prevents abuse)
- Request/response logging (excluding sensitive content)
```

### 7.3 Input Sanitization

- All user input sanitized before processing
- Code input validated for maximum length (50,000 characters per request)
- File names validated against path traversal attacks
- MongoDB injection prevention via Mongoose schemas
- XSS prevention via React's built-in escaping + DOMPurify for HTML content

---

## 8. Performance Requirements

| Metric | Target | Measurement Method |
|---|---|---|
| Initial page load | < 2s | Lighthouse Performance score > 90 |
| Editor responsiveness | < 16ms per frame | Chrome DevTools Performance tab |
| AI response start (streaming) | < 1.5s | Custom timing middleware |
| Visualization rendering (100 nodes) | < 3s | React Profiler |
| File tree rendering (500 files) | < 1s | React Profiler |
| API response time (non-AI) | < 200ms | Server-side timing |
| Memory usage (client) | < 512MB | Chrome Task Manager |
| WebSocket reconnection | < 2s | Custom monitoring |

### 8.1 Optimization Strategies

- **Code splitting** — React.lazy for panels (chat, visualization, health)
- **Virtual scrolling** — for file tree and decision timeline
- **Debounced saves** — 500ms debounce on file content changes
- **Memoization** — React.memo and useMemo for expensive renders
- **Web Workers** — AST parsing and code metrics run in a Web Worker
- **Response caching** — Redis caches AI responses for identical inputs (5-minute TTL)
- **Incremental analysis** — Only re-analyze changed files, not the entire project

---

## 9. Error Handling Strategy

### 9.1 Client-Side

```javascript
// Global error boundary wrapping the app
class ErrorBoundary extends React.Component {
  // Catches render errors, shows fallback UI
  // Logs error to server via /api/v1/errors
}

// API error interceptor (Axios)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) → redirect to login
    if (error.response?.status === 429) → show rate limit message
    if (error.response?.status >= 500) → show server error toast
    // Log error and show user-friendly message
  }
);
```

### 9.2 Server-Side

```javascript
// Centralized error handler middleware
app.use((err, req, res, next) => {
  logger.error({ err, path: req.path, method: req.method });
  
  if (err instanceof ValidationError) → 400
  if (err instanceof AuthenticationError) → 401
  if (err instanceof NotFoundError) → 404
  if (err instanceof RateLimitError) → 429
  if (err instanceof AIProviderError) → 503 (try fallback)
  default → 500 with generic message
});
```

---

## 10. Testing Strategy

| Test Type | Tool | Coverage Target | What to Test |
|---|---|---|---|
| Unit Tests | Vitest | 80% | Services, utilities, hooks, store logic |
| Component Tests | Vitest + Testing Library | 70% | Component rendering, user interactions |
| Integration Tests | Vitest + Supertest | 60% | API endpoints, middleware, database operations |
| E2E Tests | Playwright | Key flows | Login → Create project → Edit file → Use AI |
| Performance Tests | Lighthouse CI | Score > 90 | Page load, interactivity, accessibility |

---

## 11. Deployment Architecture

### 11.1 Development
```
Client: Vite dev server (port 5173)
Server: Node.js with nodemon (port 3001)
Database: Local MongoDB (port 27017)
Redis: Local Redis (port 6379)
```

### 11.2 Production
```
┌─────────────┐     ┌──────────┐     ┌──────────────┐
│   Nginx     │────▶│  Client  │     │  Node.js     │
│   Reverse   │     │  Static  │     │  Cluster     │
│   Proxy     │────▶│  Files   │     │  (PM2)       │
│   :80/443   │     └──────────┘     └──────┬───────┘
└─────────────┘                              │
                                     ┌───────┴───────┐
                                     │   MongoDB     │
                                     │   Atlas       │
                                     └───────────────┘
```

### 11.3 Environment Variables

```env
# Server
NODE_ENV=production
PORT=3001
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/codenexus
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=<random-256-bit-key>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=AIza...
DEFAULT_AI_PROVIDER=openai
DEFAULT_AI_MODEL=gpt-4o

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
AI_RATE_LIMIT_PER_HOUR=100

# Logging
LOG_LEVEL=info
```
