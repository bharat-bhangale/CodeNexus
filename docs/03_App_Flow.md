# App Flow Document
## CodeNexus — Complete User Flow & Interaction Map

**Version:** 1.0  
**Date:** June 2026  

---

## 1. High-Level Application Flow

```
┌────────────┐    ┌────────────┐    ┌────────────────────────────────────┐
│   Landing  │───▶│   Auth     │───▶│         Main Dashboard             │
│   Page     │    │  (Login/   │    │  ┌──────────────────────────────┐  │
│            │    │  Register) │    │  │     Project List              │  │
└────────────┘    └────────────┘    │  │  [New Project] [Open Recent] │  │
                                    │  └──────────────┬───────────────┘  │
                                    └─────────────────┼──────────────────┘
                                                      │
                                                      ▼
                                    ┌────────────────────────────────────┐
                                    │         Editor Workspace           │
                                    │  ┌────┐ ┌──────────┐ ┌─────────┐ │
                                    │  │Side│ │  Monaco   │ │  AI     │ │
                                    │  │bar │ │  Editor   │ │  Panel  │ │
                                    │  │    │ │           │ │         │ │
                                    │  └────┘ └──────────┘ └─────────┘ │
                                    │         ┌──────────┐              │
                                    │         │ Terminal  │              │
                                    │         └──────────┘              │
                                    └────────────────────────────────────┘
```

---

## 2. Authentication Flow

### 2.1 Registration Flow

```
User opens app
  │
  ├─ Not logged in?
  │     │
  │     ▼
  │   Landing Page displayed
  │     │
  │     ├─ Click "Get Started" / "Sign Up"
  │     │     │
  │     │     ▼
  │     │   Registration Form
  │     │   ├─ Full Name (required)
  │     │   ├─ Email (required, validated)
  │     │   ├─ Password (required, min 8 chars, 1 uppercase, 1 number)
  │     │   └─ Confirm Password (must match)
  │     │     │
  │     │     ├─ Validation passes
  │     │     │     │
  │     │     │     ▼
  │     │     │   POST /api/v1/auth/register
  │     │     │     │
  │     │     │     ├─ Success (201)
  │     │     │     │   ├─ JWT stored in httpOnly cookie
  │     │     │     │   ├─ User data stored in Zustand
  │     │     │     │   └─ Redirect to Dashboard
  │     │     │     │
  │     │     │     └─ Error (409 — email exists)
  │     │     │         └─ Show error: "Email already registered"
  │     │     │
  │     │     └─ Validation fails
  │     │           └─ Show inline field errors
  │     │
  │     └─ Click "Login"
  │           └─ → Login Flow (2.2)
  │
  └─ Already logged in (valid JWT)?
        └─ Redirect to Dashboard
```

### 2.2 Login Flow

```
Login Page
  │
  ├─ Email + Password entered
  │     │
  │     ▼
  │   POST /api/v1/auth/login
  │     │
  │     ├─ Success (200)
  │     │   ├─ JWT pair (access + refresh) set in cookies
  │     │   ├─ User profile loaded into store
  │     │   └─ Redirect to Dashboard
  │     │
  │     └─ Error
  │         ├─ 401: "Invalid email or password"
  │         └─ 429: "Too many attempts. Try again in X minutes"
  │
  └─ "Forgot Password?" link
        └─ → Password Reset Flow (email-based, out of scope for v1)
```

---

## 3. Dashboard Flow

### 3.1 Project Management

```
Dashboard (after login)
  │
  ├─ Projects loaded: GET /api/v1/projects
  │
  ├─ Project List displayed as cards:
  │   ┌───────────────────────────────────┐
  │   │  📁 My React App                  │
  │   │  Last edited: 2 hours ago         │
  │   │  12 files │ Health: 78/100        │
  │   │  [Open] [Settings] [Delete]       │
  │   └───────────────────────────────────┘
  │
  ├─ Click "New Project"
  │     │
  │     ▼
  │   New Project Modal
  │   ├─ Project Name (required)
  │   ├─ Template: [Blank] [React App] [Express API] [Full Stack]
  │   ├─ Description (optional)
  │   └─ [Create Project]
  │         │
  │         ▼
  │       POST /api/v1/projects
  │         │
  │         ├─ If template selected:
  │         │     POST /api/v1/ai/scaffold (generate files)
  │         │
  │         └─ Redirect to Editor Workspace
  │
  ├─ Click "Open" on existing project
  │     └─ Load project files → Open Editor Workspace
  │
  ├─ Click "Delete" on project
  │     ├─ Confirmation dialog: "Delete 'My React App'? This cannot be undone."
  │     ├─ Confirm → DELETE /api/v1/projects/:id → Remove from list
  │     └─ Cancel → Close dialog
  │
  └─ Search/filter projects by name
```

