# Feature Master Prompts
## CodeNexus — AI Coding Agent Prompts for Building Each Feature

**Version:** 1.0  
**Date:** June 2026  
**Target Model:** Claude Opus 4.6 (Thinking)  

---

> **How to use this file:** Each section below contains a self-contained prompt for an AI coding agent (Claude Opus 4.6). Copy the entire prompt for a feature and paste it into your AI coding tool. The prompts are designed to be:
> - **Role-based** — The AI adopts a specific expert persona
> - **Context-rich** — All necessary specifications are embedded
> - **Step-by-step** — Clear multi-step instructions to minimize token waste
> - **Unambiguous** — Concrete file paths, code patterns, and acceptance criteria

---

## Prompt 1: Project Initialization & Infrastructure Setup

```
ROLE: You are a senior full-stack engineer setting up a production-grade monorepo for a web application called "CodeNexus" — an AI-powered code editor.

CONTEXT:
- CodeNexus is a browser-based AI code editor with React frontend and Node.js backend
- The project uses a monorepo structure with client/ and server/ directories
- Frontend: React 18 + Vite + Zustand + Monaco Editor
- Backend: Node.js 20 + Express.js + MongoDB + Socket.IO
- The project must be buildable and runnable with "npm run dev" from the root

TASK: Set up the complete project infrastructure. Execute these steps in order:

Step 1 — Create the monorepo root structure:
- Initialize a root package.json with npm workspaces pointing to client/ and server/
- Create a .gitignore that excludes: node_modules, .env, dist, build, .DS_Store, *.log
- Create a README.md with the project name, description, and setup instructions

Step 2 — Initialize the client (React + Vite):
- Create client/ directory with Vite + React template
- Install these dependencies: @monaco-editor/react, react-router-dom@6, zustand, axios, lucide-react, framer-motion, react-resizable-panels, react-markdown, remark-gfm, @reactflow/core, @reactflow/background, @reactflow/controls, dagre
- Install dev dependencies: vitest, @testing-library/react, @testing-library/jest-dom
- Create the full directory structure under client/src/ with empty placeholder files for:
  - components/ (layout, editor, explorer, chat, intent, visualize, memory, health, review, terminal, common)
  - hooks/, stores/, services/, utils/, themes/, styles/
- Create client/src/styles/index.css with all CSS variables from a dark theme:
  - Background layers: #0a0a0f, #12121a, #1a1a2e, #252540
  - Accent: #6366f1 (indigo), #8b5cf6 (violet), #06b6d4 (cyan)
  - Semantic: #22c55e (success), #f59e0b (warning), #ef4444 (error), #3b82f6 (info)
  - Font variables: Inter for UI, JetBrains Mono for code
  - Spacing scale: 4px to 40px
  - Border and shadow variables

Step 3 — Initialize the server (Node.js + Express):
- Create server/ directory with package.json
- Install dependencies: express, mongoose, dotenv, cors, helmet, jsonwebtoken, bcryptjs, express-rate-limit, winston, joi, socket.io, openai
- Install dev dependencies: nodemon, vitest, supertest
- Create the full directory structure under server/src/ with placeholder files:
  - config/, routes/, controllers/, services/, models/, middleware/, sockets/, prompts/, utils/
- Create server/src/app.js with basic Express setup:
  - CORS configured for client URL
  - helmet() for security headers
  - express.json() body parser (limit: 10mb)
  - Rate limiting middleware
  - Error handling middleware
- Create server/src/index.js as the entry point
- Create server/.env.example with all required environment variables

Step 4 — Configure development scripts:
- Root package.json scripts: dev (runs both), dev:client, dev:server, build, test
- Use concurrently to run client and server together
- Client runs on port 5173, server on port 3001

Step 5 — Verify the setup:
- Run "npm install" from root
- Run "npm run dev" and confirm both servers start
- Confirm client renders a basic React page
- Confirm server responds to GET /api/v1/health with { status: "ok" }

OUTPUT: All files with complete content. Do not use placeholder comments like "// TODO" — write working code for every file.
```

---

## Prompt 2: Core Layout & Monaco Editor Integration

```
ROLE: You are a frontend architect specializing in IDE-like web applications. You are building the core editor layout for CodeNexus.

CONTEXT:
- CodeNexus is a browser-based AI code editor built with React 18 + Vite
- The layout mimics a professional IDE: sidebar | editor | right panel, with a bottom panel and status bar
- Using react-resizable-panels for the resizable panel layout
- Using @monaco-editor/react for the code editor
- Using Zustand for state management
- All styles use CSS variables defined in index.css (dark theme)
- The color palette: backgrounds #0a0a0f to #2d2d50, accent #6366f1, text #e4e4e7

TASK: Build the complete editor layout and Monaco Editor integration. Execute these steps:

Step 1 — Create the Zustand stores:
- editorStore.js: manages openFiles (array of {id, name, path, content, language, isDirty}), activeFileId, cursorPosition, selection, actions: openFile, closeFile, setActiveFile, updateFileContent, setCursorPosition
- fileStore.js: manages fileTree (nested object), projectName, actions: setFileTree, addFile, deleteFile, renameFile
- uiStore.js: manages sidebarVisible, rightPanelVisible, bottomPanelVisible, activeRightPanel ('chat'|'intent'|'memory'|'health'|'review'), theme, actions: toggleSidebar, toggleRightPanel, toggleBottomPanel, setActiveRightPanel, setTheme

Step 2 — Build the layout components:
- AppLayout.jsx: Main wrapper using react-resizable-panels. Three horizontal panels (sidebar, editor area, right panel). Editor area has two vertical panels (code editor, bottom panel). Status bar at the bottom outside the panel group.
- TopBar.jsx: 40px height bar with: hamburger menu icon, project name, search icon (Ctrl+P), settings gear icon, user avatar. Background: var(--bg-surface), border-bottom: 1px solid var(--border-subtle).
- Sidebar.jsx: Contains FileExplorer (to be built in next prompt). Shows icon toolbar at top for switching sidebar views. Width: 240px default.
- BottomBar.jsx: 24px status bar showing: connection status, language, encoding, cursor position (Ln X, Col Y), health score placeholder.
- PanelManager.jsx: Right panel container with tab navigation for Chat/Intent/Memory/Health/Review.

Step 3 — Build the Monaco Editor components:
- CodeEditor.jsx: Wraps @monaco-editor/react. Configures the editor with: custom codenexus-dark theme, JetBrains Mono font at 14px, line numbers on, minimap enabled, bracket pair colorization, smooth scrolling, word wrap on. Reads content from editorStore.activeFile. Saves content changes back to store. Handles cursor position updates.
- EditorTabs.jsx: Horizontal tab bar above the editor. Each tab shows file icon + name + close button. Active tab has top accent border. Unsaved files show amber dot (●). Close button appears on hover. Support for tab switching and closing. Middle-click to close.
- monacoThemes.js: Define "codenexus-dark" theme with colors: background #0d0d14, foreground #e4e4e7, active line #1a1a2e, selection rgba(88,101,242,0.25), cursor #6366f1. Token colors: keywords #c792ea, strings #c3e88d, numbers #f78c6c, functions #82aaff, comments #546e7a (italic), types #ffcb6b, tags #f07178.

Step 4 — Wire everything together:
- App.jsx: Renders AppLayout as the main component
- Load a sample file into the store on mount (hello.js with sample code) so the editor shows content immediately
- All panels should be resizable by dragging the dividers
- Sidebar toggle: Ctrl+B
- Bottom panel toggle: Ctrl+`
- Right panel should show a placeholder "Chat Panel" text

Step 5 — Style everything:
- All components use CSS modules or plain CSS files (no Tailwind)
- Use the CSS variables from index.css
- Smooth transitions on panel resize (200ms ease)
- Dark, professional look matching the design brief

OUTPUT: Complete, working code for all files listed above. The app must render a functional IDE layout with Monaco Editor, tabs, and resizable panels when running "npm run dev".
```

---

## Prompt 3: File Explorer & Virtual File System

```
ROLE: You are a React developer building a file explorer component for an IDE-like web application called CodeNexus.

