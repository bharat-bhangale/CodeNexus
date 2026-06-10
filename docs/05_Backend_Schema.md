# Backend Schema Document
## CodeNexus — Database Models, API Schemas & Data Flow

**Version:** 1.0  
**Date:** June 2026  

---

## 1. Database Selection & Justification

**Primary Database:** MongoDB 7.x  
**ODM:** Mongoose 8.x  

**Rationale:**
- Decision Memory records have evolving, flexible schemas (different decision types store different metadata)
- File system representation is naturally hierarchical (fits document model)
- AI interaction logs have varying structures
- Rapid prototyping and schema iteration during development
- Built-in support for complex queries needed for pattern detection

**Supplementary:**
- **Redis 7.x** — Session management, rate limiting counters, AI response caching

---

## 2. MongoDB Collection Schemas

### 2.1 Users Collection

```javascript
// models/User.js
const UserSchema = new mongoose.Schema({
  // Identity
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^\S+@\S+\.\S+$/
  },
  passwordHash: {
    type: String,
    required: true
    // Never returned in API responses (select: false)
  },
  
  // Profile
  avatar: {
    type: String,
    default: null    // URL to avatar image
  },
  
  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['dark', 'light', 'high-contrast'],
      default: 'dark'
    },
    fontSize: {
      type: Number,
      min: 10,
      max: 24,
      default: 14
    },
    fontFamily: {
      type: String,
      default: 'JetBrains Mono'
    },
    tabSize: {
      type: Number,
      enum: [2, 4],
      default: 2
    },
    wordWrap: {
      type: Boolean,
      default: true
    },
    minimap: {
      type: Boolean,
      default: true
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    autoSaveDelay: {
      type: Number,
      default: 500     // milliseconds
    },
    autoReview: {
      type: Boolean,
      default: false
    },
    autoComplete: {
      type: Boolean,
      default: true
    }
  },
  
  // AI Configuration
  aiConfig: {
    provider: {
      type: String,
      enum: ['openai', 'anthropic', 'google'],
      default: 'openai'
    },
    model: {
      type: String,
      default: 'gpt-4o'
    },
    apiKey: {
      type: String,
      default: null
      // Encrypted at rest using AES-256
      // select: false — never returned in responses
    },
    temperature: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.3
    }
  },
  
  // Usage Tracking
  usage: {
    aiRequestsToday: {
      type: Number,
      default: 0
    },
    aiRequestsResetAt: {
      type: Date,
      default: Date.now
    },
    totalProjects: {
      type: Number,
      default: 0
    },
    totalDecisions: {
      type: Number,
      default: 0
    }
  },
  
  // Auth
  refreshTokens: [{
    token: String,
    expiresAt: Date,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Timestamps
  lastLoginAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash;
      delete ret.refreshTokens;
      delete ret.aiConfig?.apiKey;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
UserSchema.index({ email: 1 }, { unique: true });

// Pre-save: update the 'updatedAt' timestamp
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
```

---

### 2.2 Projects Collection

```javascript
// models/Project.js
const ProjectSchema = new mongoose.Schema({
  // Ownership
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Project Info
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  description: {
    type: String,
    default: '',
    maxlength: 500
  },
  template: {
    type: String,
    enum: ['blank', 'react', 'express', 'fullstack', 'custom'],
    default: 'blank'
  },
  
  // Language & Framework Detection
  primaryLanguage: {
    type: String,
    default: 'javascript'
  },
  frameworks: [{
    type: String     // e.g., ['react', 'express']
  }],
  
  // Statistics
  stats: {
    totalFiles: { type: Number, default: 0 },
    totalLines: { type: Number, default: 0 },
    totalDecisions: { type: Number, default: 0 },
    healthScore: { type: Number, default: null },
    lastHealthCheck: Date
  },
  
  // Project Rules (from Decision Memory patterns)
  rules: [{
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    rule: String,          // e.g., "Always use async/await"
    category: String,      // e.g., "code-style"
    createdAt: { type: Date, default: Date.now },
    sourceDecisionIds: [String]  // Decisions that led to this rule
  }],
  
  // Sharing
  isPublic: {
    type: Boolean,
    default: false
  },
  shareToken: {
    type: String,
    default: null      // For shareable snapshot URLs
  },
  
  // Timestamps
  lastOpenedAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
ProjectSchema.index({ userId: 1, updatedAt: -1 });
ProjectSchema.index({ shareToken: 1 }, { sparse: true });
```