---

## 4. Editor Workspace Flow

### 4.1 Layout Initialization

```
Editor Workspace loads
  │
  ├─ Fetch project data: GET /api/v1/projects/:id
  ├─ Fetch file tree: GET /api/v1/projects/:id/files
  ├─ Connect WebSocket: io.connect(SERVER_URL)
  ├─ Load user preferences (theme, font size, panel positions)
  │
  ▼
  Layout renders:
  ┌──────────────────────────────────────────────────────────────┐
  │ [≡ Menu] [Project Name]                    [⚙ Settings] [👤]│
  ├──────┬───────────────────────────┬──────────────────────────┤
  │      │                           │                          │
  │      │                           │    Right Panel           │
  │ File │     Editor Area           │    (Chat by default)     │
  │ Tree │     (Welcome tab or       │                          │
  │      │      last opened file)    │    Switchable:           │
  │      │                           │    [Chat|Intent|         │
  │      │                           │     Memory|Health|       │
  │      │                           │     Review]              │
  │      │                           │                          │
  │      ├───────────────────────────┤                          │
  │      │     Bottom Panel          │                          │
  │      │     (Terminal, collapsed) │                          │
  ├──────┴───────────────────────────┴──────────────────────────┤
  │ ✓ Ready │ JavaScript │ UTF-8 │ Ln 1, Col 1 │ Health: --   │
  └──────────────────────────────────────────────────────────────┘
```

### 4.2 File Operations Flow

```
File Explorer (Left Sidebar)
  │
  ├─ Click file → Open in editor tab
  │     │
  │     ├─ File already open? → Switch to existing tab
  │     └─ New file? → Fetch content, create new tab
  │           GET /api/v1/projects/:id/files/:fileId
  │
  ├─ Right-click file → Context Menu
  │     ├─ Rename → Inline rename input
  │     ├─ Delete → Confirm dialog → DELETE /api/v1/projects/:id/files/:fileId
  │     ├─ Duplicate → POST /api/v1/projects/:id/files (copy content)
  │     └─ Copy Path → Copy to clipboard
  │
  ├─ Right-click folder → Context Menu
  │     ├─ New File → Input filename → POST /api/v1/projects/:id/files
  │     ├─ New Folder → Input folder name → POST /api/v1/projects/:id/files
  │     ├─ Rename → Inline rename
  │     └─ Delete → Confirm → DELETE (recursive)
  │
  └─ Drag & drop → Move file/folder
        PUT /api/v1/projects/:id/files/:fileId (update path)
```

### 4.3 Code Editing Flow

```
User types in Monaco Editor
  │
  ├─ On every keystroke:
  │     ├─ File marked as "dirty" (unsaved indicator on tab)
  │     ├─ Debounced auto-save (500ms after last keystroke)
  │     │     PUT /api/v1/projects/:id/files/:fileId { content }
  │     └─ AI autocomplete triggered (if enabled)
  │           POST /api/v1/ai/complete { code, cursorPosition, language }
  │           → Inline suggestion appears (grey text)
  │           → Tab to accept, Escape to dismiss
  │
  ├─ Ctrl+S / Cmd+S → Manual save
  │     PUT /api/v1/projects/:id/files/:fileId { content }
  │     ├─ Trigger code health recalculation (background)
  │     └─ Show "Saved" toast notification
  │
  ├─ Ctrl+Z / Cmd+Z → Undo
  ├─ Ctrl+Shift+Z / Cmd+Shift+Z → Redo
  │
  ├─ Select code → Context actions appear:
  │     ├─ 💡 Quick Actions lightbulb
  │     │     ├─ "Explain Selection"
  │     │     ├─ "Refactor with Intent"
  │     │     ├─ "Generate Tests"
  │     │     ├─ "Add Documentation"
  │     │     └─ "Review Selection"
  │     │
  │     └─ Right-click → Editor context menu
  │           ├─ Standard: Cut, Copy, Paste, Select All
  │           ├─ AI: Explain, Refactor, Test, Document
  │           └─ Navigate: Go to Definition, Find References
  │
  └─ Editor tabs:
        ├─ Click tab → Switch active file
        ├─ Click X → Close tab (prompt save if dirty)
        ├─ Middle-click → Close tab
        ├─ Drag tab → Reorder
        └─ Right-click tab → [Close Others] [Close All] [Close Saved]
```