CONTEXT:
- CodeNexus has a sidebar with a file tree that shows the project's virtual file system
- Files are stored in a MongoDB database and loaded via REST API
- The file store (Zustand) manages the file tree as a nested object
- File icons are colored by file type (.jsx=React blue, .js=JS yellow, .css=CSS blue, etc.)
- The file explorer supports: expand/collapse folders, click to open, right-click context menu, create/rename/delete
- Using Lucide React for icons

EXISTING CODE: The Zustand stores (editorStore, fileStore, uiStore) are already created. The Express server has basic structure.

TASK: Build the complete file explorer system. Execute these steps:

Step 1 — Build the backend file API:
- Create server/src/models/File.js: Mongoose schema with fields: projectId, name, path, type ('file'|'folder'), content, language, size, lineCount, parentPath, version, timestamps. Indexes on {projectId, path} (unique compound) and {projectId, parentPath}.
- Create server/src/routes/file.routes.js: RESTful routes for GET /files (tree), GET /files/:id (content), POST /files (create), PUT /files/:id (update content), DELETE /files/:id.
- Create server/src/controllers/file.controller.js: Handlers for all routes. The GET /files endpoint returns a nested tree structure. Include a seed function that creates a sample project with 5-6 files (App.jsx, index.js, styles.css, utils/helpers.js, components/Header.jsx).
- Create server/src/services/fileService.js: Business logic for file operations.

Step 2 — Build the file explorer frontend:
- FileExplorer.jsx: Main container that fetches file tree from API on mount and renders as a recursive tree. Has a header with "EXPLORER" label and action buttons (new file, new folder, refresh). Bottom section has "New File" button.
- FileTreeNode.jsx: Recursive component for each file/folder. Shows: indent (16px per level), expand/collapse arrow for folders, file type icon (colored SVG), file name. Interactions: single-click selects and highlights, double-click opens file in editor tab. Selected state: bg var(--bg-active) with left border 2px var(--accent-primary). Hover: bg var(--bg-hover).
- FileContextMenu.jsx: Custom right-click context menu with: New File, New Folder, Rename, Delete, Copy Path. Positioned at cursor. Closes on click outside or Escape.

Step 3 — Implement file operations:
- Create file: shows inline input field in the tree, validates name, calls POST API
- Create folder: same as create file but type='folder'
- Rename: inline edit mode on the file name, validates, calls PUT API
- Delete: confirmation dialog, calls DELETE API, removes from tree
- Open file: fetches content if not cached, adds to editorStore.openFiles, switches active tab

Step 4 — Implement file type detection:
- Create client/src/utils/languageDetector.js: maps file extensions to Monaco language IDs
  - .js → javascript, .jsx → javascript, .ts → typescript, .tsx → typescript
  - .css → css, .html → html, .json → json, .md → markdown, .py → python
- Create file type icon components or use a mapping to Lucide icons with appropriate colors

Step 5 — Connect file explorer to editor:
- When a file is clicked in the explorer, it opens in the Monaco Editor
- If the file is already open, switch to its tab
- File content is fetched from the API and stored in editorStore
- Auto-save: debounce file content changes (500ms) and PUT to API

OUTPUT: Complete working file explorer with backend API. When running the app, the sidebar should show a tree of sample files that can be opened, edited, and saved.
```

---

## Prompt 4: Intent Mode — AI-Powered Code Transformation

```
ROLE: You are a senior AI engineer building the Intent Mode feature for CodeNexus — an AI-powered code editor. Intent Mode lets developers select a code improvement goal (performance, security, readability, etc.) and receive AI-generated suggestions with diff previews.

CONTEXT:
- CodeNexus uses React frontend with Monaco Editor, Node.js/Express backend
- AI integration uses OpenAI's GPT-4o API via the openai npm package
- All AI calls go through the backend (never expose API keys to the client)
- Intent Mode supports 8 predefined intents: Performance, Scalability, Readability, Security, Optimization, Accessibility, Testing, Documentation
- Users can also type a custom intent in natural language
- AI returns structured suggestions with: original code, improved code, explanation, confidence score, references
- Suggestions are shown as diff previews that users can accept, skip, or dismiss
- Accepted changes are recorded in Decision Memory (API call to POST /api/v1/projects/:id/decisions)

EXISTING CODE: The editor layout, file explorer, and Monaco Editor are already built. Zustand stores for editor, files, and UI exist.

TASK: Build the complete Intent Mode feature end-to-end. Execute these steps:

Step 1 — Build the AI service layer on the backend:
- Create server/src/services/ai/AIService.js: Provider-agnostic class with methods: analyze(code, intent, context), stream(prompt). Constructor takes a provider instance.
- Create server/src/services/ai/OpenAIProvider.js: Implements AI calls using the openai npm package. Supports streaming with async iterators. Handles errors gracefully with retry logic (3 retries with exponential backoff).
- Create server/src/config/ai.js: AI configuration from environment variables (API key, model name, temperature).
- Create server/src/prompts/intent.prompts.js: Prompt template function that builds the system and user prompts for Intent Mode. The prompt must:
  - Set the AI's role as an expert code reviewer
  - Include the code to analyze
  - Specify the intent (e.g., "performance")
  - Include recent decision history for consistency
  - Include project rules
  - Request JSON response format: { suggestions: [{ original, improved, explanation, confidence, references }] }

Step 2 — Create the Intent Mode API endpoint:
- Add route: POST /api/v1/ai/intent in server/src/routes/ai.routes.js
- Create server/src/controllers/ai.controller.js with handleIntent method:
  1. Validate request body (code, intent required; context optional)
  2. Build prompt using PromptBuilder
  3. Call AIService.analyze() with streaming
  4. Stream response chunks to the client via Server-Sent Events (SSE)
  5. Parse the final response into structured suggestions
  6. Return the suggestions with metadata (model, tokens used)

Step 3 — Build the Intent Mode frontend:
- Create client/src/stores/aiStore.js: Zustand store for AI state — isLoading, streamingResponse, suggestions (array), activeIntent, error, actions: setLoading, addSuggestion, setActiveIntent, clearSuggestions
- Create client/src/hooks/useAI.js: Custom hook that calls the intent API endpoint, handles SSE streaming, parses response, and updates the store
- Create client/src/components/intent/IntentPanel.jsx: Main container with three sections:
  1. Scope selector (radio buttons: Selected Code / Current File / Multiple Files)
  2. Intent selector grid
  3. Results section (shows after analysis)
- Create client/src/components/intent/IntentSelector.jsx: Grid of 8 intent buttons. Each button is a 72×72px card with an emoji icon and label. Hover: scale(1.05) with glow effect. Selected state: indigo border with accent tint. Also includes a text input for custom intents.
- Create client/src/components/intent/IntentResults.jsx: Displays streaming AI suggestions. Each suggestion card shows:
  - Title and explanation
  - Confidence badge (colored by score: red <50, yellow 50-75, green >75)
  - Diff view (Monaco Diff Editor showing before/after)
  - Action buttons: Accept (green), Skip (grey), Dismiss All
- Create client/src/components/intent/ConfidenceBadge.jsx: Animated circular or bar progress showing confidence score with color coding
- Create client/src/components/editor/DiffViewer.jsx: Uses Monaco's built-in diff editor to show original vs improved code side by side

Step 4 — Implement the accept/skip/dismiss flow:
- Accept: Apply the improved code to the editor (replace the original lines), mark suggestion as accepted, call POST /api/v1/projects/:id/decisions to record the decision with full context (type: "intent_accept", before/after code, intent, confidence, explanation)
- Skip: Move to the next suggestion without applying
- Accept All: Apply all suggestions sequentially
- Dismiss: Close the Intent panel, discard all suggestions

Step 5 — Add the keyboard shortcut:
- Ctrl+Shift+I opens/closes the Intent panel
- Register the shortcut in App.jsx or a global keyboard handler

Step 6 — Style everything:
- Intent buttons: background var(--bg-elevated), border var(--border-default), rounded 12px
- Each intent has a unique color: Performance #f97316, Scalability #8b5cf6, Readability #06b6d4, Security #ef4444, Optimization #22c55e, Accessibility #f59e0b, Testing #3b82f6, Documentation #a78bfa
- Diff view: red background for removed lines, green for added lines
- Loading state: animated pulsing dot with "Analyzing..." text
- Results animate in with fadeSlideIn (200ms)