---

### 2.3 Files Collection

```javascript
// models/File.js
const FileSchema = new mongoose.Schema({
  // Relationship
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  
  // File Identity
  name: {
    type: String,
    required: true,
    trim: true
  },
  path: {
    type: String,
    required: true,
    trim: true
    // Full path from project root, e.g., "src/components/App.jsx"
  },
  
  // Type
  type: {
    type: String,
    enum: ['file', 'folder'],
    required: true
  },
  
  // Content (only for type: 'file')
  content: {
    type: String,
    default: ''
    // Stored as plain text
    // Large files (>1MB) stored in GridFS or S3
  },
  
  // Metadata
  language: {
    type: String,
    default: 'plaintext'
    // Auto-detected: javascript, typescript, python, css, html, json, markdown
  },
  size: {
    type: Number,
    default: 0      // bytes
  },
  lineCount: {
    type: Number,
    default: 0
  },
  
  // Parent folder reference (for tree building)
  parentPath: {
    type: String,
    default: ''     // Empty string = root level
  },
  
  // Version tracking
  version: {
    type: Number,
    default: 1
  },
  lastModifiedBy: {
    type: String,
    enum: ['user', 'ai'],
    default: 'user'
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
FileSchema.index({ projectId: 1, path: 1 }, { unique: true });
FileSchema.index({ projectId: 1, parentPath: 1 });
FileSchema.index({ projectId: 1, type: 1 });
```

---

### 2.4 Decisions Collection (Decision Memory)

```javascript
// models/Decision.js
const DecisionSchema = new mongoose.Schema({
  // Relationships
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Decision Identity
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    default: '',
    maxlength: 2000
  },
  
  // Decision Type
  type: {
    type: String,
    required: true,
    enum: [
      'intent_accept',      // Accepted an Intent Mode suggestion
      'review_fix',          // Applied an AI Code Review fix
      'chat_apply',          // Applied code from chat
      'scaffold',            // Generated scaffolding
      'manual',              // User manually recorded
      'refactor',            // AI-assisted refactoring
      'pattern_rule'         // Created a rule from a pattern
    ]
  },
  
  // Source Context
  source: {
    intent: String,          // For intent_accept: "performance", "security", etc.
    reviewCategory: String,  // For review_fix: "bugs", "security", etc.
    chatMessageId: String,   // For chat_apply: reference to chat message
    command: String          // For chat_apply: "/explain", "/refactor", etc.
  },
  
  // Code Context
  codeContext: {
    filePath: String,        // File where decision was made
    fileName: String,        // Just the filename
    language: String,        // Programming language
    lineRange: {
      start: Number,
      end: Number
    },
    beforeCode: String,      // Code before the change (max 5000 chars)
    afterCode: String,       // Code after the change (max 5000 chars)
    diff: String             // Unified diff format
  },
  
  // AI Analysis
  aiAnalysis: {
    explanation: String,     // Why AI suggested this change
    confidence: Number,      // 0-100 confidence score
    references: [String],    // Best practice references
    model: String,           // Which AI model was used
    tokensUsed: Number       // Token count for this interaction
  },
  
  // User Annotations
  annotations: {
    userNote: String,        // User's custom note
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null          // User rates the suggestion quality
    }
  },
  
  // Tags
  tags: [{
    type: String,
    trim: true,
    lowercase: true
    // e.g., "architecture", "state-management", "performance"
  }],
  
  // Affected Files
  affectedFiles: [{
    path: String,
    name: String
  }],
  
  // Pattern linking
  patternId: {
    type: String,
    default: null            // If this decision is part of a detected pattern
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'reverted', 'superseded'],
    default: 'active'
  },
  supersededBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Decision',
    default: null
  },
  
  // Timestamps
  timestamp: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
DecisionSchema.index({ projectId: 1, timestamp: -1 });
DecisionSchema.index({ projectId: 1, type: 1 });
DecisionSchema.index({ projectId: 1, tags: 1 });
DecisionSchema.index({ projectId: 1, 'codeContext.filePath': 1 });
DecisionSchema.index({ projectId: 1, patternId: 1 });

// Text index for search
DecisionSchema.index({ 
  title: 'text', 
  description: 'text', 
  'annotations.userNote': 'text' 
});
```