---

## 5. Intent Mode Flow

```
User activates Intent Mode
  │
  ├─ Method 1: Click "Intent" button in right panel
  ├─ Method 2: Keyboard shortcut Ctrl+Shift+I
  ├─ Method 3: Right-click selection → "Refactor with Intent"
  │
  ▼
  Intent Panel Opens (Right Side)
  │
  ├─ Step 1: Select scope
  │     ├─ "Selected Code" (if text selected)
  │     ├─ "Current File"
  │     └─ "Multiple Files" (select from file tree)
  │
  ├─ Step 2: Choose intent
  │     ├─ Predefined buttons:
  │     │   [🚀 Performance] [📐 Scalability] [📖 Readability]
  │     │   [🔒 Security] [⚡ Optimization] [♿ Accessibility]
  │     │   [🧪 Testing] [📝 Documentation]
  │     │
  │     └─ Custom intent text input:
  │         "Make this production-ready" / "Add error handling" / etc.
  │
  ├─ Step 3: AI analyzes (loading state with progress indicator)
  │     POST /api/v1/ai/intent
  │     {
  │       code: "...",
  │       intent: "performance",
  │       language: "javascript",
  │       fileContext: [...],          // Other files for context
  │       decisionHistory: [...]       // Recent decisions
  │     }
  │     │
  │     ▼ (Streaming response via WebSocket)
  │
  ├─ Step 4: Results displayed
  │     ┌─────────────────────────────────────────┐
  │     │  🚀 Performance Analysis                 │
  │     │  Confidence: 87%                        │
  │     │                                          │
  │     │  Suggestion 1 of 3:                      │
  │     │  "Replace Array.find() loop with Map     │
  │     │   lookup for O(1) access"                │
  │     │  [View Diff] [Accept] [Skip]             │
  │     │                                          │
  │     │  ── Diff View ──                         │
  │     │  - const user = users.find(u =>          │
  │     │  -   u.id === targetId);                 │
  │     │  + const userMap = new Map(              │
  │     │  +   users.map(u => [u.id, u]));         │
  │     │  + const user = userMap.get(targetId);   │
  │     │                                          │
  │     │  Reference: "Use hash maps for O(1)      │
  │     │  lookups instead of linear search"       │
  │     │                                          │
  │     │  [Accept All] [Review Each] [Dismiss]    │
  │     └─────────────────────────────────────────┘
  │
  ├─ Step 5: User action
  │     ├─ "Accept" → Apply change to editor
  │     │     ├─ Code updated in Monaco
  │     │     ├─ Decision recorded: POST /api/v1/projects/:id/decisions
  │     │     └─ Toast: "Change applied successfully"
  │     │
  │     ├─ "Accept All" → Apply all suggestions sequentially
  │     │
  │     ├─ "Skip" → Move to next suggestion
  │     │
  │     └─ "Dismiss" → Close Intent panel, no changes
  │
  └─ Undo: Ctrl+Z reverts the last applied suggestion
```

---

## 6. Explain My Code Flow

