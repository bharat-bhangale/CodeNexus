# UI/UX Design Brief
## CodeNexus — AI-Powered Code Editor

**Version:** 1.0  
**Date:** June 2026  

---

## 1. Design Philosophy

### 1.1 Core Principles

1. **Developer-First Aesthetics** — The interface must feel like a premium IDE, not a web app. Dark themes, monospaced fonts, and minimal visual noise.
2. **Progressive Disclosure** — Show essential features upfront, reveal advanced features contextually. Don't overwhelm new users.
3. **Zero-Friction AI** — AI features should be accessible within 1-2 clicks or keystrokes from any state. The AI should feel like a natural extension of the editor, not a bolted-on sidebar.
4. **Spatial Consistency** — Panels always appear in predictable locations. Users develop muscle memory for where things are.
5. **Feedback at Every Step** — Loading states, success confirmations, error messages, and progress indicators for every action.

### 1.2 Design Inspiration

Draw inspiration from:
- **VS Code** — Layout structure, file tree, tab management
- **Linear** — Clean, minimal UI with dark aesthetics
- **Raycast** — Command palette, keyboard-first interaction
- **Vercel Dashboard** — Modern glassmorphism, dark gradients
- **Figma** — Panel management, contextual toolbars

---

## 2. Color System

### 2.1 Dark Theme (Primary)

```css
:root {
  /* Background Layers (darkest to lightest) */
  --bg-base:           #0a0a0f;     /* App background */
  --bg-surface:        #12121a;     /* Panels, sidebars */
  --bg-elevated:       #1a1a2e;     /* Cards, dropdowns, modals */
  --bg-hover:          #252540;     /* Hover states */
  --bg-active:         #2d2d50;     /* Active/selected states */
  
  /* Editor Background */
  --editor-bg:         #0d0d14;     /* Monaco editor background */
  --editor-line-active: #1a1a2e;   /* Active line highlight */
  --editor-selection:  rgba(88, 101, 242, 0.25); /* Selection highlight */
  
  /* Text Colors */
  --text-primary:      #e4e4e7;     /* Primary text */
  --text-secondary:    #a1a1aa;     /* Secondary/muted text */
  --text-tertiary:     #71717a;     /* Placeholder, disabled text */
  --text-inverse:      #0a0a0f;     /* Text on light backgrounds */
  
  /* Brand / Accent Colors */
  --accent-primary:    #6366f1;     /* Indigo — primary actions */
  --accent-hover:      #818cf8;     /* Indigo lighter — hover state */
  --accent-glow:       rgba(99, 102, 241, 0.15); /* Glow effect */
  --accent-secondary:  #8b5cf6;     /* Violet — secondary accent */
  --accent-tertiary:   #06b6d4;     /* Cyan — tertiary accent */
  
  /* Semantic Colors */
  --success:           #22c55e;     /* Green — success states */
  --success-bg:        rgba(34, 197, 94, 0.1);
  --warning:           #f59e0b;     /* Amber — warnings */
  --warning-bg:        rgba(245, 158, 11, 0.1);
  --error:             #ef4444;     /* Red — errors, critical */
  --error-bg:          rgba(239, 68, 68, 0.1);
  --info:              #3b82f6;     /* Blue — informational */
  --info-bg:           rgba(59, 130, 246, 0.1);
  
  /* Intent Mode Colors */
  --intent-performance: #f97316;    /* Orange */
  --intent-scalability: #8b5cf6;    /* Violet */
  --intent-readability: #06b6d4;    /* Cyan */
  --intent-security:    #ef4444;    /* Red */
  --intent-optimization:#22c55e;    /* Green */
  --intent-accessibility:#f59e0b;   /* Amber */
  --intent-testing:     #3b82f6;    /* Blue */
  
  /* Code Health Score Gradient */
  --health-critical:   #ef4444;     /* 0-30 */
  --health-poor:       #f97316;     /* 31-50 */
  --health-fair:       #f59e0b;     /* 51-70 */
  --health-good:       #22c55e;     /* 71-85 */
  --health-excellent:  #06b6d4;     /* 86-100 */
  
  /* Borders */
  --border-subtle:     #1e1e30;     /* Subtle dividers */
  --border-default:    #2a2a45;     /* Default borders */
  --border-focus:      #6366f1;     /* Focus ring */
  
  /* Shadows */
  --shadow-sm:   0 1px 2px rgba(0, 0, 0, 0.5);
  --shadow-md:   0 4px 12px rgba(0, 0, 0, 0.5);
  --shadow-lg:   0 8px 32px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.15);
}
```

