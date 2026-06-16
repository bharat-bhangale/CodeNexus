/**
 * codeMetrics.ts — Individual metric calculators for Code Health.
 *
 * Each calculator takes a list of file objects { path, content, language }
 * and returns a metric result with a score (0-100) and details.
 */

// ─── Types ───
export interface SourceFile {
  path: string;
  content: string;
  language: string;
}

// ─── 1. Complexity ───
export function calculateComplexity(files: SourceFile[]) {
  const jsFiles = files.filter((f) =>
    ['javascript', 'typescript', 'jsx', 'tsx'].includes(f.language)
  );
  if (jsFiles.length === 0) {
    return {
      score: 100,
      details: { averageCyclomaticComplexity: 0, maxCyclomaticComplexity: 0, complexFunctions: [] },
    };
  }

  const allFunctions: { name: string; file: string; line: number; complexity: number }[] = [];

  for (const file of jsFiles) {
    const lines = file.content.split('\n');
    let currentFunc: string | null = null;
    let funcLine = 0;
    let complexity = 1; // Base complexity
    let braceDepth = 0;
    let inFunc = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detect function declarations
      const funcMatch = trimmed.match(
        /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\(?.*?\)?\s*=>/
      );
      if (funcMatch && !inFunc) {
        currentFunc = funcMatch[1] || funcMatch[2];
        funcLine = i + 1;
        complexity = 1;
        braceDepth = 0;
        inFunc = true;
      }

      if (inFunc) {
        // Count decision points
        const decisions = [
          /\bif\s*\(/.test(trimmed) ? 1 : 0,
          /\belse\s+if\s*\(/.test(trimmed) ? 1 : 0,
          /\bfor\s*\(/.test(trimmed) ? 1 : 0,
          /\bwhile\s*\(/.test(trimmed) ? 1 : 0,
          /\bswitch\s*\(/.test(trimmed) ? 1 : 0,
          /\bcase\s+/.test(trimmed) ? 1 : 0,
          /\bcatch\s*\(/.test(trimmed) ? 1 : 0,
          (trimmed.match(/&&/g) || []).length,
          (trimmed.match(/\|\|/g) || []).length,
          /\?[^?]/.test(trimmed) && /:/.test(trimmed) ? 1 : 0, // ternary
        ];
        complexity += decisions.reduce((a, b) => a + b, 0);

        // Track braces
        for (const ch of line) {
          if (ch === '{') braceDepth++;
          if (ch === '}') braceDepth--;
        }

        // Function ended
        if (braceDepth <= 0 && currentFunc && /\}/.test(line)) {
          allFunctions.push({ name: currentFunc, file: file.path, line: funcLine, complexity });
          currentFunc = null;
          inFunc = false;
        }
      }
    }
  }

  const avgComplexity =
    allFunctions.length > 0
      ? allFunctions.reduce((s, f) => s + f.complexity, 0) / allFunctions.length
      : 0;
  const maxComplexity =
    allFunctions.length > 0 ? Math.max(...allFunctions.map((f) => f.complexity)) : 0;

  // Score: lower complexity is better. avg <= 5 = 100, avg >= 25 = 0
  const score = Math.max(0, Math.min(100, Math.round(100 - ((avgComplexity - 2) / 23) * 100)));

  // Top complex functions
  const complexFunctions = allFunctions
    .filter((f) => f.complexity > 5)
    .sort((a, b) => b.complexity - a.complexity)
    .slice(0, 10);

  return {
    score,
    details: {
      averageCyclomaticComplexity: Math.round(avgComplexity * 10) / 10,
      maxCyclomaticComplexity: maxComplexity,
      complexFunctions,
    },
  };
}

// ─── 2. Duplication ───
export function calculateDuplication(files: SourceFile[]) {
  const codeFiles = files.filter((f) => f.content.trim().length > 0);
  if (codeFiles.length === 0) {
    return {
      score: 100,
      details: { duplicateBlocks: 0, duplicateLines: 0, totalLines: 0, percentage: 0, instances: [] },
    };
  }

  const BLOCK_SIZE = 4; // lines to compare
  const blockMap = new Map<string, { file: string; lineStart: number }[]>();
  let totalLines = 0;

  for (const file of codeFiles) {
    const lines = file.content.split('\n').map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith('//') && !l.startsWith('*'));
    totalLines += lines.length;

    for (let i = 0; i <= lines.length - BLOCK_SIZE; i++) {
      const block = lines.slice(i, i + BLOCK_SIZE).join('\n');
      if (block.length < 30) continue; // Skip trivial blocks

      const existing = blockMap.get(block) || [];
      existing.push({ file: file.path, lineStart: i + 1 });
      blockMap.set(block, existing);
    }
  }

  // Find duplicated blocks (appear in 2+ locations)
  const duplicateInstances: { files: string[]; lines: string; codeSnippet: string }[] = [];
  let duplicateLines = 0;
  let duplicateBlocks = 0;

  for (const [snippet, locations] of blockMap.entries()) {
    if (locations.length > 1) {
      duplicateBlocks++;
      duplicateLines += BLOCK_SIZE * (locations.length - 1);
      if (duplicateInstances.length < 5) {
        duplicateInstances.push({
          files: [...new Set(locations.map((l) => l.file))],
          lines: locations.map((l) => `${l.file}:${l.lineStart}`).join(', '),
          codeSnippet: snippet.slice(0, 200),
        });
      }
    }
  }

  const percentage = totalLines > 0 ? Math.round((duplicateLines / totalLines) * 100 * 10) / 10 : 0;
  // Score: 0% duplication = 100, >= 20% = 0
  const score = Math.max(0, Math.min(100, Math.round(100 - (percentage / 20) * 100)));

  return {
    score,
    details: { duplicateBlocks, duplicateLines, totalLines, percentage, instances: duplicateInstances },
  };
}

// ─── 3. Coverage Estimate ───
export function calculateCoverage(files: SourceFile[]) {
  const sourceFiles = files.filter(
    (f) =>
      ['javascript', 'typescript', 'jsx', 'tsx'].includes(f.language) &&
      !f.path.includes('.test.') &&
      !f.path.includes('.spec.') &&
      !f.path.includes('__tests__')
  );
  const testFiles = files.filter(
    (f) =>
      f.path.includes('.test.') ||
      f.path.includes('.spec.') ||
      f.path.includes('__tests__')
  );

  const testFileNames = new Set(
    testFiles.map((f) => {
      const base = f.path
        .replace(/\.test\.\w+$/, '')
        .replace(/\.spec\.\w+$/, '')
        .replace(/__tests__\//, '');
      return base;
    })
  );

  let filesWithTests = 0;
  for (const sf of sourceFiles) {
    const baseName = sf.path.replace(/\.\w+$/, '');
    if (testFileNames.has(baseName)) filesWithTests++;
  }

  const filesWithoutTests = sourceFiles.length - filesWithTests;
  const estimatedCoverage =
    sourceFiles.length > 0 ? Math.round((filesWithTests / sourceFiles.length) * 100) : 0;
  const score = estimatedCoverage;

  return {
    score,
    details: {
      estimatedCoverage,
      filesWithTests,
      filesWithoutTests,
      testFiles: testFiles.map((f) => f.path),
    },
  };
}

// ─── 4. Documentation ───
export function calculateDocumentation(files: SourceFile[]) {
  const jsFiles = files.filter((f) =>
    ['javascript', 'typescript', 'jsx', 'tsx'].includes(f.language)
  );
  if (jsFiles.length === 0) {
    return {
      score: 100,
      details: {
        documentedFunctions: 0,
        undocumentedFunctions: 0,
        totalFunctions: 0,
        percentage: 100,
        undocumentedList: [],
      },
    };
  }

  let documented = 0;
  let undocumented = 0;
  const undocumentedList: { name: string; file: string; line: number }[] = [];

  for (const file of jsFiles) {
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      const funcMatch = trimmed.match(
        /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(/
      );

      if (funcMatch) {
        const name = funcMatch[1] || funcMatch[2];
        // Check if preceding lines have JSDoc (/** ... */)
        let hasDoc = false;
        for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
          const prev = lines[j].trim();
          if (prev.endsWith('*/')) { hasDoc = true; break; }
          if (prev.startsWith('/**')) { hasDoc = true; break; }
          if (prev.startsWith('//')) continue;
          if (prev === '') continue;
          break;
        }

        if (hasDoc) {
          documented++;
        } else {
          undocumented++;
          if (undocumentedList.length < 15) {
            undocumentedList.push({ name, file: file.path, line: i + 1 });
          }
        }
      }
    }
  }

  const total = documented + undocumented;
  const percentage = total > 0 ? Math.round((documented / total) * 100) : 100;
  const score = percentage;

  return {
    score,
    details: {
      documentedFunctions: documented,
      undocumentedFunctions: undocumented,
      totalFunctions: total,
      percentage,
      undocumentedList,
    },
  };
}

// ─── 5. Dependencies ───
export function calculateDependencies(files: SourceFile[]) {
  const pkgFile = files.find((f) => f.path.endsWith('package.json'));
  if (!pkgFile) {
    return {
      score: 80, // No package.json = neutral
      details: { totalDependencies: 0, outdatedCount: 0, vulnerableCount: 0, unusedCount: 0 },
    };
  }

  try {
    const pkg = JSON.parse(pkgFile.content);
    const deps = Object.keys(pkg.dependencies || {});
    const devDeps = Object.keys(pkg.devDependencies || {});
    const totalDependencies = deps.length + devDeps.length;

    // Heuristic: check for known problematic packages
    const knownVulnerable = ['event-stream', 'ua-parser-js', 'coa', 'rc', 'colors'];
    const knownOutdated = ['request', 'moment', 'lodash.merge', 'node-uuid', 'coffee-script'];

    const allDeps = [...deps, ...devDeps];
    const vulnerableCount = allDeps.filter((d) => knownVulnerable.includes(d)).length;
    const outdatedCount = allDeps.filter((d) => knownOutdated.includes(d)).length;

    // Check for unused deps (heuristic: is the dep imported anywhere?)
    const allContent = files
      .filter((f) => f.path !== pkgFile.path)
      .map((f) => f.content)
      .join('\n');

    let unusedCount = 0;
    for (const dep of deps) {
      const importPattern = new RegExp(`['"]${dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"/]`);
      if (!importPattern.test(allContent)) unusedCount++;
    }

    // Score: penalize for issues
    const penalty =
      vulnerableCount * 15 + outdatedCount * 5 + Math.min(unusedCount, 5) * 3;
    const score = Math.max(0, Math.min(100, 100 - penalty));

    return { score, details: { totalDependencies, outdatedCount, vulnerableCount, unusedCount } };
  } catch {
    return {
      score: 50,
      details: { totalDependencies: 0, outdatedCount: 0, vulnerableCount: 0, unusedCount: 0 },
    };
  }
}

// ─── 6. Dead Code ───
export function calculateDeadCode(files: SourceFile[]) {
  const jsFiles = files.filter((f) =>
    ['javascript', 'typescript', 'jsx', 'tsx'].includes(f.language)
  );
  if (jsFiles.length === 0) {
    return {
      score: 100,
      details: { unusedExports: 0, unusedVariables: 0, unreachableCode: 0, instances: [] },
    };
  }

  // Collect all exported symbols
  const exports: { name: string; file: string; line: number }[] = [];
  for (const file of jsFiles) {
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      const exportMatch = trimmed.match(
        /export\s+(?:const|let|var|function|class|async\s+function)\s+(\w+)/
      );
      if (exportMatch) {
        exports.push({ name: exportMatch[1], file: file.path, line: i + 1 });
      }
    }
  }

  // Check which exports are imported somewhere
  const allContent = jsFiles.map((f) => f.content).join('\n');
  const unusedExportInstances: { type: string; name: string; file: string; line: number }[] = [];

  for (const exp of exports) {
    // Check if this symbol is imported by any other file
    const importPattern = new RegExp(`import[^;]*\\b${exp.name}\\b[^;]*from`);
    const usePattern = new RegExp(`\\b${exp.name}\\b`);

    // Count usage across all files except the defining file
    const otherContent = jsFiles
      .filter((f) => f.path !== exp.file)
      .map((f) => f.content)
      .join('\n');

    if (!importPattern.test(otherContent) && !usePattern.test(otherContent)) {
      unusedExportInstances.push({
        type: 'unused-export',
        name: exp.name,
        file: exp.file,
        line: exp.line,
      });
    }
  }

  // Detect unreachable code (return followed by code)
  let unreachableCode = 0;
  for (const file of jsFiles) {
    const lines = file.content.split('\n');
    for (let i = 0; i < lines.length - 1; i++) {
      if (/^\s*return\b/.test(lines[i]) && lines[i + 1].trim().length > 0 && !/^\s*[}\])]/g.test(lines[i + 1])) {
        unreachableCode++;
      }
    }
  }

  const unusedExports = unusedExportInstances.length;
  const totalSymbols = exports.length || 1;
  const deadPercent = (unusedExports + unreachableCode) / totalSymbols;
  const score = Math.max(0, Math.min(100, Math.round(100 - deadPercent * 100)));

  return {
    score,
    details: {
      unusedExports,
      unusedVariables: 0, // Would need full AST for this
      unreachableCode,
      instances: unusedExportInstances.slice(0, 10),
    },
  };
}