---

### 2.5 Chat Histories Collection

```javascript
// models/ChatHistory.js
const ChatHistorySchema = new mongoose.Schema({
  // Relationships
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Messages
  messages: [{
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 50000
    },
    
    // Context at the time of message
    context: {
      activeFile: {
        path: String,
        name: String,
        language: String
      },
      selectedText: String,      // Up to 5000 chars
      cursorPosition: {
        line: Number,
        column: Number
      },
      openFiles: [String]        // Array of file paths
    },
    
    // For assistant messages
    metadata: {
      model: String,             // AI model used
      tokensUsed: {
        prompt: Number,
        completion: Number,
        total: Number
      },
      latency: Number,           // Response time in ms
      command: String,            // Slash command if used (/explain, etc.)
      codeBlocks: [{
        language: String,
        code: String,
        applied: Boolean,        // Whether user applied this code
        appliedAt: Date
      }]
    },
    
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Session info
  sessionStartedAt: { type: Date, default: Date.now },
  lastMessageAt: Date,
  messageCount: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
ChatHistorySchema.index({ projectId: 1, createdAt: -1 });
ChatHistorySchema.index({ userId: 1, createdAt: -1 });
```

---

### 2.6 Health Snapshots Collection

```javascript
// models/HealthSnapshot.js
const HealthSnapshotSchema = new mongoose.Schema({
  // Relationships
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  
  // Overall Score
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  
  // Individual Metrics
  metrics: {
    complexity: {
      score: { type: Number, min: 0, max: 100 },
      details: {
        averageCyclomaticComplexity: Number,
        maxCyclomaticComplexity: Number,
        complexFunctions: [{
          name: String,
          file: String,
          line: Number,
          complexity: Number
        }]
      }
    },
    duplication: {
      score: { type: Number, min: 0, max: 100 },
      details: {
        duplicateBlocks: Number,
        duplicateLines: Number,
        totalLines: Number,
        percentage: Number,
        instances: [{
          files: [String],
          lines: String,
          codeSnippet: String
        }]
      }
    },
    coverage: {
      score: { type: Number, min: 0, max: 100 },
      details: {
        estimatedCoverage: Number,  // Percentage
        filesWithTests: Number,
        filesWithoutTests: Number,
        testFiles: [String]
      }
    },
    documentation: {
      score: { type: Number, min: 0, max: 100 },
      details: {
        documentedFunctions: Number,
        undocumentedFunctions: Number,
        totalFunctions: Number,
        percentage: Number,
        undocumentedList: [{
          name: String,
          file: String,
          line: Number
        }]
      }
    },
    dependencies: {
      score: { type: Number, min: 0, max: 100 },
      details: {
        totalDependencies: Number,
        outdatedCount: Number,
        vulnerableCount: Number,
        unusedCount: Number
      }
    },
    deadCode: {
      score: { type: Number, min: 0, max: 100 },
      details: {
        unusedExports: Number,
        unusedVariables: Number,
        unreachableCode: Number,
        instances: [{
          type: String,
          name: String,
          file: String,
          line: Number
        }]
      }
    }
  },
  
  // Hot Spots (top problem files)
  hotspots: [{
    file: String,
    issues: Number,
    topIssue: String,        // e.g., "High complexity (45)"
    score: Number            // File-level health score
  }],
  
  // AI Recommendations
  recommendations: [{
    priority: { type: String, enum: ['high', 'medium', 'low'] },
    title: String,
    description: String,
    affectedFiles: [String],
    estimatedImpact: Number  // Estimated score improvement
  }],
  
  // Metadata
  analyzedFiles: Number,
  analyzedLines: Number,
  analysisTime: Number,      // milliseconds
  
  // Timestamps
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

// Indexes
HealthSnapshotSchema.index({ projectId: 1, createdAt: -1 });

// TTL: automatically delete snapshots older than 90 days
HealthSnapshotSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
```