```
User activates Explain My Code
  │
  ├─ Method 1: Click "Explain" in right panel
  ├─ Method 2: Keyboard shortcut Ctrl+Shift+E
  ├─ Method 3: Right-click → "Explain Selection"
  ├─ Method 4: Chat command: /explain
  │
  ▼
  Visualization Panel Opens
  │
  ├─ Step 1: Choose visualization type
  │     ├─ [📊 Dependency Graph] — File imports and connections
  │     ├─ [🔗 Call Graph] — Function call chains
  │     ├─ [💧 Data Flow] — Data transformations
  │     ├─ [🌳 Component Tree] — React component hierarchy
  │     └─ [📍 Variable Lifecycle] — Variable tracking
  │
  ├─ Step 2: Choose scope
  │     ├─ "Selected Function" (if cursor in a function)
  │     ├─ "Current File"
  │     └─ "Entire Project"
  │
  ├─ Step 3: Processing
  │     POST /api/v1/ai/explain
  │     {
  │       type: "dependency_graph",
  │       scope: "project",
  │       files: [...all file contents...],
  │       language: "javascript"
  │     }
  │     │
  │     ▼
  │   Backend:
  │   1. Parse all files to AST (CodeAnalyzer service)
  │   2. Extract relationships (GraphGenerator service)
  │   3. AI generates natural language summaries
  │   4. Return graph data + summaries
  │
  ├─ Step 4: Interactive visualization renders
  │     ┌──────────────────────────────────────┐
  │     │  Dependency Graph — My React App      │
  │     │  ┌─────┐    ┌─────────┐              │
  │     │  │App.jsx├──▶│Header.jsx│             │
  │     │  │      ├──▶│Sidebar.jsx│            │
  │     │  │      ├──▶│Editor.jsx │───▶...     │
  │     │  └──────┘   └──────────┘             │
  │     │                                       │
  │     │  AI Summary:                          │
  │     │  "App.jsx is the root component that  │
  │     │   imports 5 child components..."      │
  │     │                                       │
  │     │  [Zoom +/-] [Reset] [Search] [Export] │
  │     └──────────────────────────────────────┘
  │
  └─ Interactions:
        ├─ Click node → Navigate to file in editor + show details panel
        ├─ Hover node → Show file summary tooltip
        ├─ Click edge → Show relationship details
        ├─ Scroll → Zoom in/out
        ├─ Drag → Pan the canvas
        ├─ Double-click node → Expand to show internal functions
        ├─ Search → Highlight matching nodes
        └─ Export → Download as PNG/SVG/HTML
```

---

## 7. Decision Memory Flow

```
Decision Memory operates in two modes: Automatic and Manual
  │
  ├─ AUTOMATIC RECORDING (Background)
  │     │
  │     ├─ User accepts an Intent Mode suggestion
  │     │     → Record: { type: "intent", intent, before, after, file, timestamp }
  │     │
  │     ├─ User accepts an AI Code Review fix
  │     │     → Record: { type: "review_fix", category, before, after, file }
  │     │
  │     ├─ User applies AI chat suggestion
  │     │     → Record: { type: "chat_apply", question, answer, code }
  │     │
  │     └─ User creates files via scaffolding
  │           → Record: { type: "scaffold", template, structure, description }
  │
  ├─ MANUAL RECORDING
  │     │
  │     ├─ User opens Decision Memory panel
  │     ├─ Click "Record Decision"
  │     │     ├─ Title: "Chose Redux over Context API"
  │     │     ├─ Reason: "Need centralized state with middleware support"
  │     │     ├─ Tags: [state-management, architecture]
  │     │     ├─ Affected files: [store.js, App.jsx]
  │     │     └─ [Save]
  │     │
  │     └─ POST /api/v1/projects/:id/decisions
  │
  ├─ VIEWING DECISIONS
  │     │
  │     Decision Memory Panel (Right Side)
  │     ┌──────────────────────────────────────┐
  │     │  🧠 Decision Memory                  │
  │     │  [Timeline] [Search] [Patterns]      │
  │     │                                       │
  │     │  ── Timeline View ──                  │
  │     │                                       │
  │     │  📌 Today                             │
  │     │  ├ Used Map for O(1) lookups          │
  │     │  │ Intent: Performance │ File: utils.js│
  │     │  │ Confidence: 87%                    │
  │     │  │                                    │
  │     │  ├ Added input validation             │
  │     │  │ Intent: Security │ File: api.js    │
  │     │  │                                    │
  │     │  📌 Yesterday                         │
  │     │  ├ Chose Redux over Context API       │
  │     │  │ Manual │ Tags: architecture        │
  │     │  │                                    │
  │     │  [Load More]                          │
  │     └──────────────────────────────────────┘
  │
  ├─ SEARCH & FILTER
  │     ├─ Search by keyword in title/reason
  │     ├─ Filter by type (intent, review, chat, manual, scaffold)
  │     ├─ Filter by tag
  │     ├─ Filter by date range
  │     └─ Filter by file
  │
  ├─ PATTERN DETECTION
  │     │
  │     GET /api/v1/projects/:id/patterns
  │     │
  │     ▼
  │     AI analyzes all decisions and identifies patterns:
  │     ┌──────────────────────────────────────┐
  │     │  🔍 Detected Patterns                │
  │     │                                       │
  │     │  1. "You consistently use async/await │
  │     │      over .then() chains"             │
  │     │      Seen in: 8 decisions             │
  │     │      [Create Rule]                    │
  │     │                                       │
  │     │  2. "You prefer functional components │
  │     │      with hooks over class components"│
  │     │      Seen in: 12 decisions            │
  │     │      [Create Rule]                    │
  │     └──────────────────────────────────────┘
  │
  │     Click "Create Rule":
  │     → Rule saved: "Always use async/await instead of .then() chains"
  │     → AI references this rule in future suggestions
  │
  └─ AI USING MEMORY
        │
        When AI generates any suggestion (Intent, Chat, Review):
        1. Fetch last 20 decisions for the project
        2. Fetch all project rules
        3. Include in AI prompt context
        4. AI references past decisions in its response
        Example: "Based on your preference for Redux (Decision #14),
                  I'm using Redux Toolkit for this state management..."
```