OUTPUT: Complete Intent Mode feature that works end-to-end. When a user selects code, picks an intent, and clicks "Analyze", the AI should return actionable suggestions with diff previews that can be accepted or dismissed.
```

---

## Prompt 5: Explain My Code — Interactive Visualization

```
ROLE: You are a frontend visualization specialist building the "Explain My Code" feature for CodeNexus. This feature generates interactive visual representations of codebases — dependency graphs, function call chains, and component trees.

CONTEXT:
- CodeNexus uses React + React Flow (reactflow) for interactive graph rendering
- The backend uses @babel/parser to parse JavaScript/JSX files into ASTs
- The dagre library handles graph layout computation (hierarchical positioning)
- Visualizations are displayed in the right panel of the editor
- Four visualization types: Dependency Graph, Call Graph, Data Flow, Component Tree
- Each node in the graph is clickable — navigates to the relevant file in the editor
- The AI provides natural language summaries alongside each visual

EXISTING CODE: The editor layout, file explorer, Monaco Editor, Intent Mode, and AI service layer exist.

TASK: Build the complete Explain My Code feature. Execute these steps:

Step 1 — Build the code analysis engine (backend):
- Create server/src/services/CodeAnalyzer.js:
  - parseFile(content, language): Uses @babel/parser with jsx and flow plugins to parse JS/JSX to AST
  - extractImports(ast): Returns array of {source, specifiers} from import statements
  - extractExports(ast): Returns array of {name, type} from export statements
  - extractFunctions(ast): Returns array of {name, params, startLine, endLine, calls[]}
  - extractComponents(ast): Returns array of {name, props, children, startLine, endLine} for React components
- Create server/src/services/GraphGenerator.js:
  - generateDependencyGraph(files[]): Takes all project files, extracts imports, builds nodes (files) and edges (import relationships). Returns { nodes[], edges[] } with dagre-computed positions.
  - generateCallGraph(file, functionName): Builds a graph of function calls starting from a specific function. Nodes are functions, edges are call relationships.
  - generateComponentTree(files[]): Builds React component hierarchy showing parent-child relationships and prop passing.
  - generateDataFlow(file, variableName): Tracks variable through declarations, mutations, and reads.

Step 2 — Create the API endpoint:
- Add route: POST /api/v1/ai/explain in ai.routes.js
- Controller receives: type (dependency_graph|call_graph|component_tree|data_flow), scope, files[], language
- Process: parse files → generate graph → AI generates summary → return graph data + summary

Step 3 — Build the visualization frontend:
- Install if needed: reactflow, dagre
- Create client/src/components/visualize/VisualizationPanel.jsx: Container with:
  - Dropdown to select visualization type
  - Scope selector (current file / entire project)
  - "Generate" button
  - Graph canvas area
  - AI summary section below the graph
  - Export buttons (PNG, SVG)
- Create client/src/components/visualize/DependencyGraph.jsx: React Flow graph showing file import relationships. Custom nodes show file icon + name. Animated edges. Dot grid background.
- Create client/src/components/visualize/CallGraph.jsx: Shows function call chains with depth indicators
- Create client/src/components/visualize/ComponentTree.jsx: Shows React component hierarchy with prop labels on edges
- Create client/src/components/visualize/GraphControls.jsx: Zoom in/out buttons, reset view, fit view, search input that highlights matching nodes
- Create custom React Flow node component: 120×48px, rounded 8px, file icon, file/function name, hover glow effect
- Create custom React Flow edge component: animated dash pattern, colored on hover

Step 4 — Implement interactions:
- Click on a node → Open the corresponding file in the editor and scroll to the relevant line
- Hover on a node → Show tooltip with file/function summary
- Click on an edge → Show relationship details in a popover
- Search → Filter nodes and dim non-matching ones
- Double-click node → Expand to show internal functions/components

Step 5 — Add export functionality:
- PNG export using html-to-image library
- SVG export by serializing the React Flow canvas

Step 6 — Add keyboard shortcut:
- Ctrl+Shift+E opens the Explain My Code panel

OUTPUT: Complete working visualization system. When a user opens Explain My Code and generates a dependency graph, they should see an interactive, animated graph of their project's file relationships with clickable nodes.
```

---

## Prompt 6: Decision Memory — Persistent AI Learning

```
ROLE: You are a backend engineer and React developer building the Decision Memory system for CodeNexus. Decision Memory records every coding decision (accepted AI suggestions, manual choices) and uses this history to make the AI smarter over time.

CONTEXT:
- Decision Memory stores records of coding decisions with full context (what, why, before/after code)
- Decisions are auto-recorded when users accept Intent Mode suggestions, chat code applications, or review fixes
- Users can also manually record decisions with notes and tags
- A pattern detection system analyzes decisions and identifies recurring patterns
- Patterns can be converted into "project rules" that the AI follows in future suggestions
- All AI prompts include recent decisions and project rules for consistency
- Frontend shows a timeline view with search, filter, and pattern display

EXISTING CODE: The Intent Mode, Explain My Code, and Chat features exist. The Decision Mongoose model schema is defined in 05_Backend_Schema.md.

TASK: Build the complete Decision Memory system. Execute these steps:

Step 1 — Build the backend:
- Create server/src/models/Decision.js: Implement the full Mongoose schema from the Backend Schema Document (Section 2.4). Include all fields: title, description, type, source, codeContext, aiAnalysis, annotations, tags, affectedFiles, patternId, status. Create all required indexes including the text index for search.
- Create server/src/services/DecisionManager.js: Service class with methods:
  - create(decisionData): Validates and saves a new decision. Updates project stats.
  - findByProject(projectId, filters): Query decisions with filtering by type, tags, date range, file. Supports pagination (skip/limit).
  - findById(id): Get single decision with full details.
  - update(id, updates): Update annotations, tags, status.
  - delete(id): Soft delete (set status to 'superseded').
  - search(projectId, query): Full-text search using MongoDB text index.
  - getRecentForContext(projectId, limit=20): Get last N decisions for AI context injection.
- Create server/src/services/PatternDetector.js: Analyzes all decisions for a project and uses the AI to identify recurring patterns:
  1. Group decisions by tags and type
  2. Send groups to AI with prompt: "Analyze these coding decisions and identify recurring patterns"
  3. Return detected patterns with confidence scores and suggested rules
- Create server/src/routes/memory.routes.js: RESTful routes for decisions and patterns
- Create server/src/controllers/memory.controller.js: Handlers for all routes

Step 2 — Integrate auto-recording:
- Modify the Intent Mode accept flow: After applying a suggestion, automatically call DecisionManager.create() with type "intent_accept" and full context
- Modify the Chat apply flow: When user clicks "Apply to Editor" on a code block, record a decision with type "chat_apply"
- Modify the Review fix flow: When user applies a review fix, record with type "review_fix"

Step 3 — Build the Decision Memory frontend:
- Create client/src/stores/memoryStore.js: Zustand store for decisions[], patterns[], projectRules[], filters, searchQuery
- Create client/src/hooks/useDecisionMemory.js: Hook for fetching, creating, and searching decisions
- Create client/src/components/memory/DecisionTimeline.jsx: Chronological list grouped by date. Each day section has a header. Scrollable with "Load More" at bottom.
- Create client/src/components/memory/DecisionCard.jsx: Expandable card showing:
  - Collapsed: icon (by type), title, file name, timestamp, tags as badges
  - Expanded: full description, before/after code diff, AI explanation, confidence, user notes, edit button
- Create client/src/components/memory/DecisionSearch.jsx: Search bar + filter dropdowns (type, tags, date range, file). Filters update the timeline in real-time.
- Create client/src/components/memory/PatternDetector.jsx: Panel showing detected patterns:
  - Each pattern shows: description, occurrence count, confidence %, example decisions
  - "Create Rule" button converts pattern into a project rule
  - Rules list with delete option
- Create a "Record Decision" form: title, description, tags (multi-select), affected files, submit button