---

### 2.7 Review Results Collection

```javascript
// models/ReviewResult.js
const ReviewResultSchema = new mongoose.Schema({
  // Relationships
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // File Context
  filePath: String,
  fileName: String,
  language: String,
  
  // Review Issues
  issues: [{
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    
    // Classification
    severity: {
      type: String,
      enum: ['critical', 'warning', 'info'],
      required: true
    },
    category: {
      type: String,
      enum: ['bug', 'security', 'performance', 'style', 'accessibility', 'best-practice'],
      required: true
    },
    
    // Location
    lineStart: Number,
    lineEnd: Number,
    columnStart: Number,
    columnEnd: Number,
    
    // Details
    title: String,           // Short description
    description: String,     // Detailed explanation
    codeSnippet: String,     // The problematic code
    suggestedFix: String,    // AI-generated fix code
    fixExplanation: String,  // Why this fix works
    
    // References
    references: [{
      title: String,
      url: String            // Link to best practice doc
    }],
    
    // Status
    status: {
      type: String,
      enum: ['open', 'fixed', 'dismissed', 'false-positive'],
      default: 'open'
    },
    fixedAt: Date,
    dismissedAt: Date,
    dismissCount: {
      type: Number,
      default: 0
      // Track how many times user dismissed this type
      // After 3: add to exclusion list
    }
  }],
  
  // Summary
  summary: {
    totalIssues: Number,
    criticalCount: Number,
    warningCount: Number,
    infoCount: Number,
    fixedCount: Number,
    dismissedCount: Number
  },
  
  // AI Metadata
  aiMetadata: {
    model: String,
    tokensUsed: Number,
    latency: Number
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now }
}, { timestamps: false });

// Indexes
ReviewResultSchema.index({ projectId: 1, createdAt: -1 });
ReviewResultSchema.index({ projectId: 1, fileId: 1, createdAt: -1 });
ReviewResultSchema.index({ projectId: 1, 'issues.severity': 1 });
```

---

## 3. API Request/Response Schemas

### 3.1 Authentication

#### POST /api/v1/auth/register

**Request:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "665a1b2c3d4e5f6789abcdef",
      "fullName": "John Doe",
      "email": "john@example.com",
      "preferences": { "theme": "dark", "fontSize": 14, ... },
      "createdAt": "2026-06-10T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Validation Rules:**
- `fullName`: 2-100 characters
- `email`: Valid email format, unique
- `password`: Min 8 chars, 1 uppercase, 1 number, 1 special char
- `confirmPassword`: Must match password

---

#### POST /api/v1/auth/login

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### 3.2 AI Endpoints

#### POST /api/v1/ai/intent

**Request:**
```json
{
  "code": "function findUser(users, id) {\n  return users.find(u => u.id === id);\n}",
  "intent": "performance",
  "language": "javascript",
  "filePath": "src/utils/helpers.js",
  "context": {
    "projectId": "665a1b2c...",
    "otherFiles": [
      {
        "path": "src/models/User.js",
        "content": "..."
      }
    ],
    "decisionHistory": [
      {
        "title": "Used Map for O(1) lookups in auth module",
        "type": "intent_accept",
        "intent": "performance"
      }
    ],
    "projectRules": [
      "Always use async/await instead of .then() chains",
      "Prefer functional components with hooks"
    ]
  }
}
```

**Response (200 — streaming via SSE/WebSocket):**
```json
{
  "success": true,
  "data": {
    "intent": "performance",
    "overallConfidence": 87,
    "suggestions": [
      {
        "id": "sug_001",
        "title": "Replace Array.find() with Map lookup for O(1) access",
        "explanation": "The current implementation uses Array.find() which is O(n). For frequently called functions, converting to a Map provides O(1) lookup time.",
        "confidence": 92,
        "original": "function findUser(users, id) {\n  return users.find(u => u.id === id);\n}",
        "improved": "function findUser(usersMap, id) {\n  return usersMap.get(id);\n}\n\n// Pre-build map: const usersMap = new Map(users.map(u => [u.id, u]));",
        "lineRange": { "start": 1, "end": 3 },
        "references": [
          "MDN: Map vs Object performance",
          "Big-O Cheat Sheet: Hash table lookup O(1)"
        ],
        "impact": "Reduces lookup from O(n) to O(1), significant for large arrays"
      }
    ],
    "tokensUsed": { "prompt": 450, "completion": 320, "total": 770 },
    "model": "gpt-4o"
  }
}
```