---

## 8. Smart Contextual Chat Flow

```
Chat Panel (Right Side — Default View)
  │
  ├─ Initial state:
  │     "Hi! I'm your AI coding assistant. I can see your current file
  │      and project context. Ask me anything or use /commands."
  │
  ├─ User types message
  │     │
  │     ├─ Regular message:
  │     │   "How does the authentication middleware work?"
  │     │     │
  │     │     ▼
  │     │   POST /api/v1/ai/chat (via WebSocket for streaming)
  │     │   {
  │     │     message: "...",
  │     │     context: {
  │     │       activeFile: { name, content, language },
  │     │       selectedText: "...",
  │     │       cursorPosition: { line, col },
  │     │       openFiles: [...],
  │     │       projectStructure: {...},
  │     │       recentDecisions: [...]
  │     │     }
  │     │   }
  │     │     │
  │     │     ▼
  │     │   AI response streams word-by-word
  │     │   → Code blocks syntax-highlighted
  │     │   → "Apply to Editor" button on code blocks
  │     │   → "Copy" button on code blocks
  │     │
  │     └─ Slash command:
  │         /explain → Explain selected code (detailed breakdown)
  │         /refactor → Suggest refactoring for selection
  │         /test → Generate unit tests for selection/file
  │         /doc → Generate JSDoc/docstring
  │         /debug → Analyze for potential bugs
  │         /perf → Performance analysis
  │         /security → Security vulnerability scan
  │
  ├─ Chat features:
  │     ├─ Multi-turn conversation (context retained)
  │     ├─ Chat history persisted per project
  │     ├─ Clear chat button
  │     ├─ Copy entire conversation
  │     ├─ Code in responses has "Insert at Cursor" action
  │     └─ Markdown rendering with syntax highlighting
  │
  └─ Context awareness:
        ├─ Switches context when user changes active file
        ├─ Updates context when user selects new text
        ├─ References open files when relevant
        └─ References Decision Memory for consistency
```

---

## 9. AI Code Review Flow