### 2.2 Light Theme (Optional)

```css
[data-theme="light"] {
  --bg-base:           #f8f9fc;
  --bg-surface:        #ffffff;
  --bg-elevated:       #f1f3f8;
  --bg-hover:          #e8eaf0;
  --editor-bg:         #ffffff;
  --text-primary:      #1a1a2e;
  --text-secondary:    #4a4a6a;
  --border-subtle:     #e2e4ec;
  --border-default:    #d1d5e0;
  /* Accent colors remain the same */
}
```

---

## 3. Typography

### 3.1 Font Stack

```css
/* UI Font — for menus, labels, buttons, chat */
--font-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Code Font — for editor, code blocks, terminal */
--font-code: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;

/* Heading Font — for dashboard titles and headings */
--font-heading: 'Inter', sans-serif;
```

### 3.2 Type Scale

| Element | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| Page Title | Inter | 24px | 700 | 1.2 | -0.02em |
| Section Heading | Inter | 18px | 600 | 1.3 | -0.01em |
| Panel Title | Inter | 14px | 600 | 1.4 | 0 |
| Body Text | Inter | 13px | 400 | 1.5 | 0 |
| Small Text | Inter | 12px | 400 | 1.4 | 0 |
| Caption | Inter | 11px | 400 | 1.3 | 0.02em |
| Code (Editor) | JetBrains Mono | 14px | 400 | 1.6 | 0 |
| Code (Chat) | JetBrains Mono | 13px | 400 | 1.5 | 0 |
| Code (Small) | JetBrains Mono | 12px | 400 | 1.4 | 0 |
| Terminal | JetBrains Mono | 13px | 400 | 1.4 | 0 |
| Button | Inter | 13px | 500 | 1 | 0 |
| Badge | Inter | 11px | 600 | 1 | 0.04em |

---

## 4. Layout System

### 4.1 Main Layout Specifications

```
┌──────────────────────────────────────────────────────────────┐
│ Top Bar (40px height)                                        │
├──────────┬──────────────────────────┬────────────────────────┤
│          │                          │                        │
│ Sidebar  │    Editor Area           │   Right Panel          │
│ (240px   │    (flex: 1)             │   (360px default,      │
│ default, │                          │    resizable,          │
│ resizable│                          │    collapsible)        │
│ 180-400px│                          │                        │
│ collaps- │                          │                        │
│ ible)    ├──────────────────────────┤                        │
│          │    Bottom Panel          │                        │
│          │    (200px default,       │                        │
│          │    resizable, collapsible)│                       │
├──────────┴──────────────────────────┴────────────────────────┤
│ Status Bar (24px height)                                     │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 Spacing System

```css
--space-1:  4px;     /* Tight spacing */
--space-2:  8px;     /* Default padding */
--space-3:  12px;    /* Component padding */
--space-4:  16px;    /* Section spacing */
--space-5:  20px;    /* Large spacing */
--space-6:  24px;    /* Panel padding */
--space-8:  32px;    /* Major section spacing */
--space-10: 40px;    /* Page-level spacing */
```

### 4.3 Panel Behaviors

| Panel | Default State | Min Width/Height | Collapse | Resize |
|---|---|---|---|---|
| Sidebar | Expanded (240px) | 180px | Yes (to 48px icon strip) | Horizontal |
| Editor Area | Expanded | 400px | No | Fills remaining space |
| Right Panel | Expanded (360px) | 280px | Yes (hidden) | Horizontal |
| Bottom Panel | Collapsed | 120px | Yes (hidden) | Vertical |
| Status Bar | Always visible | 24px | No | No |

---

## 5. Component Design Specifications

### 5.1 Top Bar

```
┌──────────────────────────────────────────────────────────────┐
│ [≡] [◀ ▶] │ 📁 Project Name ▼ │ [🔍 Search] │ [⚙] [🔔] [👤] │
└──────────────────────────────────────────────────────────────┘