Step 4 — Inject decisions into AI prompts:
- Update server/src/prompts/intent.prompts.js: Include last 10 decisions and all project rules in the prompt
- Update server/src/prompts/chat.prompts.js: Include last 5 decisions in chat context
- Update server/src/prompts/review.prompts.js: Include project rules so review respects established patterns
- AI should reference specific decisions by title when relevant (e.g., "Consistent with your decision to use async/await")

Step 5 — Add keyboard shortcut:
- Ctrl+Shift+M opens the Decision Memory panel

OUTPUT: Complete Decision Memory system with auto-recording, manual entry, search, pattern detection, and AI integration. The AI should become noticeably more consistent after 5+ decisions are recorded.
```

---

## Prompt 7: Smart Contextual Chat with Slash Commands

```
ROLE: You are building the AI Chat feature for CodeNexus — a context-aware chat panel that knows the current file, cursor position, selected code, and project structure. The chat supports slash commands and streams AI responses with syntax-highlighted code blocks.

CONTEXT:
- The chat panel is docked on the right side of the editor
- It automatically includes context: active file, selected text, cursor position, open files, recent decisions
- Slash commands: /explain, /refactor, /test, /doc, /debug, /perf, /security
- AI responses stream word-by-word via Server-Sent Events or WebSocket
- Code blocks in responses are syntax-highlighted with copy and "Apply to Editor" buttons
- Chat history is persisted per project in MongoDB

EXISTING CODE: The AI service layer, Intent Mode, and Decision Memory exist. The ChatHistory model schema is defined in 05_Backend_Schema.md.

TASK: Build the complete Chat feature. Execute these steps:

Step 1 — Build the chat backend:
- Create server/src/models/ChatHistory.js: Implement schema from Backend Schema Document (Section 2.5)
- Create chat endpoint in ai.controller.js: POST /api/v1/ai/chat
  1. Receive message + context from frontend
  2. Load chat history from database (last 20 messages for context window)
  3. Build contextual prompt using PromptBuilder:
     - System prompt: "You are an AI coding assistant for CodeNexus. You have access to the user's current file, selection, and project context."
     - Include: active file content (truncated to 3000 chars), selected text, recent decisions, project rules
     - For slash commands, add specific instructions (e.g., /test → "Generate comprehensive unit tests for the selected code using Vitest")
  4. Stream response via SSE: Content-Type: text/event-stream
  5. Save both user message and AI response to ChatHistory collection

Step 2 — Build the chat frontend:
- Create client/src/components/chat/ChatPanel.jsx: Full chat interface with:
  - Header: "AI Chat" title, context indicator (shows current file name), clear history button
  - Message area: scrollable list of messages, auto-scrolls to bottom on new message, stops auto-scroll if user scrolls up
  - Input area at the bottom
- Create client/src/components/chat/ChatMessage.jsx: Renders individual messages:
  - User messages: right-aligned, accent background at 15% opacity, rounded 12px
  - AI messages: left-aligned, elevated background, rounded 12px
  - AI messages render Markdown using react-markdown with remark-gfm plugin
  - Code blocks: dark background, language label header, syntax highlighted with copy button and "Apply to Editor" button
  - Streaming state: shows blinking cursor at end of message
- Create client/src/components/chat/ChatInput.jsx: Message input with:
  - Expandable textarea (44px default, up to 120px)
  - Placeholder: "Type a message or use /commands..."
  - Submit on Enter (Shift+Enter for new line)
  - Send button (accent color)
  - "/" triggers the command palette
- Create client/src/components/chat/CommandPalette.jsx: Dropdown that appears when user types "/":
  - Lists all available commands with descriptions
  - Arrow keys to navigate, Enter to select
  - Filtered as user types (e.g., "/ex" shows /explain)

Step 3 — Implement "Apply to Editor":
- When user clicks "Apply to Editor" on a code block:
  1. If text is selected in the editor → replace selection with the code
  2. If no selection → insert at cursor position
  3. Record decision in Decision Memory (type: "chat_apply")
  4. Show success toast: "Code applied to [filename]"

Step 4 — Implement streaming:
- Use EventSource or fetch with ReadableStream on the frontend
- Parse SSE events: data: { content: "...", done: false }
- Append content chunks to the current AI message in real-time
- On done: true, finalize the message and save metadata (tokens, model, latency)

Step 5 — Style the chat:
- Follow the UI/UX Design Brief Section 5.6 for all styles
- Messages animate in with fadeSlideIn (300ms)
- Streaming cursor blinks
- Code blocks have a dark background with colored header
- Responsive to panel width changes

OUTPUT: Complete working chat system with streaming, slash commands, code block actions, and persistent history. Users should be able to have multi-turn conversations with full project context.
```

---

## Prompt 8: AI Code Review with Inline Annotations

```
ROLE: You are building the AI Code Review feature for CodeNexus. This feature analyzes code for bugs, security vulnerabilities, performance issues, and style problems. It shows results as inline annotations in the Monaco Editor and in a review panel.

CONTEXT:
- Code review can be triggered manually or automatically on file save (configurable)
- Review categories: bugs, security, performance, style, accessibility, best-practice
- Each issue has severity: critical (red), warning (yellow), info (blue)
- Issues appear as colored squiggly underlines in the Monaco Editor
- Hovering on an annotation shows the issue details
- Each issue has a one-click fix button that generates and applies the fix
- Dismissed issues are tracked — after 3 dismissals of the same pattern, it's auto-excluded

EXISTING CODE: Full editor, AI service, Intent Mode, Chat, Decision Memory exist.

TASK: Build the complete Code Review feature. Execute these steps:

Step 1 — Build the review backend:
- Create server/src/models/ReviewResult.js from Backend Schema Document (Section 2.7)
- Create server/src/services/ReviewEngine.js:
  - reviewCode(code, language, categories, dismissedPatterns, projectRules): Calls AI to analyze code. Returns structured issues.
  - generateFix(code, issue): Generates a fix for a specific issue
- Create server/src/prompts/review.prompts.js: Review prompt that asks AI to analyze for bugs, security, performance, and style. Response format: JSON array of issues with severity, category, lineStart, lineEnd, title, description, suggestedFix
- Add endpoint: POST /api/v1/ai/review
- Add endpoint: POST /api/v1/ai/review/fix (generates fix for a single issue)

Step 2 — Build the review frontend:
- Create client/src/components/review/ReviewPanel.jsx: Right panel showing review results:
  - Summary: "Found X issues" with counts by severity
  - Grouped by severity (Critical → Warning → Info)
  - Each issue card: severity icon, line number, title, description, [View] [Fix] [Dismiss] buttons
  - "Apply All Fixes" and "Dismiss All" buttons at bottom
- Create client/src/components/review/ReviewAnnotation.jsx: Monaco Editor decorations:
  - Register Monaco markers (squiggly underlines) for each issue
  - Red = critical, Yellow = warning, Blue = info
  - Hover provider shows issue details + "Quick Fix" action
- Create client/src/components/review/ReviewSummary.jsx: Summary statistics with colored badges

Step 3 — Implement inline Monaco annotations:
- Use monaco.editor.setModelMarkers() to add squiggly underlines at issue locations
- Use editor.deltaDecorations() for colored line highlights
- Register a hover provider that shows issue details when hovering over marked code
- Add code lens actions for "Fix" above each issue line

Step 4 — Implement the fix flow:
- Click "Fix" → Call POST /api/v1/ai/review/fix to generate fix
- Show diff preview (DiffViewer)
- Apply → update editor content, record decision, remove annotation
- Dismiss → increment dismiss count, hide issue
- After 3 dismissals of same pattern → add to exclusion list

Step 5 — Add auto-review toggle:
- Settings option: "Auto-review on file save"
- When enabled, trigger review 2 seconds after file save (debounced)

Step 6 — Add keyboard shortcut:
- Ctrl+Shift+R triggers code review

OUTPUT: Complete code review system with inline Monaco annotations, severity categories, one-click fixes, and dismiss tracking.
```

---

## Prompt 9: Code Health Dashboard

```
ROLE: You are building the Code Health Dashboard for CodeNexus. This feature calculates and displays real-time code quality metrics including complexity, duplication, documentation coverage, and more.