```
User triggers Code Review
  │
  ├─ Method 1: Click "Review" in right panel
  ├─ Method 2: Keyboard shortcut Ctrl+Shift+R
  ├─ Method 3: Automatic on file save (if enabled in settings)
  │
  ▼
  POST /api/v1/ai/review
  {
    code: "...",
    language: "javascript",
    categories: ["bugs", "security", "performance", "style"],
    dismissedPatterns: [...],     // Patterns user previously dismissed
    projectRules: [...]           // From Decision Memory
  }
  │
  ▼
  Review Results Panel
  ┌──────────────────────────────────────────┐
  │  🔍 Code Review — utils.js               │
  │  Found: 3 issues                          │
  │                                           │
  │  🔴 Critical (1)                          │
  │  ├ Line 24: SQL Injection vulnerability   │
  │  │ "User input directly interpolated in   │
  │  │  database query"                       │
  │  │ [View] [Fix] [Dismiss]                 │
  │  │                                        │
  │  🟡 Warning (1)                           │
  │  ├ Line 45: Potential memory leak         │
  │  │ "Event listener added but never        │
  │  │  removed in useEffect cleanup"         │
  │  │ [View] [Fix] [Dismiss]                 │
  │  │                                        │
  │  🔵 Info (1)                              │
  │  ├ Line 12: Consider using const          │
  │  │ "Variable 'data' is never reassigned"  │
  │  │ [View] [Fix] [Dismiss]                 │
  │  │                                        │
  │  [Apply All Fixes] [Dismiss All]          │
  └──────────────────────────────────────────┘
  │
  ├─ Click "View" → Editor scrolls to line, highlights issue
  │
  ├─ Click "Fix" → AI generates fix
  │     ├─ Diff preview shown
  │     ├─ [Apply Fix] → Code updated, decision recorded
  │     └─ [Cancel] → Return to review list
  │
  ├─ Click "Dismiss" → Issue hidden
  │     ├─ Dismissed 3 times? → Pattern added to exclusion list
  │     └─ "Don't show this type again" option
  │
  └─ Inline annotations shown in editor (colored squiggly underlines)
        ├─ Red = Critical
        ├─ Yellow = Warning
        └─ Blue = Info
        Hover on annotation → Shows issue details + "Quick Fix" action
```

---

## 10. Code Health Dashboard Flow

```
User opens Health Dashboard
  │
  ├─ Click "Health" tab in right panel
  │
  ▼
  Health Dashboard loads
  GET /api/v1/projects/:id/health
  │
  ▼
  ┌──────────────────────────────────────────┐
  │  💚 Code Health Score: 78/100            │
  │  ┌────────────────────────────────────┐  │
  │  │  ████████████████░░░░░  78%        │  │
  │  └────────────────────────────────────┘  │
  │                                          │
  │  Metrics Breakdown:                      │
  │  ├ Complexity:      72/100  ██████▒░░░  │
  │  ├ Duplication:     85/100  ████████░░  │
  │  ├ Coverage (est):  60/100  ██████░░░░  │
  │  ├ Documentation:   90/100  █████████░  │
  │  ├ Dependencies:    75/100  ███████░░░  │
  │  └ Dead Code:       88/100  ████████▒░  │
  │                                          │
  │  📈 Trend (Last 7 days):                │
  │  [Sparkline chart showing improvement]   │
  │                                          │
  │  🔥 Hot Spots:                          │
  │  1. utils/parser.js — Complexity: 45    │
  │  2. api/routes.js — Duplication: 3 blocks│
  │  3. components/Form.jsx — No docs       │
  │                                          │
  │  💡 AI Recommendations:                 │
  │  "Break down parser.js into smaller      │
  │   modules to reduce complexity"          │
  │  [Apply Recommendation]                  │
  └──────────────────────────────────────────┘
  │
  ├─ Click metric → Expanded view with details
  ├─ Click hot spot → Navigate to file in editor
  ├─ Click "Apply Recommendation" → Opens Intent Mode with suggestion
  └─ Score updates automatically on file save
```

---

## 11. Terminal Integration Flow