Height: 40px
Background: var(--bg-surface)
Border-bottom: 1px solid var(--border-subtle)
Items vertically centered
Logo/Menu icon on the left
Project name with dropdown for recent projects
Search button opens command palette (Ctrl+P)
Settings, notifications, and user avatar on the right
```

### 5.2 Sidebar

```
┌──────────┐
│ [🗂] [🔍]  │ ← Icon toolbar (file explorer, search)
│ [🧠] [💚]  │ ← (memory, health — alternative panel switchers)
├──────────┤
│ ▼ src/    │ ← Folder (expanded)
│   ▶ comp/ │ ← Folder (collapsed)
│   App.jsx │ ← File (icon based on type)
│   main.jsx│
│ ▼ public/ │
│   index.html│
├──────────┤
│ [+ New File]│ ← Action button at bottom
└──────────┘

Width: 240px (resizable)
Background: var(--bg-surface)
File icons colored by file type:
  .jsx/.tsx → React blue (#61dafb)
  .js/.ts  → JavaScript yellow (#f0db4f)
  .css     → CSS blue (#264de4)
  .html    → HTML orange (#e44d26)
  .json    → JSON green (#22c55e)
  .md      → Markdown white
Selected file: bg var(--bg-active), left border 2px var(--accent-primary)
Hover: bg var(--bg-hover)
Indent: 16px per level
Font: var(--font-ui), 13px
```

### 5.3 Editor Tabs

```
┌──────────────────────────────────────────────────────┐
│ [App.jsx ●] [utils.js] [index.css] │ [+]             │
└──────────────────────────────────────────────────────┘

Height: 36px
Background: var(--bg-base)
Active tab: 
  Background: var(--editor-bg)
  Top border: 2px solid var(--accent-primary)
  Text: var(--text-primary)
Inactive tab:
  Background: var(--bg-surface)
  Text: var(--text-secondary)
  Hover: var(--bg-hover)
● indicator = unsaved changes (amber dot)
Each tab shows: [file-icon] [filename] [close ×]
Close button appears on hover
Tab width: auto (min 80px, max 200px)
Overflow: horizontal scroll with arrows
```

### 5.4 Editor Area (Monaco)

```
Custom Monaco Theme: "codenexus-dark"

Background:     #0d0d14
Foreground:     #e4e4e7
Active line:    #1a1a2e
Selection:      rgba(88, 101, 242, 0.25)
Cursor:         #6366f1
Line numbers:   #4a4a6a
Minimap:        Right side, slightly transparent
Scrollbar:      6px width, rounded, semi-transparent

Syntax Colors (token colors):
  Keywords:      #c792ea  (purple)
  Strings:       #c3e88d  (green)
  Numbers:       #f78c6c  (orange)
  Functions:     #82aaff  (blue)
  Variables:     #e4e4e7  (white)
  Comments:      #546e7a  (grey, italic)
  Types:         #ffcb6b  (yellow)
  Operators:     #89ddff  (cyan)
  Tags (JSX):    #f07178  (red)
  Attributes:    #ffcb6b  (yellow)
  Brackets:      Colored by depth (rainbow brackets)

Editor Gutter:
  Breakpoints: Red dot on hover
  Fold icons: ▶ (collapsed) ▼ (expanded)
  AI annotations: colored dots (red/yellow/blue for review)
```

### 5.5 Right Panel (AI Panels)

```
┌──────────────────────────┐
│ [💬 Chat] [🎯 Intent]    │ ← Tab navigation
│ [🧠 Memory] [💚 Health]  │
│ [🔍 Review]              │
├──────────────────────────┤
│                          │
│   Panel content varies   │
│   based on active tab    │
│                          │
│   See individual panel   │
│   specs below            │
│                          │
└──────────────────────────┘

Width: 360px (resizable, min 280px)
Background: var(--bg-surface)
Tab bar: 36px height, icons + labels
Active tab: accent color underline
Transition: 200ms ease-in-out on tab switch
Panel collapses to 0px (hidden) via toggle button
```

### 5.6 Chat Panel Design

```
┌──────────────────────────┐
│ 💬 AI Chat          [⋮]  │ ← Header with actions menu
├──────────────────────────┤
│                          │
│  🤖 AI Message           │ ← Left-aligned, slight bg tint
│  ┌────────────────────┐  │
│  │ "Here's how the    │  │
│  │  auth middleware    │  │
│  │  works..."         │  │
│  │                    │  │
│  │  ```javascript     │  │ ← Syntax highlighted code block
│  │  const auth = ...  │  │
│  │  ```               │  │
│  │  [📋 Copy] [📝 Apply]│ │ ← Action buttons on code blocks
│  └────────────────────┘  │
│                          │
│           👤 User Message│ ← Right-aligned, accent bg
│           ┌──────────────┤
│           │ "How does    │
│           │  this work?" │
│           └──────────────┤
│                          │
│  🤖 Typing...  ● ● ●    │ ← Streaming indicator
│                          │
├──────────────────────────┤
│ [/] Type a message...    │ ← Input with slash command hint
│                     [➤]  │ ← Send button
└──────────────────────────┘

AI messages:
  Background: var(--bg-elevated)
  Border-radius: 12px
  Padding: 12px 16px
  Max-width: 90%

User messages:
  Background: var(--accent-primary) at 15% opacity
  Border-radius: 12px
  Padding: 12px 16px
  Max-width: 80%
  Aligned right

Code blocks in chat:
  Background: var(--bg-base)
  Border: 1px solid var(--border-default)
  Border-radius: 8px
  Header: language label + copy/apply buttons
  Font: var(--font-code), 13px

Input area:
  Height: 44px (expands to max 120px for multiline)
  Background: var(--bg-elevated)
  Border: 1px solid var(--border-default)
  Focus border: var(--border-focus)
  Placeholder: "Type a message or use /commands..."
  Send button: var(--accent-primary) background
```

### 5.7 Intent Panel Design

```
┌──────────────────────────┐
│ 🎯 Intent Mode     [×]   │
├──────────────────────────┤
│                          │
│ Scope: [● Selection]     │
│        [○ File]          │
│        [○ Multi-file]    │
│                          │
├──────────────────────────┤
│ Choose Intent:           │
│                          │
│ ┌──────┐ ┌──────┐       │
│ │ 🚀   │ │ 📐   │       │  ← Grid of intent buttons
│ │Perf  │ │Scale │       │     48px × 48px each
│ └──────┘ └──────┘       │     Rounded 12px
│ ┌──────┐ ┌──────┐       │     Hover: scale(1.05) + glow
│ │ 📖   │ │ 🔒   │       │     Selected: accent border
│ │Read  │ │Secure│       │
│ └──────┘ └──────┘       │
│ ┌──────┐ ┌──────┐       │
│ │ ⚡   │ │ 🧪   │       │
│ │Optim │ │Test  │       │
│ └──────┘ └──────┘       │
│                          │
│ ┌────────────────────┐   │
│ │ Custom: "Make it   │   │  ← Custom intent input
│ │ production-ready"  │   │
│ └────────────────────┘   │
│                          │
│ [Analyze ▶]              │  ← Primary action button
│                          │
├──────────────────────────┤
│ Results:                 │
│                          │
│ Confidence: [██████░] 87%│  ← Animated progress bar
│                          │
│ Suggestion 1/3:          │
│ "Replace Array.find()    │
│  with Map lookup"        │
│                          │
│ ┌── Diff ──────────────┐ │
│ │ - const x = arr.find │ │  ← Diff view (red/green)
│ │ + const map = new Map│ │
│ └──────────────────────┘ │
│                          │
│ [✓ Accept] [→ Skip]     │  ← Action buttons
│                          │
│ [Accept All] [Dismiss]   │
└──────────────────────────┘

Intent buttons:
  Size: 72px × 72px (including label)
  Icon: 24px
  Label: 11px, centered below icon
  Background: var(--bg-elevated)
  Border: 1px solid var(--border-default)
  Hover: transform scale(1.05), box-shadow glow
  Selected: border-color var(--accent-primary), background with accent tint

Confidence bar:
  Height: 8px
  Border-radius: 4px
  Background: var(--bg-base)
  Fill: gradient based on score (red→yellow→green→cyan)
  Animated fill on load (0.8s ease-out)

Diff blocks:
  Removed lines: background rgba(239, 68, 68, 0.1), red text prefix "-"
  Added lines: background rgba(34, 197, 94, 0.1), green text prefix "+"
  Context lines: no background
```

### 5.8 Visualization Panel Design

```
┌──────────────────────────┐
│ 📊 Explain Code    [⛶]   │ ← Fullscreen toggle
├──────────────────────────┤
│ Type: [Dependency ▼]     │
│                          │
│ ┌──────────────────────┐ │
│ │                      │ │
│ │   Interactive Graph  │ │  ← React Flow canvas
│ │   (React Flow)       │ │
│ │                      │ │
│ │  ┌─────┐  ┌─────┐   │ │
│ │  │App  │→│Header│   │ │  ← Nodes with file icons
│ │  │.jsx │  │.jsx │   │ │
│ │  └──┬──┘  └─────┘   │ │
│ │     │                │ │
│ │  ┌──▼──┐             │ │
│ │  │Edit │             │ │
│ │  │or   │             │ │
│ │  └─────┘             │ │
│ │                      │ │
│ └──────────────────────┘ │
│                          │
│ [🔍 Search] [↻ Reset]   │
│ [➖ Zoom Out] [➕ Zoom In]│
│                          │
│ ── AI Summary ──         │
│ "App.jsx is the root     │
│  component that imports  │
│  3 child components..."  │
│                          │
│ [📥 Export PNG] [SVG]    │
└──────────────────────────┘

Graph nodes:
  Size: 120px × 48px (auto-expand for long names)
  Background: var(--bg-elevated)
  Border: 1px solid var(--border-default)
  Border-radius: 8px
  Font: var(--font-code), 12px
  Icon: file type icon (16px, left-aligned)
  Hover: border-color var(--accent-primary), shadow glow
  Selected: accent border, scale(1.05)

Graph edges:
  Stroke: var(--text-tertiary)
  Stroke-width: 1.5px
  Arrow: filled, 8px
  Hover: stroke var(--accent-primary)
  Animated: dash animation for active connections

Canvas:
  Background: var(--bg-base) with subtle dot grid pattern
  Grid dots: var(--border-subtle), 2px, spaced 20px
  Smooth zoom/pan transitions
```

### 5.9 Status Bar

```
┌──────────────────────────────────────────────────────────────┐
│ ✓ Ready │ JavaScript │ UTF-8 │ Ln 42, Col 15 │ 💚 78 │ 🔗  │
└──────────────────────────────────────────────────────────────┘

Height: 24px
Background: var(--bg-surface)
Border-top: 1px solid var(--border-subtle)
Font: var(--font-ui), 11px
Text: var(--text-secondary)

Sections (left to right):
1. Connection status: ✓ Ready (green) / ⟳ Connecting (yellow) / ✗ Disconnected (red)
2. Language: File language
3. Encoding: UTF-8
4. Cursor position: Ln X, Col Y
5. Health score: colored number with heart icon
6. AI status: 🔗 Connected / ⏳ Processing / ❌ Unavailable
```

---

## 6. Animations & Transitions

### 6.1 Core Animations

```css
/* Panel open/close */
.panel-transition {
  transition: width 200ms ease-in-out, 
              height 200ms ease-in-out,
              opacity 150ms ease;
}

/* Tab switch content */
.panel-content-enter {
  animation: fadeSlideIn 200ms ease-out;
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* AI message appear */
.message-enter {
  animation: messageIn 300ms ease-out;
}
@keyframes messageIn {
  from { opacity: 0; transform: translateY(12px) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* AI streaming text — cursor blink */
.streaming-cursor::after {
  content: '▊';
  animation: blink 1s step-end infinite;
}

/* Intent button hover */
.intent-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px var(--accent-glow);
  transition: all 200ms ease;
}

/* Confidence bar fill */
.confidence-fill {
  animation: fillBar 800ms ease-out forwards;
}
@keyframes fillBar {
  from { width: 0%; }
  to   { width: var(--score); }
}

/* Graph node hover */
.graph-node:hover {
  transform: scale(1.05);
  box-shadow: 0 0 16px var(--accent-glow);
  transition: all 150ms ease;
}

/* Toast notification */
.toast-enter {
  animation: slideInRight 300ms ease-out;
}
.toast-exit {
  animation: slideOutRight 200ms ease-in;
}

/* Skeleton loading */
.skeleton {
  background: linear-gradient(90deg, 
    var(--bg-elevated) 25%, 
    var(--bg-hover) 50%, 
    var(--bg-elevated) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 6.2 Loading States

| State | Visual |
|---|---|
| AI thinking | Pulsing indigo dot + "Analyzing..." text |
| AI streaming | Words appear one-by-one with cursor blink |
| File loading | Skeleton lines in editor area |
| Graph rendering | Progressive node appearance (staggered 50ms each) |
| Health calculating | Score counter animating 0 → final value |
| Saving | Spinning icon next to filename → checkmark |

---

## 7. Responsive Design

### 7.1 Breakpoints

| Breakpoint | Min Width | Layout Changes |
|---|---|---|
| Desktop (large) | 1440px+ | Full layout, all panels visible |
| Desktop (standard) | 1024px | Right panel may be collapsed by default |
| Tablet | 768px | Sidebar collapsed to icons, right panel overlay |
| Mobile | < 768px | Not supported (show "Desktop required" message) |

### 7.2 Minimum Supported Resolution

- **Width:** 1024px
- **Height:** 600px
- Below minimum: Show a message: "CodeNexus requires a screen width of at least 1024px for the best experience."

---

## 8. Iconography

### 8.1 Icon Library

Use **Lucide React** (open-source, consistent, clean) for all UI icons.

### 8.2 File Type Icons

Custom SVG icons for file types, colored appropriately:

| Extension | Icon | Color |
|---|---|---|
| .js | JS letters | #f0db4f |
| .jsx | React logo | #61dafb |
| .ts | TS letters | #3178c6 |
| .tsx | React + TS | #61dafb |
| .css | CSS letters | #264de4 |
| .html | HTML brackets | #e44d26 |
| .json | JSON braces | #22c55e |
| .md | MD icon | #ffffff |
| .py | Python logo | #3776ab |
| .env | Gear icon | #f59e0b |
| Folder (open) | Open folder | #f59e0b |
| Folder (closed) | Closed folder | #f59e0b |

---

## 9. Accessibility Specifications

### 9.1 Requirements

- All interactive elements must be keyboard-focusable (Tab order)
- Focus indicators: 2px solid ring using var(--border-focus)
- All icons have aria-labels
- Color contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- AI chat messages announced by screen reader
- Graph visualizations have text alternatives
- High contrast theme available for visually impaired users

### 9.2 Keyboard Navigation

- Tab: Move between interactive elements
- Enter/Space: Activate buttons and controls
- Escape: Close modals, dismiss panels
- Arrow keys: Navigate file tree, chat history
- All shortcuts listed in Help panel (F1)

---

## 10. Landing Page Design

```
┌──────────────────────────────────────────────────────────────┐
│ [Logo: CodeNexus]                    [Features] [Login] [CTA]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│     ██████╗ ██████╗ ██████╗ ███████╗                        │
│    ██╔════╝██╔═══██╗██╔══██╗██╔════╝                        │
│    ██║     ██║   ██║██║  ██║█████╗                           │
│    ██║     ██║   ██║██║  ██║██╔══╝                           │
│    ╚██████╗╚██████╔╝██████╔╝███████╗                        │
│     ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝                        │
│              N E X U S                                       │
│                                                              │
│    "The AI Code Editor That                                  │
│     Thinks With You"                                         │
│                                                              │
│    AI that understands your intent, remembers your            │
│    decisions, and explains your code visually.                │
│                                                              │
│    [Get Started — It's Free]  [See Demo ▶]                   │
│                                                              │
│    ┌────────────────────────────────────────┐                 │
│    │   Hero image: Animated screenshot     │                 │
│    │   of the editor with AI features      │                 │
│    │   active (Intent Mode + Graph)        │                 │
│    └────────────────────────────────────────┘                 │
│                                                              │
│── Features Section ──                                        │
│                                                              │
│    ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│    │ 🎯       │ │ 📊       │ │ 🧠       │                   │
│    │ Intent   │ │ Explain  │ │ Decision │                   │
│    │ Mode     │ │ My Code  │ │ Memory   │                   │
│    │          │ │          │ │          │                   │
│    │ desc...  │ │ desc...  │ │ desc...  │                   │
│    └──────────┘ └──────────┘ └──────────┘                   │
│                                                              │
│── CTA Section ──                                             │
│    Background: gradient (indigo → violet)                     │
│    "Start building smarter. Join CodeNexus today."            │
│    [Create Free Account]                                      │
│                                                              │
│── Footer ──                                                  │
│    © 2026 CodeNexus │ Privacy │ Terms │ GitHub                │
└──────────────────────────────────────────────────────────────┘

Landing page uses:
  - Dark background with subtle gradient
  - Animated hero section (CSS animations + Framer Motion)
  - Glassmorphism feature cards
  - Smooth scroll between sections
  - Intersection Observer for scroll animations
```

---

## 11. Modal & Dialog Design

```
┌──────────────────────────────────────┐
│        Modal Title              [×]  │
├──────────────────────────────────────┤
│                                      │
│  Modal content here                  │
│                                      │
│  Form fields, information,           │
│  or confirmation messages            │
│                                      │
├──────────────────────────────────────┤
│              [Cancel]  [Primary CTA] │
└──────────────────────────────────────┘

Overlay: rgba(0, 0, 0, 0.6) with backdrop-filter: blur(4px)
Modal:
  Background: var(--bg-elevated)
  Border: 1px solid var(--border-default)
  Border-radius: 12px
  Shadow: var(--shadow-lg)
  Max-width: 480px (small), 640px (medium), 800px (large)
  Animation: scale(0.95) + fade in (200ms)

Buttons:
  Primary: bg var(--accent-primary), text white, rounded 8px
  Secondary: bg transparent, border var(--border-default), text var(--text-primary)
  Destructive: bg var(--error), text white
  Button height: 36px
  Padding: 0 16px
  Font: 13px, weight 500
  Hover: brightness(1.1)
  Active: brightness(0.9)
  Disabled: opacity 0.5, cursor not-allowed
```

---

## 12. Toast Notifications

```
┌──────────────────────────────────────┐
│ ✓  File saved successfully      [×]  │
└──────────────────────────────────────┘

Position: Top-right, 16px from edges
Width: 320px max
Background: var(--bg-elevated)
Border-left: 3px solid (colored by type)
Border-radius: 8px
Shadow: var(--shadow-md)
Duration: 3 seconds (auto-dismiss)
Stack: max 3 visible, newest on top

Types:
  Success: green left border, ✓ icon
  Error: red left border, ✗ icon
  Warning: amber left border, ⚠ icon
  Info: blue left border, ℹ icon
```
