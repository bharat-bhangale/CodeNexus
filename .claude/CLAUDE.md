# CodeNexus — AI-Powered Code Editor
<!-- Version: 1.0 | Last Updated: June 2026 -->

---

<!-- ═══════════════════════════════════════════════════════ -->
<!-- SECTION A: THE WHAT — Project Overview                 -->
<!-- ═══════════════════════════════════════════════════════ -->

## Project Overview

CodeNexus is a browser-based AI-powered code editor with real problem-solving features.
This is NOT a Copilot clone — it focuses on understanding intent, visualizing code, and
learning from decisions.

**Key differentiators:**
- **Intent Mode** — AI understands _what improvement you want_ (performance, security, readability) and transforms code accordingly
- **Explain My Code** — Interactive visual diagrams showing file dependencies, function call graphs, and data flow
- **Decision Memory** — AI remembers your past architectural decisions and coding preferences, getting smarter over time

---

<!-- ═══════════════════════════════════════════════════════ -->
<!-- SECTION B: Tech Stack                                  -->
<!-- ═══════════════════════════════════════════════════════ -->

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router) + TypeScript + Zustand 4 (state) + Monaco Editor |
| **Backend** | Node.js 20 + TypeScript + Express 4 + MongoDB 7 (Mongoose 8) + Socket.IO 4 |
| **AI** | OpenAI GPT-4o via `openai` npm package (provider-agnostic abstraction) |
| **Visualization** | React Flow 11 + D3.js 7 + dagre (layout engine) |
| **Terminal** | @xterm/xterm 5 |
| **Styling** | Vanilla CSS with CSS custom properties (**NOT** Tailwind) |
| **Testing** | Vitest + @testing-library/react + Supertest |
| **Icons** | Lucide React |

---

<!-- ═══════════════════════════════════════════════════════ -->
<!-- SECTION C: Architecture                                -->
<!-- ═══════════════════════════════════════════════════════ -->

## Architecture

- **Monorepo:** `client/` (Next.js + TS) + `server/` (Express + TS) + `shared/` (constants, types)
- **State management:** Zustand stores in `client/src/stores/` — one store per domain
- **AI calls ALWAYS go through the backend** — NEVER expose API keys to the client
- **AI provider abstraction:** All providers implement the same interface via `server/src/services/ai/AIService.ts`
- **Prompt templates:** Template functions in `server/src/prompts/` (return `{ system, user }` objects)
- **Database:** MongoDB with Mongoose ODM, models in `server/src/models/`
- **Real-time:** Socket.IO for collaboration, SSE for AI response streaming

---

<!-- ═══════════════════════════════════════════════════════ -->
<!-- THE WHY — Key Design Decisions                         -->
<!-- ═══════════════════════════════════════════════════════ -->

<rules>

## Key Design Decisions — DO NOT OVERRIDE

These decisions are intentional and battle-tested. Do not "fix" them:

1. **Zustand**, NOT Redux or Context API — simpler API, smaller bundle, better selector performance
2. **Vanilla CSS with custom properties**, NOT Tailwind or CSS-in-JS — full design control, no build dependency
3. **Mongoose ODM**, NOT raw MongoDB driver or Prisma — mature ecosystem, schema validation, middleware hooks
4. **SSE for AI streaming**, Socket.IO for real-time collab — SSE is simpler for one-way server→client AI responses
5. **JWT with httpOnly cookies**, NOT localStorage — XSS-resistant token storage
6. **Joi or Zod for validation**, NOT manual checks — declarative schemas, automatic error messages
7. **Lucide React for icons**, NOT FontAwesome or Material — tree-shakeable, consistent style, MIT license

</rules>

---

<!-- ═══════════════════════════════════════════════════════ -->
<!-- THE HOW — Rules of Engagement                          -->
<!-- ═══════════════════════════════════════════════════════ -->

## Coding Conventions

- TypeScript ES Modules (`import`/`export`)
- Functional React components with hooks — NEVER class components. Use `"use client"` directive for interactive components in Next.js.
- `async`/`await` — NEVER `.then()` chains
- camelCase for variables/functions, PascalCase for components/models
- 2-space indentation, single quotes, trailing commas
- Every component file exports a **single default component**
- Custom hooks always start with `use` (e.g., `useAI`, `useEditor`)
- Zustand stores always end with `Store` (e.g., `aiStore.ts`)

## File Naming Conventions

| Type | Pattern | Example |
|---|---|---|
| Components | `PascalCase.tsx` | `ChatPanel.tsx` |
| Hooks | `use{Feature}.ts` | `useAI.ts` |
| Stores | `{feature}Store.ts` | `aiStore.ts` |
| Services (client) | `{feature}Service.ts` | `aiService.ts` |
| CSS | `{feature}.css` | `chat.css` |
| Routes | `{feature}.routes.ts` | `ai.routes.ts` |
| Controllers | `{feature}.controller.ts` | `ai.controller.ts` |
| Models | `PascalCase.ts` | `Decision.ts` |

## API Conventions

- All routes: `/api/v1/{resource}`
- RESTful verbs: `GET /projects`, `POST /projects`, `GET /projects/:id`
- **Success:** `{ success: true, data: { ... } }`
- **Error:** `{ success: false, error: { code: "NOT_FOUND", message: "...", details: {} } }`
- All protected routes use `authenticate` middleware
- AI endpoints use `rateLimiter` middleware

## Error Handling

- All async controller handlers wrapped in `try-catch` with `next(error)`
- Centralized error handler: `server/src/middleware/errorHandler.middleware.ts`
- **Frontend rule:** Every component that fetches data MUST handle: loading, error, and empty states
- Never swallow errors silently — always log or display

## Commands

```bash
npm run dev       # Start both client (:3000) and server (:3001) using tsx
npm test          # Run all tests (Vitest)
npm run lint      # Lint entire project (ESLint)
npm run build     # Production build (client)
```

---

## Reference Documentation

> Use `@path` syntax to load these into context when needed.

- **Product Requirements:** @docs/01_PRD.md
- **Technical Requirements:** @docs/02_TRD.md
- **App Flow & Interactions:** @docs/03_App_Flow.md
- **UI/UX Design System:** @docs/04_UI_UX_Design_Brief.md
- **Database Schemas & API Contracts:** @docs/05_Backend_Schema.md
- **Phase-by-Phase Build Plan:** @docs/06_Implementation_Plan.md
- **AI Agent Prompts (1–18):** @docs/07_Feature_Master_Prompts.md
- **Claude Multi-Agent Guide:** @docs/08_Claude_Multi_Agent_Guide.md

---

<instructions>

## Critical Rules

> These rules are NON-NEGOTIABLE. Violating them is a blocking issue.

1. **NEVER** put API keys, tokens, or secrets in client-side code (`client/src/`)
2. **NEVER** skip error handling — every async call needs `try-catch`
3. **ALWAYS** validate request bodies on the server with Joi/Zod schemas
4. **ALWAYS** include loading, error, and empty states in UI components
5. **ALWAYS** record accepted AI suggestions in Decision Memory
6. **NEVER** delete or modify existing tests without documenting why
7. **ALWAYS** create BOTH frontend and backend when building a new feature
8. **ALWAYS** run `npm run lint` before considering any task complete
9. **ALWAYS** use semantic HTML elements and include `aria-label` on interactive elements
10. **ALWAYS** give every interactive element a unique `id` for testing

</instructions>