```
User opens Terminal
  │
  ├─ Click Terminal icon in bottom panel
  ├─ Keyboard shortcut: Ctrl+` (backtick)
  │
  ▼
  Terminal panel expands from bottom
  ┌──────────────────────────────────────────┐
  │  Terminal 1 [+] [×]                       │
  │  $ ▌                                      │
  │                                           │
  │  (xterm.js instance connected to server   │
  │   via WebSocket — simulated shell for v1) │
  │                                           │
  └──────────────────────────────────────────┘
  │
  ├─ User types command
  │     ├─ AI suggests commands (ghost text):
  │     │   "npm install express" → Tab to accept
  │     │
  │     ├─ Command executes (simulated in v1)
  │     │   Output displayed in terminal
  │     │
  │     └─ Error occurs:
  │           AI detects error in output
  │           ┌─────────────────────────────┐
  │           │ 💡 AI suggests fix:          │
  │           │ "Module not found. Try:     │
  │           │  npm install missing-pkg"   │
  │           │ [Run Fix] [Dismiss]         │
  │           └─────────────────────────────┘
  │
  ├─ Multiple terminals:
  │     [Terminal 1] [Terminal 2] [+]
  │     Each runs independently
  │
  └─ Terminal height resizable via drag handle
```

---

## 12. Settings Flow

```
User opens Settings
  │
  ├─ Click ⚙ icon in top bar
  │
  ▼
  Settings Modal
  │
  ├─ Editor Settings
  │     ├─ Theme: [CodeNexus Dark ▼] / [Light] / [High Contrast]
  │     ├─ Font Size: [14 ▼] (range: 10-24)
  │     ├─ Font Family: [JetBrains Mono ▼]
  │     ├─ Tab Size: [2 ▼] / [4]
  │     ├─ Word Wrap: [on ▼] / [off]
  │     ├─ Minimap: [✓]
  │     └─ Auto-save: [✓] (delay: 500ms)
  │
  ├─ AI Settings
  │     ├─ AI Provider: [OpenAI ▼] / [Anthropic] / [Google]
  │     ├─ Model: [GPT-4o ▼] / [GPT-4o-mini] / [Custom]
  │     ├─ API Key: [••••••••••] [Show/Hide]
  │     ├─ Auto-complete: [✓]
  │     ├─ Auto-review on save: [✓]
  │     └─ Temperature: [0.3 ▼] (range: 0-1)
  │
  ├─ Decision Memory Settings
  │     ├─ Auto-record decisions: [✓]
  │     ├─ Pattern detection: [✓]
  │     └─ [Export Decisions] [Clear Decisions]
  │
  └─ Account Settings
        ├─ Display Name
        ├─ Email (read-only)
        ├─ [Change Password]
        └─ [Delete Account]
```

---

## 13. Keyboard Shortcuts Reference

| Shortcut | Action |
|---|---|
| `Ctrl+S` | Save current file |
| `Ctrl+Shift+I` | Open Intent Mode |
| `Ctrl+Shift+E` | Open Explain My Code |
| `Ctrl+Shift+R` | Run Code Review |
| `Ctrl+Shift+C` | Toggle Chat Panel |
| `Ctrl+Shift+M` | Open Decision Memory |
| `Ctrl+Shift+H` | Open Health Dashboard |
| `Ctrl+`` ` | Toggle Terminal |
| `Ctrl+P` | Quick File Open (fuzzy search) |
| `Ctrl+Shift+P` | Command Palette |
| `Ctrl+B` | Toggle Sidebar |
| `Ctrl+\` | Split Editor |
| `Ctrl+W` | Close Current Tab |
| `Ctrl+Tab` | Switch Tabs |

---

## 14. Error States & Edge Cases

| Scenario | User Sees | System Action |
|---|---|---|
| AI API timeout (>30s) | "AI is taking longer than usual. Retry?" | Cancel request, show retry button |
| AI API key invalid | "AI features unavailable. Check your API key in Settings." | Disable AI buttons, show settings link |
| WebSocket disconnected | "Reconnecting..." toast | Auto-retry with exponential backoff |
| File save fails | "Failed to save. Retrying..." | Retry 3 times, then show error |
| Project load fails | "Could not load project. [Retry] [Back to Dashboard]" | Log error, offer retry |
| Large file (>10k lines) | "Large file detected. Some features may be slower." | Disable auto-review, limit visualizations |
| Rate limit reached | "AI request limit reached. Resets in X minutes." | Show countdown timer |
| Empty project | "Get started by creating a new file or using a template." | Show onboarding tips |
