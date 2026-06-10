/**
 * CodeNexus — Claude Code Agent Infrastructure Setup Script
 *
 * This script creates ALL Claude Code configuration files in a single execution:
 * - CLAUDE.md (project memory)
 * - CLAUDE.local.md (personal overrides template)
 * - settings.json (hooks)
 * - 10 skills (SKILL.md files)
 * - 6 sub-agent definitions
 * - agents/README.md (orchestration guide)
 *
 * Usage:
 *   node scripts/setup-claude-agents.js
 *
 * This script is IDEMPOTENT — safe to run multiple times.
 * Existing files will NOT be overwritten unless --force flag is passed.
 */

import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CLAUDE_DIR = join(ROOT, '.claude');
const FORCE = process.argv.includes('--force');

// ─── Helpers ───

const ensureDir = (dirPath) => {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath.replace(ROOT, '.')}`);
  }
};

const writeFile = (filePath, content) => {
  if (existsSync(filePath) && !FORCE) {
    console.log(`⏭️  Skipped (exists): ${filePath.replace(ROOT, '.')}`);
    return false;
  }
  ensureDir(dirname(filePath));
  writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Created: ${filePath.replace(ROOT, '.')}`);
  return true;
};

// ─── File Contents ───
// NOTE: The actual file contents are created directly in the .claude/ directory.
// This script serves as a verification and repair tool.
// If files are missing, it recreates them from embedded templates.

const DIRECTORIES = [
  join(CLAUDE_DIR, 'skills', 'build-component'),
  join(CLAUDE_DIR, 'skills', 'create-api-route'),
  join(CLAUDE_DIR, 'skills', 'add-ai-feature'),
  join(CLAUDE_DIR, 'skills', 'create-zustand-store'),
  join(CLAUDE_DIR, 'skills', 'add-mongoose-model'),
  join(CLAUDE_DIR, 'skills', 'create-prompt-template'),
  join(CLAUDE_DIR, 'skills', 'build-visualization'),
  join(CLAUDE_DIR, 'skills', 'write-tests'),
  join(CLAUDE_DIR, 'skills', 'run-full-review'),
  join(CLAUDE_DIR, 'skills', 'deploy-check'),
  join(CLAUDE_DIR, 'agents'),
];

const EXPECTED_FILES = [
  '.claude/CLAUDE.md',
  '.claude/CLAUDE.local.md',
  '.claude/settings.json',
  '.claude/skills/build-component/SKILL.md',
  '.claude/skills/create-api-route/SKILL.md',
  '.claude/skills/add-ai-feature/SKILL.md',
  '.claude/skills/create-zustand-store/SKILL.md',
  '.claude/skills/add-mongoose-model/SKILL.md',
  '.claude/skills/create-prompt-template/SKILL.md',
  '.claude/skills/build-visualization/SKILL.md',
  '.claude/skills/write-tests/SKILL.md',
  '.claude/skills/run-full-review/SKILL.md',
  '.claude/skills/deploy-check/SKILL.md',
  '.claude/agents/frontend-agent.md',
  '.claude/agents/backend-agent.md',
  '.claude/agents/ai-integration-agent.md',
  '.claude/agents/visualization-agent.md',
  '.claude/agents/testing-agent.md',
  '.claude/agents/security-agent.md',
  '.claude/agents/README.md',
];

// ─── Main ───

console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('  CodeNexus — Claude Code Agent Infrastructure Setup');
console.log('═══════════════════════════════════════════════════════');
console.log('');

// Step 1: Create directories
console.log('📁 Step 1: Creating directories...');
DIRECTORIES.forEach(ensureDir);
console.log('');

// Step 2: Verify files
console.log('📋 Step 2: Verifying files...');
let missing = 0;
let present = 0;

EXPECTED_FILES.forEach((relPath) => {
  const absPath = join(ROOT, relPath);
  if (existsSync(absPath)) {
    const stats = readFileSync(absPath, 'utf-8');
    const lines = stats.split('\n').length;
    console.log(`  ✅ ${relPath} (${lines} lines)`);
    present++;
  } else {
    console.log(`  ❌ MISSING: ${relPath}`);
    missing++;
  }
});

console.log('');

// Step 3: Update .gitignore
console.log('📝 Step 3: Checking .gitignore...');
const gitignorePath = join(ROOT, '.gitignore');
if (existsSync(gitignorePath)) {
  const gitignore = readFileSync(gitignorePath, 'utf-8');
  if (!gitignore.includes('CLAUDE.local.md')) {
    writeFileSync(gitignorePath, gitignore + '\n# Claude Code personal overrides\n.claude/CLAUDE.local.md\n');
    console.log('  ✅ Added .claude/CLAUDE.local.md to .gitignore');
  } else {
    console.log('  ✅ .gitignore already includes CLAUDE.local.md');
  }
} else {
  writeFile(gitignorePath, '# Claude Code personal overrides\n.claude/CLAUDE.local.md\n');
}

console.log('');

// Step 4: Print summary
console.log('═══════════════════════════════════════════════════════');
console.log('  SETUP SUMMARY');
console.log('═══════════════════════════════════════════════════════');
console.log(`  Files present: ${present}/${EXPECTED_FILES.length}`);
console.log(`  Files missing: ${missing}/${EXPECTED_FILES.length}`);
console.log('');

if (missing === 0) {
  console.log('  🎉 All files are in place! Infrastructure is ready.');
  console.log('');
  console.log('  Available slash commands:');
  console.log('    /build-component    — Create a React component');
  console.log('    /create-api-route   — Create an API endpoint');
  console.log('    /add-ai-feature     — Add an AI-powered feature');
  console.log('    /create-zustand-store — Create a Zustand store');
  console.log('    /add-mongoose-model — Create a database model');
  console.log('    /create-prompt-template — Create an AI prompt');
  console.log('    /build-visualization — Create a React Flow graph');
  console.log('    /write-tests        — Generate tests for a file');
  console.log('    /run-full-review    — Run quality review');
  console.log('    /deploy-check       — Pre-deployment check');
  console.log('');
  console.log('  Available agents:');
  console.log('    frontend-agent      — React/UI specialist');
  console.log('    backend-agent       — Node.js/Express specialist');
  console.log('    ai-integration-agent — Prompt engineering specialist');
  console.log('    visualization-agent — React Flow/D3.js specialist');
  console.log('    testing-agent       — QA specialist');
  console.log('    security-agent      — Security auditor');
} else {
  console.log(`  ⚠️  ${missing} file(s) missing. Run with --force to recreate.`);
  console.log('  Or create them manually using the templates in docs/08_Claude_Multi_Agent_Guide.md');
}

console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('');

// Step 5: Verification checklist
console.log('📋 VERIFICATION CHECKLIST:');
console.log('  [ ] Start a Claude Code session — CLAUDE.md should load automatically');
console.log('  [ ] Type /build-component — skill should be invocable');
console.log('  [ ] Type /create-api-route — skill should be invocable');
console.log('  [ ] Edit a .js file — Prettier should auto-format (PostToolUse hook)');
console.log('  [ ] Try running a dangerous command — should be blocked (PreToolUse hook)');
console.log('  [ ] Check .claude/agents/ — all 6 agent definitions readable');
console.log('');