CONTEXT:
- The dashboard shows a composite health score (0-100) based on 6 weighted metrics
- Metrics: complexity (25%), duplication (15%), test coverage estimate (20%), documentation (15%), dependency freshness (10%), dead code (15%)
- The dashboard shows trend charts, hot spots, and AI recommendations
- Score recalculates on every file save (debounced)
- Health snapshots are stored in MongoDB for trend tracking

EXISTING CODE: Full editor, AI features, Decision Memory, and Code Review exist.

TASK: Build the complete Code Health Dashboard. Execute these steps:

Step 1 — Build the health backend:
- Create server/src/models/HealthSnapshot.js from Backend Schema Document (Section 2.6)
- Create server/src/services/HealthCalculator.js: Calculate each metric:
  - Complexity: Use AST to calculate cyclomatic complexity per function, average across project
  - Duplication: Compare code blocks across files for near-duplicate detection
  - Coverage: Estimate by checking if test files exist for source files
  - Documentation: Count functions with JSDoc comments vs total functions
  - Dependencies: Parse package.json, check for known issues
  - Dead code: Find exported symbols that are never imported
- Create server/src/utils/codeMetrics.js: Individual metric calculators
- Add endpoints: GET /api/v1/projects/:id/health, GET /api/v1/projects/:id/health/history, POST /api/v1/projects/:id/health/analyze

Step 2 — Build the dashboard frontend:
- Create client/src/components/health/HealthDashboard.jsx: Main dashboard with:
  - Overall score display (large number with color, animated counter 0 → score)
  - Score progress bar (gradient colored)
  - 6 metric breakdown bars (horizontal bars with labels and scores)
  - Trend sparkline chart (last 7 snapshots)
  - Hot spots list (clickable file names)
  - AI recommendations section
- Create client/src/components/health/HealthScoreCard.jsx: Animated score counter with color coding: 0-30 red, 31-50 orange, 51-70 amber, 71-85 green, 86-100 cyan
- Create client/src/components/health/MetricChart.jsx: Individual metric display with horizontal bar, label, score, and details on expand. Use D3.js or CSS for the bar charts.
- Create client/src/components/health/HotspotList.jsx: Ranked list of problematic files. Click → navigate to file in editor.

Step 3 — Implement auto-refresh:
- After file save (debounced 3 seconds), recalculate health score
- Update the status bar health indicator in real-time

Step 4 — Add keyboard shortcut:
- Ctrl+Shift+H opens the Health Dashboard panel

OUTPUT: Complete Code Health Dashboard with animated scores, metric breakdowns, trend charts, hot spots, and AI recommendations.
```

---

## Prompt 10: Authentication, Dashboard & Project Management

```
ROLE: You are building the authentication system and project management dashboard for CodeNexus. This includes user registration, login, JWT-based auth, and a project listing dashboard.

CONTEXT:
- Authentication uses JWT (access token 1h + refresh token 7d)
- Passwords hashed with bcrypt (12 rounds)
- Protected routes require valid JWT in Authorization header
- Dashboard shows project cards with name, last edited, file count, health score
- Users can create, open, and delete projects
- Settings page for user preferences and AI configuration

EXISTING CODE: All editor features and AI features are complete. User and Project models are defined.

TASK: Build the complete authentication and project management system. Execute these steps:

Step 1 — Build the auth backend:
- Create server/src/models/User.js from Backend Schema Document (Section 2.1)
- Create server/src/routes/auth.routes.js: POST /register, POST /login, POST /refresh, POST /logout, GET /me
- Create server/src/controllers/auth.controller.js: Full auth flow
- Create server/src/middleware/auth.middleware.js: JWT verification middleware
- Password validation: min 8 chars, 1 uppercase, 1 number, 1 special character

Step 2 — Build the auth frontend:
- Create client/src/pages/LoginPage.jsx: Clean, dark login form with email + password fields, submit button, link to register. Centered on page with subtle gradient background.
- Create client/src/pages/RegisterPage.jsx: Registration form with full name, email, password, confirm password. Validation messages inline.
- Create client/src/services/authService.js: API calls for register, login, logout, getMe
- Create a ProtectedRoute component that redirects to login if no valid token

Step 3 — Build the project dashboard:
- Create client/src/pages/DashboardPage.jsx: Grid of project cards + "New Project" card
- Create client/src/components/dashboard/ProjectCard.jsx: Card showing project name, description, last edited time, file count, health score badge. Actions: Open, Settings, Delete.
- Create client/src/components/dashboard/NewProjectModal.jsx: Modal with project name, description, template selector (Blank, React App, Express API, Full Stack)

Step 4 — Build the settings page:
- Create client/src/pages/SettingsPage.jsx (or modal): Editor settings (theme, font size, tab size, word wrap, minimap, auto-save), AI settings (provider, model, API key, temperature), Account settings (name, email, password change)

Step 5 — Set up React Router:
- / → Landing or redirect to dashboard
- /login → LoginPage
- /register → RegisterPage
- /dashboard → DashboardPage (protected)
- /editor/:projectId → Editor workspace (protected)
- /settings → SettingsPage (protected)

OUTPUT: Complete auth system with protected routes, project CRUD, and settings management. Users should be able to register, login, create projects, and configure their preferences.
```

---

## Prompt 11: Landing Page & Polish

```
ROLE: You are a frontend designer and developer creating the landing page and adding final polish to CodeNexus. The landing page must be stunning, modern, and communicate the product's value instantly.

CONTEXT:
- CodeNexus is an AI-powered code editor with unique features: Intent Mode, Explain My Code, Decision Memory
- The landing page should use dark aesthetics, gradient backgrounds, glassmorphism cards, and smooth scroll animations
- Use Framer Motion for page animations
- The design should feel premium, like Linear or Vercel's landing pages
- Fonts: Inter for text, JetBrains Mono for code snippets

TASK: Build the landing page and add final polish. Execute these steps:

Step 1 — Create the landing page:
- Hero section: Large heading "The AI Code Editor That Thinks With You", subheading explaining the value prop, CTA button "Get Started — It's Free", secondary button "Watch Demo". Background: dark with subtle animated gradient mesh (CSS animation). Optional: floating code snippet animation.
- Features section: Three feature cards (Intent Mode, Explain My Code, Decision Memory) with icons, titles, descriptions. Cards use glassmorphism (semi-transparent with blur). Staggered fade-in on scroll.
- How It Works section: 3-step horizontal flow with icons and descriptions
- Testimonial/Stats section: Key metrics or taglines
- CTA section: Gradient background (indigo → violet), "Start building smarter", large CTA button
- Footer: Logo, links, copyright

Step 2 — Add scroll animations:
- Use Framer Motion's useInView hook for scroll-triggered animations
- Hero elements: fade up with stagger (200ms between each)
- Feature cards: slide up from 40px below, stagger 100ms
- Stats: count-up animation from 0 to target number

Step 3 — Add global polish:
- Loading screen: Brief logo animation on initial page load (1s)
- Page transitions: Smooth route transitions with Framer Motion
- Toast notification system (if not already built)
- Keyboard shortcut help dialog (F1 or ?)
- Empty states for all panels (illustrated, helpful)

Step 4 — Responsive adjustments:
- Ensure landing page looks good on all screen sizes (down to 375px mobile)
- Editor workspace: show "Desktop required" message below 1024px

OUTPUT: Complete landing page with animations and all polish items. The landing page should WOW visitors within the first 3 seconds.
```

---

## Prompt 12: Terminal Integration & Regex Playground

```
ROLE: You are building the Terminal Integration and Regex Playground features for CodeNexus.

CONTEXT:
- Terminal uses @xterm/xterm for terminal emulation in the browser
- In v1, the terminal runs a simulated shell (no actual OS access from browser)
- AI can suggest terminal commands based on context
- Error output in terminal triggers AI fix suggestions
- Regex Playground provides live regex testing with AI explanations

TASK: Build both features. Execute these steps:

Step 1 — Terminal Integration:
- Install: @xterm/xterm @xterm/addon-fit @xterm/addon-web-links
- Create client/src/components/terminal/TerminalPanel.jsx: xterm.js terminal in the bottom panel
- Create client/src/components/terminal/TerminalTabs.jsx: Support for multiple terminal sessions [Terminal 1] [Terminal 2] [+]
- Implement basic command simulation: echo, ls (list project files), cat (show file content), clear, help
- AI command suggestions: when user pauses typing, show ghost text suggestion
- Error detection: when output contains "Error" or "failed", show AI fix suggestion inline
- Keyboard shortcut: Ctrl+` toggles terminal

Step 2 — Regex Playground:
- Create client/src/components/regex/RegexPlayground.jsx: Split view with:
  - Top: regex input field with flags (g, i, m, s) toggles
  - Middle: test string input (multi-line textarea)
  - Bottom: results — highlighted matches with group colors
- AI integration: "Explain this regex" button calls AI to explain in plain English
- AI generation: "Generate from description" — user describes what they want, AI generates regex
- Pattern library: save and recall frequently used patterns

OUTPUT: Working terminal with simulated commands and AI suggestions, plus a fully functional regex playground with AI features.
```

---

> **End of Core Feature Prompts (1–12)**  
> Each prompt above is self-contained and can be used independently with Claude Opus 4.6 or any advanced AI coding model. Feed them in order (Prompt 1 → 12) for a complete build, or use them individually to add specific features.

---
---

# Part 2: Claude Code Agent Infrastructure Prompts

> **These prompts (13–18) set up the Claude Code agent infrastructure** — CLAUDE.md, Skills, Hooks, Sub-Agents, and the multi-agent orchestration layer. Run these BEFORE the feature prompts (1–12) to maximize your development speed. These create the "operating system" that makes prompts 1–12 execute 5–10x faster.

---

## Prompt 13: CLAUDE.md — Project Memory Setup

```
ROLE: You are a Claude Code configuration specialist setting up the project memory file for CodeNexus — an AI-powered code editor built with React, Monaco Editor, Node.js, and MongoDB.

CONTEXT:
- CLAUDE.md is loaded at the start of every Claude Code session
- It tells Claude the project's tech stack, architecture, conventions, and rules
- It should be concise (under 300 lines) but comprehensive enough to prevent mistakes
- It follows the WHAT-WHY-HOW structure: what the project is, why decisions were made, how to work in it
- It references external documentation using @path/to/file syntax for progressive disclosure
- The project has 6 reference docs in docs/ (PRD, TRD, App Flow, UI/UX, Backend Schema, Implementation Plan)

TASK: Create the complete Claude Code configuration directory and CLAUDE.md file. Execute these steps:

Step 1 — Create the .claude/ directory structure:
```
.claude/
├── CLAUDE.md              # Shared project memory (committed to Git)
├── CLAUDE.local.md        # Personal overrides (add to .gitignore)
├── settings.json          # Hooks and tool permissions
├── skills/                # Reusable workflow definitions
└── agents/                # Sub-agent role definitions
```

Step 2 — Create .claude/CLAUDE.md with these sections:

A. **Project Overview** (3-5 lines):
   - "CodeNexus is a browser-based AI-powered code editor with real problem-solving features."
   - Key differentiators: Intent Mode, Explain My Code, Decision Memory
   - "This is NOT a Copilot clone — it focuses on understanding intent, visualizing code, and learning from decisions."

B. **Tech Stack** (bullet list):
   - Frontend: React 18 + Vite 5 + Zustand 4 + Monaco Editor + React Flow 11
   - Backend: Node.js 20 + Express 4 + MongoDB 7 (Mongoose 8) + Socket.IO 4
   - AI: OpenAI GPT-4o via openai npm package (provider-agnostic abstraction)
   - Visualization: React Flow + D3.js + dagre layout
   - Styling: Vanilla CSS with CSS variables (NOT Tailwind)

C. **Architecture** (5-7 lines):
   - Monorepo: client/ + server/ + shared/
   - State: Zustand stores in client/src/stores/
   - AI: All calls go through backend AIService abstraction
   - Prompts: Template functions in server/src/prompts/
   - Database: MongoDB with Mongoose models in server/src/models/

D. **Key Design Decisions — DO NOT OVERRIDE** (numbered list):
   1. Zustand, NOT Redux or Context API
   2. Vanilla CSS with variables, NOT Tailwind
   3. Mongoose ODM, NOT raw driver or Prisma
   4. SSE for AI streaming, Socket.IO for real-time
   5. JWT with httpOnly cookies, NOT localStorage
   6. Joi/Zod validation, NOT manual checks

E. **Coding Conventions** (bullet list):
   - ES Modules (import/export), async/await
   - Functional React components with hooks
   - camelCase variables, PascalCase components
   - 2-space indentation, single quotes, trailing commas
   - Every hook starts with "use" prefix
   - Every store ends with "Store"

F. **File Naming Conventions** (bullet list):
   - Components: PascalCase.jsx
   - Hooks: useFeature.js
   - Stores: featureStore.js
   - Services: featureService.js
   - Routes: feature.routes.js
   - Controllers: feature.controller.js
   - Models: PascalCase.js

G. **API Conventions** (bullet list):
   - All routes: /api/v1/...
   - Response: { success: true, data: {...} }
   - Error: { success: false, error: { code, message, details } }

H. **Commands** (code block):
   - npm run dev (both)
   - npm test
   - npm run lint

I. **Reference Documentation** (using @path syntax):
   - @docs/01_PRD.md through @docs/06_Implementation_Plan.md

J. **Critical Rules** (numbered, UPPERCASE warnings):
   - NEVER expose API keys in client code
   - ALWAYS validate request bodies server-side
   - ALWAYS include loading and error states in UI
   - ALWAYS record AI suggestions in Decision Memory

Step 3 — Create .claude/CLAUDE.local.md with personal preferences (template).

Step 4 — Add CLAUDE.local.md to .gitignore.

OUTPUT: All files with complete content. The CLAUDE.md should be under 200 lines — concise but comprehensive.
```

---

## Prompt 14: Skills — Reusable Workflow Definitions

