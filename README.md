# CodeNexus — AI-Powered Code Editor

> The AI Code Editor That Thinks With You

CodeNexus is a browser-based AI-powered code editor that goes beyond autocompletion. It understands your intent, remembers your decisions, and explains your code visually.

![Status](https://img.shields.io/badge/Status-In%20Development-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Key Features

| Feature | Description |
|---|---|
| **🎯 Intent Mode** | AI understands what you want — performance, security, readability — and transforms your code accordingly |
| **📊 Explain My Code** | Interactive visual diagrams showing data flow, file dependencies, and function connections |
| **🧠 Decision Memory** | AI remembers your past choices and architectural decisions, making your workflow smarter over time |
| **💬 Smart Chat** | Context-aware AI chat that knows your current file, selection, and project structure |
| **🔍 AI Code Review** | Automated reviews catching bugs, security vulnerabilities, and anti-patterns |
| **💚 Code Health Dashboard** | Real-time metrics on complexity, duplication, documentation, and more |
| **🧪 Smart Scaffolding** | Generate project structures from natural language descriptions |
| **⌨️ Terminal Integration** | Built-in terminal with AI-powered command suggestions |
| **🔗 Regex Playground** | Build, test, and explain regex with AI assistance |
| **📸 Collaboration Snapshots** | Shareable, read-only snapshots of your editor state |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 5, Zustand 4, Monaco Editor |
| **Backend** | Node.js 20, Express.js 4, MongoDB 7 (Mongoose 8), Socket.IO 4 |
| **AI** | OpenAI GPT-4o (provider-agnostic abstraction) |
| **Visualization** | React Flow 11, D3.js 7, dagre |
| **Styling** | Vanilla CSS with CSS Variables (dark-first design) |
| **Terminal** | @xterm/xterm 5 |

---

## 📁 Project Structure

```
codenexus/
├── docs/               # Project documentation (PRD, TRD, schemas, etc.)
├── client/             # React frontend (Vite)
│   └── src/
│       ├── components/ # UI components by feature
│       ├── hooks/      # Custom React hooks
│       ├── stores/     # Zustand state stores
│       ├── services/   # API service layer
│       ├── utils/      # Utility functions
│       ├── themes/     # Theme definitions
│       └── styles/     # CSS files with variables
├── server/             # Node.js backend (Express)
│   └── src/
│       ├── routes/     # API route definitions
│       ├── controllers/# Request handlers
│       ├── services/   # Business logic + AI service
│       ├── models/     # Mongoose models
│       ├── middleware/  # Auth, validation, error handling
│       ├── prompts/    # AI prompt templates
│       └── sockets/    # WebSocket handlers
└── shared/             # Shared constants and types
```

---

## 🚦 Getting Started

### Prerequisites

- Node.js 20+
- npm 9+
- MongoDB 7+ (local or Atlas)
- An AI API key (OpenAI, Anthropic, or Google)

### Installation

```bash
# Clone the repository
git clone https://github.com/bharat-bhangale/CodeNexus.git
cd CodeNexus

# Install dependencies
npm install

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your API keys and database URL

# Start development servers
npm run dev
```

The client runs on `http://localhost:5173` and the server on `http://localhost:3001`.

---

## 📋 Documentation

| Document | Description |
|---|---|
| [01_PRD.md](docs/01_PRD.md) | Product Requirements Document |
| [02_TRD.md](docs/02_TRD.md) | Technical Requirements Document |
| [03_App_Flow.md](docs/03_App_Flow.md) | Complete User Flow & Interaction Map |
| [04_UI_UX_Design_Brief.md](docs/04_UI_UX_Design_Brief.md) | Design System & Component Specs |
| [05_Backend_Schema.md](docs/05_Backend_Schema.md) | Database Schemas & API Contracts |
| [06_Implementation_Plan.md](docs/06_Implementation_Plan.md) | Phase-by-Phase Build Guide |
| [07_Feature_Master_Prompts.md](docs/07_Feature_Master_Prompts.md) | AI Agent Prompts (18 prompts) |
| [08_Claude_Multi_Agent_Guide.md](docs/08_Claude_Multi_Agent_Guide.md) | Claude Code Skills, Hooks & Agents |

---

## 🗺️ Roadmap

- [x] Phase 0: Documentation & Planning
- [ ] Phase 1: Project Setup & Core Editor (Weeks 1–3)
- [ ] Phase 2: AI Core Features — Intent Mode, Explain, Chat (Weeks 4–7)
- [ ] Phase 3: Intelligence Layer — Decision Memory, Review, Health (Weeks 8–10)
- [ ] Phase 4: Power Features — Terminal, Scaffolding, Auth (Weeks 11–13)
- [ ] Phase 5: Polish & Launch (Weeks 14–16)

---

## 🤝 Contributing

Contributions are welcome! Please read the documentation in `docs/` before making changes.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👤 Author

**Bharat Bhangale**  
- GitHub: [@bharat-bhangale](https://github.com/bharat-bhangale)

---

*Built with ❤️ and AI — transitioning from building projects to building products.*