---

#### POST /api/v1/ai/explain

**Request:**
```json
{
  "type": "dependency_graph",
  "scope": "project",
  "files": [
    {
      "path": "src/App.jsx",
      "content": "import Header from './components/Header';\nimport Sidebar from './components/Sidebar';\n..."
    },
    {
      "path": "src/components/Header.jsx",
      "content": "..."
    }
  ],
  "language": "javascript",
  "projectId": "665a1b2c..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "type": "dependency_graph",
    "graph": {
      "nodes": [
        {
          "id": "src/App.jsx",
          "label": "App.jsx",
          "type": "component",
          "language": "jsx",
          "linesOfCode": 45,
          "exports": ["App (default)"],
          "position": { "x": 200, "y": 0 }
        },
        {
          "id": "src/components/Header.jsx",
          "label": "Header.jsx",
          "type": "component",
          "language": "jsx",
          "linesOfCode": 32,
          "exports": ["Header (default)"],
          "position": { "x": 0, "y": 150 }
        }
      ],
      "edges": [
        {
          "id": "e1",
          "source": "src/App.jsx",
          "target": "src/components/Header.jsx",
          "label": "imports Header",
          "type": "import"
        }
      ]
    },
    "summary": "App.jsx is the root component that imports 3 child components: Header, Sidebar, and Editor. Header and Sidebar are leaf components with no further dependencies. Editor imports 2 utility files.",
    "stats": {
      "totalNodes": 6,
      "totalEdges": 5,
      "maxDepth": 3,
      "circularDependencies": 0
    }
  }
}
```

---

#### POST /api/v1/ai/chat

**Request:**
```json
{
  "message": "How does the authentication middleware work?",
  "projectId": "665a1b2c...",
  "context": {
    "activeFile": {
      "path": "src/middleware/auth.js",
      "content": "const jwt = require('jsonwebtoken');\n...",
      "language": "javascript"
    },
    "selectedText": null,
    "cursorPosition": { "line": 5, "column": 12 },
    "openFiles": ["src/middleware/auth.js", "src/routes/api.js"],
    "recentDecisions": []
  },
  "chatHistoryId": "665b2c3d..."
}
```

**Response (streaming via WebSocket):**
```json
{
  "event": "ai:stream:chunk",
  "data": {
    "content": "The authentication middleware in `auth.js` works by...",
    "done": false,
    "messageId": "msg_001"
  }
}
// ... more chunks ...
{
  "event": "ai:stream:chunk",
  "data": {
    "content": "",
    "done": true,
    "messageId": "msg_001",
    "metadata": {
      "model": "gpt-4o",
      "tokensUsed": { "prompt": 680, "completion": 450, "total": 1130 },
      "latency": 2340,
      "codeBlocks": [
        {
          "language": "javascript",
          "code": "const authMiddleware = (req, res, next) => { ... }"
        }
      ]
    }
  }
}
```

---

#### POST /api/v1/ai/review