```
ROLE: You are a Claude Code skills architect creating reusable workflow definitions (SKILL.md files) for the CodeNexus project. Skills are invoked via slash commands (/skill-name) and automate multi-step development tasks.

CONTEXT:
- Skills are stored in .claude/skills/{skill-name}/SKILL.md
- Each SKILL.md has YAML frontmatter (name, description, user-invocable) followed by markdown instructions
- Skills should follow the project conventions defined in CLAUDE.md
- Skills reference documentation in docs/ and existing code patterns
- The goal is to make every repeated task a one-command operation
- Skills should produce consistent, high-quality output every time

TASK: Create 10 production-ready skills for CodeNexus. Each skill should be a complete SKILL.md file in its own directory under .claude/skills/. Execute these steps:

Step 1 — Create /build-component skill:
- Path: .claude/skills/build-component/SKILL.md
- Purpose: Creates a React component with CSS, test, and store integration
- Input: Component name, feature area, purpose description
- Steps: Create .jsx file with functional component, create/update CSS file with CSS variables, create test file with happy/edge/error cases, update parent component
- Rules: Use Zustand (not Context), vanilla CSS (not Tailwind), Lucide icons, include loading/error/empty states, keyboard accessible

Step 2 — Create /create-api-route skill:
- Path: .claude/skills/create-api-route/SKILL.md
- Purpose: Creates a complete Express route with controller, service, validation, and test
- Input: Route path, HTTP method, purpose
- Steps: Create route file, controller (thin — delegates to service), service (business logic), Joi validation schema, integration test with supertest, frontend service method
- Rules: auth middleware on protected routes, consistent response format, rate limiting on AI endpoints

Step 3 — Create /add-ai-feature skill:
- Path: .claude/skills/add-ai-feature/SKILL.md
- Purpose: Creates a full AI-powered feature pipeline (prompt → API → streaming → frontend)
- Input: Feature name, context requirements, output format
- Steps: Create prompt template (JSON output, include Decision Memory context), create/update AI controller endpoint, add SSE streaming, create React hook for consuming stream, create UI component, integrate with Decision Memory
- Rules: All AI calls through backend, SSE streaming, include decision history in prompts, handle loading/streaming/error states

Step 4 — Create /create-zustand-store skill:
- Path: .claude/skills/create-zustand-store/SKILL.md
- Purpose: Creates a Zustand store with proper patterns
- Input: Store name, state shape, actions needed
- Steps: Create store with create(), add state and actions, create unit test, document selector patterns
- Rules: One store per domain, always include isLoading/error, use selectors (not full destructuring)

Step 5 — Create /add-mongoose-model skill:
- Path: .claude/skills/add-mongoose-model/SKILL.md
- Purpose: Creates a Mongoose model with schema, indexes, virtuals, and transforms
- Input: Model name, fields, relationships
- Steps: Create model with schema, add indexes (query fields, compound, text), add pre-save hooks, add toJSON transform (exclude sensitive fields), create seed data function
- Rules: Always timestamps, select: false for sensitive fields, reference Backend Schema Doc

Step 6 — Create /create-prompt-template skill:
- Path: .claude/skills/create-prompt-template/SKILL.md
- Purpose: Creates an AI prompt template function for the prompts/ directory
- Input: Feature name, AI specialty, required context, output format
- Steps: Create template function (system prompt + user prompt), add token budget management, include Decision Memory context slots, request JSON output
- Rules: Keep static content under 4000 tokens, always include decisions + rules in context, always request JSON

Step 7 — Create /build-visualization skill:
- Path: .claude/skills/build-visualization/SKILL.md
- Purpose: Creates an interactive React Flow graph visualization
- Input: Visualization type (dependency, call-graph, component-tree, data-flow)
- Steps: Create custom node component (120×48px, icon + label, hover glow), create custom edge component (animated dashes), create graph component (React Flow + dagre layout + controls), create backend graph generator (AST parser → graph builder), add PNG/SVG export
- Rules: Use React Flow (not vis.js), dagre layout, clickable nodes navigate to source, dot grid background

Step 8 — Create /write-tests skill:
- Path: .claude/skills/write-tests/SKILL.md
- Purpose: Generates comprehensive tests for any source file
- Input: File path or test type
- Steps: Read source file, determine test type (.jsx → component, Store → unit, .controller → integration), create test with describe/it blocks, include happy path + edge case + error case, run tests to verify
- Rules: Use Vitest (not Jest), mock externals, test behavior not implementation

Step 9 — Create /run-full-review skill:
- Path: .claude/skills/run-full-review/SKILL.md
- Purpose: Quality gate — comprehensive project review
- Steps: Run lint, run tests, check for console.log, check for TODO/FIXME, check for hardcoded values, verify error handling, verify loading states, report findings with severity
- This skill should be run at the end of every phase as a checkpoint

Step 10 — Create /deploy-check skill:
- Path: .claude/skills/deploy-check/SKILL.md
- Purpose: Pre-deployment verification
- Steps: Build client (npm run build), verify no .env references in client bundle, run full test suite, check for known vulnerabilities (npm audit), verify all environment variables documented, generate build report

OUTPUT: 10 complete SKILL.md files, each in its own directory under .claude/skills/. Every skill should have proper YAML frontmatter and detailed, step-by-step instructions.
```

---

## Prompt 15: Hooks — Lifecycle Automation Configuration

```
ROLE: You are a DevOps engineer configuring Claude Code hooks for the CodeNexus project. Hooks are deterministic, event-driven scripts that run at specific lifecycle points to enforce rules, automate tasks, and maintain code quality.

CONTEXT:
- Hooks are configured in .claude/settings.json
- Hook lifecycle events: PreToolUse (before tool runs, CAN BLOCK), PostToolUse (after tool succeeds), Notification (when Claude needs input), SessionStart (when session begins), UserPromptSubmit (before prompt is processed)
- Hooks receive event data via stdin (JSON) and communicate via exit codes: 0=success, 2=block, other=error
- Matchers filter which tool calls trigger hooks (e.g., "Bash", "Write|Edit", "" for all)
- The project runs on Windows (PowerShell) but hooks should be cross-platform where possible
- The project uses ESLint + Prettier for code quality

TASK: Create the complete hooks configuration for CodeNexus. Execute these steps:

Step 1 — Create .claude/settings.json with these hook categories:

A. **Security Gates (PreToolUse)**:
   1. Block destructive Bash commands: Matcher "Bash"
      - Check if command contains: rm -rf, drop database, format, shutdown, del /s
      - If matched: echo error message to stderr, exit 2 (block)
   2. Protect sensitive files: Matcher "Write|Edit"
      - Block writes to: .env, .env.local, .env.production
      - Redirect to .env.example instead
      - If matched: echo "Use .env.example instead" to stderr, exit 2
   3. Prevent client-side API key exposure: Matcher "Write|Edit"
      - If file_path contains "client/src" AND content contains API key patterns (sk-, AIza)
      - Block with message: "API keys must not be in client code"

B. **Auto-Quality (PostToolUse)**:
   1. Auto-format with Prettier: Matcher "Write|Edit"
      - After any file write/edit, run Prettier on the file
      - Only for: .js, .jsx, .ts, .tsx, .css, .json, .md extensions
      - Command: npx prettier --write "$file_path"
   2. Auto-lint with ESLint: Matcher "Write|Edit"
      - After JS/JSX file write, run ESLint with --fix
      - Only for: .js, .jsx extensions
      - Command: npx eslint "$file_path" --fix --quiet
   3. Auto-run model tests: Matcher "Write|Edit"
      - If file_path matches server/src/models/*.js
      - Run: cd server && npx vitest run tests/unit/models/
      - Show last 5 lines of output

C. **Developer Notifications (Notification)**:
   1. Windows notification popup when Claude needs attention
      - Use PowerShell's MessageBox or toast notification
      - Show: "Claude Code needs your attention — CodeNexus Dev"

D. **Session Initialization (SessionStart)**:
   1. Log session start timestamp
   2. Check if MongoDB is running (optional — warn if not)
   3. Verify node_modules exists (warn to run npm install if missing)

Step 2 — Document each hook with inline comments explaining purpose and behavior.

Step 3 — Create a helper script at scripts/hook-helpers.sh (or .ps1 for Windows) with reusable functions for:
- Extracting file_path from tool input JSON
- Checking file extensions
- Running conditional commands based on file location

Step 4 — Verify the configuration is valid JSON and all commands are cross-platform compatible (with Windows PowerShell fallbacks where needed).

OUTPUT: Complete .claude/settings.json with all hooks configured. Include the helper script. Every hook should have a clear statusMessage for the developer to see in the terminal.
```

---

## Prompt 16: Sub-Agent Definitions — Specialized AI Workers

```
ROLE: You are an AI orchestration architect defining specialized sub-agents for the CodeNexus project. Sub-agents are focused AI workers that the lead agent spawns for isolated, parallel tasks. Each agent has its own context window, role definition, and constraints.

CONTEXT:
- Sub-agents are defined as markdown files in .claude/agents/
- Each agent has: role, expertise, constraints, file access scope, and reference docs
- Agents work in isolation — they cannot see each other's work
- The lead agent (orchestrator) spawns agents, collects results, and integrates
- For true parallelism, use git worktrees to give each agent its own checkout
- Agent definitions should prevent scope creep and file conflicts

TASK: Create 6 specialized sub-agent definitions for CodeNexus. Execute these steps:

Step 1 — Create .claude/agents/frontend-agent.md:
- Role: Senior React developer for IDE-like web applications
- Scope: ONLY works in client/ directory
- Expertise: React 18, Zustand, Monaco Editor, React Flow, Framer Motion, vanilla CSS
- Constraints: Never modify server code, use CSS variables from index.css, use Zustand stores, Lucide icons, handle loading/error/empty states
- References: UI/UX Design Brief, component patterns in client/src/components/

Step 2 — Create .claude/agents/backend-agent.md:
- Role: Senior Node.js developer for Express.js APIs
- Scope: ONLY works in server/ directory
- Expertise: Express 4, Mongoose 8, JWT auth, Socket.IO, OpenAI SDK, Joi validation
- Constraints: Never modify client code, all routes have validation, controllers are thin (delegate to services), consistent response format
- References: Backend Schema Doc, TRD API section

Step 3 — Create .claude/agents/ai-integration-agent.md:
- Role: Prompt engineer and AI integration specialist
- Scope: Works in server/src/prompts/ and server/src/services/ai/
- Expertise: OpenAI API, prompt engineering, token management, streaming, provider abstraction
- Constraints: JSON output for structured data, include Decision Memory in all prompts, handle rate limits and timeouts, implement fallback models
- References: Prompt files, AIService abstraction

Step 4 — Create .claude/agents/visualization-agent.md:
- Role: Data visualization specialist for code analysis graphs
- Scope: Works in client/src/components/visualize/ and server/src/services/GraphGenerator.js
- Expertise: React Flow 11, dagre layout, D3.js, @babel/parser, graph algorithms
- Constraints: Use React Flow (not vis.js), dagre for layout, clickable nodes, dot grid background, PNG/SVG export
- References: UI/UX Design Brief Section 5.8

Step 5 — Create .claude/agents/testing-agent.md:
- Role: QA engineer for comprehensive testing
- Scope: Works in client/tests/ and server/tests/ directories
- Expertise: Vitest, @testing-library/react, Supertest, Playwright
- Constraints: Use Vitest (not Jest), tests in tests/ directories, mock externals, happy + edge + error cases, run tests after writing
- References: Testing strategy in TRD

Step 6 — Create .claude/agents/security-agent.md:
- Role: Security auditor reviewing for vulnerabilities
- Scope: Read-only access to entire codebase (does not modify files)
- Focus: API key exposure, injection, XSS, JWT issues, rate limiting, input validation, npm audit
- Output: Report with CRITICAL / WARNING / INFO severity levels
- References: Security section in TRD

Step 7 — Document the orchestration patterns for using these agents:
- Pattern 1: Parallel Frontend + Backend (spawn both, lead integrates)
- Pattern 2: Research → Plan → Execute (research agent first, then build)
- Pattern 3: Build → Test → Review (build, then test agent, then security agent)
- Pattern 4: Git Worktree Parallelism (each agent gets own filesystem)

OUTPUT: 6 complete agent definition files in .claude/agents/ plus a README.md explaining how to use them with orchestration patterns.
```

