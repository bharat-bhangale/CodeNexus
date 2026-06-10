# CodeNexus — AI-Powered Code Editor

## Project Overview
CodeNexus is a browser-based AI-powered code editor with real problem-solving features.
It is NOT a Copilot clone. It focuses on intent-based refactoring, visual code explanation,
and persistent decision memory that makes the AI smarter over time.

Key differentiators: Intent Mode, Explain My Code (visual), Decision Memory.

## Tech Stack
- **Frontend:** React 18 + Vite 5 + Zustand 4 (state) + Monaco Editor
- **Backend:** Node.js 20 + Express 4 + MongoDB 7 (Mongoose 8) + Socket.IO 4
- **AI:** OpenAI GPT-4o via `openai` npm package (provider-agnostic abstraction)
- **Visualization:** React Flow 11 + D3.js 7 + dagre (layout)
- **Terminal:** @xterm/xterm 5
- **Styling:** Vanilla CSS with CSS variables (NO Tailwind)
- **Testing:** Vitest + @testing-library/react + Supertest

## Architecture
- Monorepo: `client/` (React) + `server/` (Express) + `shared/` (constants)
- State management: Zustand stores in `client/src/stores/`
- AI calls ALWAYS go through the backend — NEVER expose API keys to the client
- All AI providers implement the same interface via `server/src/services/ai/AIService.js`
- Prompts are template functions in `server/src/prompts/`
- Database: MongoDB with Mongoose models in `server/src/models/`

## Key Design Decisions (DO NOT OVERRIDE)
1. Use Zustand, NOT Redux or Context API for global state
2. Use vanilla CSS with CSS variables, NOT Tailwind or CSS-in-JS
3. Use Mongoose ODM, NOT raw MongoDB driver or Prisma
4. Use SSE for AI streaming, WebSocket via Socket.IO for real-time collab
5. JWT auth with httpOnly cookies, NOT localStorage
6. Use Joi or Zod for request validation, NOT manual checks
7. Use Lucide React for icons, NOT FontAwesome or Material Icons

## Coding Conventions
- ES Modules (`import`/`export`), NOT CommonJS (`require`)
- Functional React components with hooks, NEVER class components
- `async`/`await`, NEVER `.then()` chains
- camelCase for variables and functions, PascalCase for components and models
- 2-space indentation, single quotes, trailing commas
- Every component file exports a single default component
- Custom hooks start with `use` prefix (e.g., `useAI`, `useEditor`)
- Zustand stores use the `create` function from `zustand`

## File Naming
- React components: `PascalCase.jsx` (e.g., `ChatPanel.jsx`)
- Hooks: `camelCase.js` starting with `use` (e.g., `useAI.js`)
- Stores: `camelCase` ending with `Store` (e.g., `aiStore.js`)
- Services: `camelCase` ending with `Service` (e.g., `aiService.js`)
- CSS: kebab-case or feature name (e.g., `chat.css`, `visualize.css`)
- Backend routes: `kebab-case.routes.js` (e.g., `ai.routes.js`)
- Backend controllers: `kebab-case.controller.js`
- Backend models: `PascalCase.js` (e.g., `Decision.js`)

## API Conventions
- All API routes start with `/api/v1/`
- RESTful naming: `GET /projects`, `POST /projects`, `GET /projects/:id`
- Success response: `{ success: true, data: {...} }`
- Error response: `{ success: false, error: { code, message, details } }`
- All protected routes use auth middleware
- Rate limiting on AI endpoints

## Error Handling
- All async controller handlers wrapped in try-catch
- Centralized error handler middleware at `server/src/middleware/errorHandler.middleware.js`
- Frontend: every component that fetches data must handle loading, error, and empty states
- Never swallow errors silently — always log or display

## Commands
```bash
npm run dev       # Start both client (5173) and server (3001)
npm test          # Run all tests
npm run lint      # Lint entire project
npm run build     # Production build
```

## Reference Documentation
- Product Requirements: @docs/01_PRD.md
- Technical Requirements: @docs/02_TRD.md
- App Flow: @docs/03_App_Flow.md
- UI/UX Design: @docs/04_UI_UX_Design_Brief.md
- Backend Schema: @docs/05_Backend_Schema.md
- Implementation Plan: @docs/06_Implementation_Plan.md
- Feature Prompts: @docs/07_Feature_Master_Prompts.md
- Multi-Agent Guide: @docs/08_Claude_Multi_Agent_Guide.md

## Critical Rules
1. NEVER put API keys in client-side code
2. NEVER skip error handling — every async call needs try-catch
3. ALWAYS validate request bodies on the server with Joi/Zod
4. ALWAYS include loading and error states in UI components
5. ALWAYS record accepted AI suggestions in Decision Memory
6. NEVER delete or modify existing tests without explanation
7. When creating a new feature, create BOTH frontend and backend in a single session
8. Run `npm run lint` before considering any task complete
9. Use semantic HTML elements and include aria-labels for accessibility
10. Every interactive element needs a unique ID for testing