**Request:**
```json
{
  "code": "app.get('/user', (req, res) => {\n  const query = `SELECT * FROM users WHERE id = ${req.params.id}`;\n  db.query(query);\n});",
  "language": "javascript",
  "filePath": "src/routes/user.js",
  "categories": ["bugs", "security", "performance", "style"],
  "projectId": "665a1b2c...",
  "dismissedPatterns": ["prefer-const-2-times"],
  "projectRules": []
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "filePath": "src/routes/user.js",
    "issues": [
      {
        "id": "issue_001",
        "severity": "critical",
        "category": "security",
        "lineStart": 2,
        "lineEnd": 2,
        "title": "SQL Injection Vulnerability",
        "description": "User input (req.params.id) is directly interpolated into SQL query string. An attacker could inject malicious SQL to access or modify data.",
        "codeSnippet": "const query = `SELECT * FROM users WHERE id = ${req.params.id}`;",
        "suggestedFix": "const query = 'SELECT * FROM users WHERE id = ?';\ndb.query(query, [req.params.id]);",
        "fixExplanation": "Use parameterized queries to prevent SQL injection. The database driver will properly escape the input.",
        "references": [
          { "title": "OWASP SQL Injection", "url": "https://owasp.org/www-community/attacks/SQL_Injection" }
        ]
      }
    ],
    "summary": {
      "totalIssues": 1,
      "criticalCount": 1,
      "warningCount": 0,
      "infoCount": 0
    }
  }
}
```

---

### 3.3 Decision Memory Endpoints

#### POST /api/v1/projects/:id/decisions

**Request:**
```json
{
  "title": "Used Map for O(1) lookups in user search",
  "description": "Replaced Array.find() with Map.get() for constant-time user lookup",
  "type": "intent_accept",
  "source": {
    "intent": "performance"
  },
  "codeContext": {
    "filePath": "src/utils/helpers.js",
    "fileName": "helpers.js",
    "language": "javascript",
    "lineRange": { "start": 1, "end": 3 },
    "beforeCode": "function findUser(users, id) {\n  return users.find(u => u.id === id);\n}",
    "afterCode": "function findUser(usersMap, id) {\n  return usersMap.get(id);\n}"
  },
  "aiAnalysis": {
    "explanation": "Map lookup is O(1) vs Array.find O(n)",
    "confidence": 92,
    "model": "gpt-4o"
  },
  "tags": ["performance", "data-structures"]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "665c3d4e...",
    "title": "Used Map for O(1) lookups in user search",
    "type": "intent_accept",
    "timestamp": "2026-06-10T12:00:00.000Z",
    ...
  }
}
```

---

#### GET /api/v1/projects/:id/patterns

**Response (200):**
```json
{
  "success": true,
  "data": {
    "patterns": [
      {
        "id": "pattern_001",
        "pattern": "Consistent use of async/await over .then() chains",
        "occurrences": 8,
        "confidence": 95,
        "category": "code-style",
        "examples": [
          { "decisionId": "665c3d4e...", "title": "Converted promise chain to async/await in auth service" },
          { "decisionId": "665c4e5f...", "title": "Used async/await for database queries" }
        ],
        "suggestedRule": "Always use async/await instead of .then() chains for promise handling",
        "isRuleCreated": false
      },
      {
        "id": "pattern_002",
        "pattern": "Preference for functional React components with hooks",
        "occurrences": 12,
        "confidence": 98,
        "category": "architecture",
        "suggestedRule": "Use functional components with hooks instead of class components",
        "isRuleCreated": true
      }
    ],
    "totalDecisionsAnalyzed": 45
  }
}
```

---

## 4. Error Response Schema

All error responses follow this consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is already registered"
      }
    ],
    "statusCode": 400,
    "timestamp": "2026-06-10T12:00:00.000Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|---|---|---|
| VALIDATION_ERROR | 400 | Invalid request data |
| AUTHENTICATION_ERROR | 401 | Invalid or expired token |
| AUTHORIZATION_ERROR | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource already exists |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| AI_PROVIDER_ERROR | 503 | AI service unavailable |
| INTERNAL_ERROR | 500 | Unexpected server error |

---

## 5. Redis Cache Schemas

### 5.1 Session Cache
```
Key:    session:{userId}
Value:  JSON { accessToken, refreshToken, createdAt }
TTL:    3600 (1 hour)
```

### 5.2 Rate Limit Counters
```
Key:    ratelimit:{userId}:{endpoint}
Value:  Integer (request count)
TTL:    60 (1 minute window)
```

### 5.3 AI Response Cache
```
Key:    ai_cache:{hash(code + intent + model)}
Value:  JSON (full AI response)
TTL:    300 (5 minutes)
```

### 5.4 Health Score Cache
```
Key:    health:{projectId}
Value:  JSON (latest health snapshot)
TTL:    60 (1 minute — invalidated on file save)
```