---

## Prompt 17: Multi-Agent Orchestration Workflow

```
ROLE: You are the lead orchestrator building CodeNexus using Claude Code's multi-agent capabilities. Your job is to plan the optimal agent deployment strategy for each development phase and execute it.

CONTEXT:
- You have 6 sub-agents defined: Frontend, Backend, AI Integration, Visualization, Testing, Security
- You have 10 skills: /build-component, /create-api-route, /add-ai-feature, /create-zustand-store, /add-mongoose-model, /create-prompt-template, /build-visualization, /write-tests, /run-full-review, /deploy-check
- You have hooks for: auto-formatting, auto-linting, security gates, notifications
- The project has 5 development phases (see Implementation Plan)
- Each feature should be built with the optimal combination of agents and skills

TASK: Execute the multi-agent build workflow for each phase. Follow these orchestration rules:

PHASE 1 — Foundation (Single Agent):
- This phase is sequential — use the lead agent directly
- Set up project infrastructure, install dependencies, create folder structure
- Create CLAUDE.md, skills, hooks, and agent definitions
- No sub-agents needed — the lead handles everything

PHASE 2 — AI Core Features (Multi-Agent):
For each feature (Intent Mode, Explain My Code, Chat):
1. Spawn AI Integration Agent:
   - "Create the prompt template and AI service methods for [feature]"
   - References: @docs/05_Backend_Schema.md, @server/src/services/ai/AIService.js
2. Spawn Backend Agent:
   - "Create the API endpoint, controller, and service for [feature]"
   - References: @docs/02_TRD.md Section 4.2
3. Spawn Frontend Agent:
   - "Create the UI components for [feature] following the design brief"
   - References: @docs/04_UI_UX_Design_Brief.md
4. Lead Agent: Wait for all three → Wire frontend to backend → Test end-to-end

PHASE 3 — Intelligence Layer (Multi-Agent):
For Decision Memory, Code Review, Health Dashboard:
1. Same 3-agent pattern as Phase 2
2. ADDITIONALLY: After building Decision Memory, update ALL existing AI prompts to include decision history context
3. Spawn Testing Agent after each feature: "Write tests for [all new files]"

PHASE 4 — Power Features (Pair Agents):
For Terminal, Scaffolding, Regex, Auth:
1. Spawn 2 agents per feature (Frontend + Backend)
2. Spawn Security Agent for Auth review

PHASE 5 — Polish & Launch:
1. Spawn Testing Agent: "Write E2E tests for critical user flows"
2. Spawn Security Agent: "Full security audit of the codebase"
3. Lead Agent: Performance optimization, accessibility audit, documentation
4. Run /deploy-check skill

EXECUTION RULES:
- Always check CLAUDE.md before starting work
- Use skills for repetitive tasks (don't re-explain patterns)
- Run /run-full-review after completing each feature
- Record significant decisions in docs/architecture-decisions/
- If an agent encounters an error, the lead should investigate before retrying
- Keep agent scopes strictly separated to prevent file conflicts

OUTPUT: For each phase, output:
1. The exact prompts to give each sub-agent
2. The skills to invoke
3. The integration steps the lead agent performs
4. The verification checklist
```

---

## Prompt 18: CLAUDE.md + Skills + Hooks + Agents — Complete Setup Script

```
ROLE: You are a DevOps automation specialist creating a one-shot setup script that initializes the entire Claude Code agent infrastructure for CodeNexus.

CONTEXT:
- This script creates ALL Claude Code configuration files in a single execution
- It sets up: CLAUDE.md, 10 skills, hooks in settings.json, 6 agent definitions
- After running this script, a developer can immediately start using /slash-commands and spawning sub-agents
- The script should be idempotent (safe to run multiple times)
- Target: Windows (PowerShell) with cross-platform notes

TASK: Create a comprehensive setup script. Execute these steps:

Step 1 — Create the directory structure:
```
.claude/
├── CLAUDE.md
├── CLAUDE.local.md
├── settings.json
├── skills/
│   ├── build-component/SKILL.md
│   ├── create-api-route/SKILL.md
│   ├── add-ai-feature/SKILL.md
│   ├── create-zustand-store/SKILL.md
│   ├── add-mongoose-model/SKILL.md
│   ├── create-prompt-template/SKILL.md
│   ├── build-visualization/SKILL.md
│   ├── write-tests/SKILL.md
│   ├── run-full-review/SKILL.md
│   └── deploy-check/SKILL.md
└── agents/
    ├── frontend-agent.md
    ├── backend-agent.md
    ├── ai-integration-agent.md
    ├── visualization-agent.md
    ├── testing-agent.md
    ├── security-agent.md
    └── README.md
```

Step 2 — Write EVERY file with COMPLETE content (no placeholders):
- CLAUDE.md: Full project memory (under 200 lines)
- Each SKILL.md: Complete with YAML frontmatter + detailed instructions
- settings.json: All hooks (PreToolUse security, PostToolUse formatting, Notifications)
- Each agent .md: Full role + scope + expertise + constraints + references
- agents/README.md: Orchestration patterns and usage guide

Step 3 — Update .gitignore to include:
- .claude/CLAUDE.local.md

Step 4 — Create a verification checklist:
- [ ] CLAUDE.md loads on session start
- [ ] /build-component skill is invocable
- [ ] /create-api-route skill is invocable
- [ ] PostToolUse hooks run Prettier after file edits
- [ ] PreToolUse hooks block destructive commands
- [ ] Agent definitions are readable

Step 5 — Create a README section in the project README.md explaining:
- How to use Claude Code with this project
- Available slash commands
- How to spawn sub-agents
- Hook behavior

OUTPUT: A complete Node.js script (scripts/setup-claude-agents.js) that creates ALL the above files when run with `node scripts/setup-claude-agents.js`. Also output each file individually for manual creation if preferred.
```

---

> **End of All Feature Master Prompts (1–18)**  
> 
> **Prompts 1–12:** Build each feature of CodeNexus (editor, AI, visualization, etc.)  
> **Prompts 13–18:** Set up the Claude Code agent infrastructure (CLAUDE.md, Skills, Hooks, Sub-Agents)  
> 
> **Recommended execution order:**
> 1. Run Prompt 18 first (complete agent infrastructure setup)
> 2. Run Prompt 13 to verify CLAUDE.md is correct
> 3. Run Prompts 1–12 in order, using skills and sub-agents for speed
> 4. Run /run-full-review after each phase
> 5. Run /deploy-check before launch