---

## 6. Data Flow Diagrams

### 6.1 Intent Mode Data Flow

```
User selects code + intent
        │
        ▼
  Frontend builds request:
  { code, intent, context (files, decisions, rules) }
        │
        ▼
  POST /api/v1/ai/intent
        │
        ▼
  Backend: AIController.handleIntent()
    ├─ Validate request (Joi/Zod)
    ├─ Fetch recent decisions: Decision.find({ projectId })
    ├─ Fetch project rules: Project.findById(projectId).rules
    ├─ Build prompt: PromptBuilder.buildIntentPrompt(...)
    ├─ Check cache: Redis.get(ai_cache:hash)
    │     ├─ Cache hit → return cached response
    │     └─ Cache miss → continue
    ├─ Call AI: AIService.analyze(prompt)
    │     └─ Stream response via WebSocket
    ├─ Cache response: Redis.set(ai_cache:hash, response, TTL=300)
    └─ Return formatted suggestions
        │
        ▼
  Frontend receives streaming suggestions
  User accepts/skips each suggestion
        │
        ▼ (On accept)
  Frontend applies code change to Monaco
  POST /api/v1/projects/:id/decisions (record decision)
  PUT /api/v1/projects/:id/files/:fileId (save file)
```

### 6.2 Decision Memory Data Flow

```
Decision recorded (auto or manual)
        │
        ▼
  POST /api/v1/projects/:id/decisions
        │
        ▼
  Backend: DecisionManager.create()
    ├─ Save to MongoDB
    ├─ Update project stats: Project.updateOne({ $inc: { 'stats.totalDecisions': 1 } })
    ├─ Check pattern threshold:
    │     └─ If 5+ similar decisions exist → trigger PatternDetector
    └─ Return decision record
        │
        ▼
  PatternDetector (async, background job via BullMQ)
    ├─ Fetch all decisions for project
    ├─ Group by tags, type, and code patterns
    ├─ AI analyzes groups for recurring patterns
    ├─ Store detected patterns
    └─ Notify frontend via WebSocket: "New pattern detected"
```

---

## 7. Database Relationships Diagram

```
┌──────────┐     1:N     ┌──────────┐     1:N     ┌──────────┐
│          │─────────────▶│          │─────────────▶│          │
│  Users   │              │ Projects │              │  Files   │
│          │◀─────────────│          │◀─────────────│          │
└──────────┘              └──────────┘              └──────────┘
     │                         │                         
     │                         │ 1:N                    
     │                         ▼                        
     │                    ┌──────────┐                  
     │              1:N   │          │                  
     └───────────────────▶│Decisions │                  
                          │          │                  
                          └──────────┘                  
     │                         │                        
     │                         │ 1:N                    
     │                         ▼                        
     │                    ┌──────────┐                  
     │              1:N   │  Chat    │                  
     └───────────────────▶│ History  │                  
                          │          │                  
                          └──────────┘                  
                               │                        
                          ┌────┴────┐                   
                          │ Health  │                   
                          │Snapshots│                   
                          └─────────┘                   
                          ┌─────────┐                   
                          │ Review  │                   
                          │ Results │                   
                          └─────────┘                   
```

---

## 8. Data Retention Policy

| Collection | Retention | Cleanup Strategy |
|---|---|---|
| Users | Indefinite | Manual deletion by user |
| Projects | Indefinite | Manual deletion by user |
| Files | Tied to project lifecycle | Cascade delete with project |
| Decisions | Indefinite | Manual archive option |
| Chat Histories | 90 days | TTL index auto-cleanup |
| Health Snapshots | 90 days | TTL index auto-cleanup |
| Review Results | 30 days | TTL index auto-cleanup |
| Redis Cache | Per-key TTL | Auto-expiry |

---

## 9. Migration Strategy

For schema changes, use a migration framework or custom scripts:

```
migrations/
├── 001_initial_schema.js
├── 002_add_decision_tags.js
├── 003_add_health_recommendations.js
└── README.md
```

Each migration exports `up()` and `down()` functions for forward and rollback migrations.
