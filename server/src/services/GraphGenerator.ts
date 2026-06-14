import dagre from 'dagre';
import {
  parseFile,
  extractImports,
  extractExports,
  extractFunctions,
  extractComponents,
  type ImportInfo,
  type FunctionInfo,
  type ComponentInfo,
} from './CodeAnalyzer.js';

export interface GraphNode {
  id: string;
  label: string;
  type: 'file' | 'function' | 'component' | 'variable';
  language?: string;
  path?: string;
  startLine?: number;
  endLine?: number;
  metadata?: Record<string, any>;
  position: { x: number; y: number };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'import' | 'call' | 'render' | 'data';
  animated?: boolean;
}

export interface GraphResult {
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary: string;
  metadata: {
    type: string;
    fileCount?: number;
    edgeCount?: number;
    generatedAt: string;
  };
}

interface FileInput {
  path: string;
  content: string;
  language: string;
}

function layoutGraph(
  nodes: Omit<GraphNode, 'position'>[],
  edges: GraphEdge[],
  direction: 'TB' | 'LR' = 'TB'
): GraphNode[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: direction, nodesep: 60, ranksep: 80, marginx: 30, marginy: 30 });

  for (const node of nodes) {
    g.setNode(node.id, { width: 180, height: 60 });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: {
        x: (pos?.x ?? 0) - 90,
        y: (pos?.y ?? 0) - 30,
      },
    };
  });
}

function detectLanguage(filePath: string): string {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  const map: Record<string, string> = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'typescript',
    '.tsx': 'typescript',
    '.css': 'css',
    '.json': 'json',
    '.md': 'markdown',
    '.html': 'html',
  };
  return map[ext] || 'plaintext';
}

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_');
}

// ─── Dependency Graph ───

export function generateDependencyGraph(files: FileInput[]): GraphResult {
  const nodeMap = new Map<string, Omit<GraphNode, 'position'>>();
  const edges: GraphEdge[] = [];
  const filePathSet = new Set(files.map((f) => f.path));

  // Create nodes for each file
  for (const file of files) {
    if (file.language === 'plaintext' && !file.path.endsWith('.env')) continue;

    const id = sanitizeId(file.path);
    nodeMap.set(file.path, {
      id,
      label: file.path.split('/').pop() || file.path,
      type: 'file',
      language: detectLanguage(file.path),
      path: file.path,
      metadata: { fullPath: file.path },
    });
  }

  // Parse each file and extract import relationships
  for (const file of files) {
    const ast = parseFile(file.content, file.language);
    if (!ast) continue;

    const imports = extractImports(ast);
    const sourceId = sanitizeId(file.path);

    for (const imp of imports) {
      // Resolve relative imports to project files
      const resolved = resolveImportPath(file.path, imp.source, filePathSet);
      if (!resolved) continue;

      const targetId = sanitizeId(resolved);
      if (!nodeMap.has(resolved)) continue;

      edges.push({
        id: `${sourceId}->${targetId}`,
        source: sourceId,
        target: targetId,
        label: imp.specifiers.length <= 2 ? imp.specifiers.join(', ') : `${imp.specifiers.length} imports`,
        type: 'import',
        animated: true,
      });
    }
  }

  const nodes = layoutGraph([...nodeMap.values()], edges, 'TB');

  const summary = `Dependency graph showing ${nodes.length} files with ${edges.length} import relationships. ` +
    `${edges.length === 0 ? 'No import connections found.' : `The most connected files form the core architecture.`}`;

  return {
    nodes,
    edges,
    summary,
    metadata: {
      type: 'dependency_graph',
      fileCount: nodes.length,
      edgeCount: edges.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

// ─── Call Graph ───

export function generateCallGraph(file: FileInput, functionName?: string): GraphResult {
  const ast = parseFile(file.content, file.language);
  if (!ast) {
    return emptyResult('call_graph', 'Could not parse file.');
  }

  const functions = extractFunctions(ast);
  const functionNames = new Set(functions.map((f) => f.name));
  const nodeMap = new Map<string, Omit<GraphNode, 'position'>>();
  const edges: GraphEdge[] = [];

  // If a specific function is targeted, start from there. Otherwise show all.
  const targetFunctions = functionName
    ? functions.filter((f) => f.name === functionName)
    : functions;

  for (const fn of targetFunctions) {
    const fnId = sanitizeId(fn.name);
    if (!nodeMap.has(fn.name)) {
      nodeMap.set(fn.name, {
        id: fnId,
        label: fn.name,
        type: 'function',
        path: file.path,
        startLine: fn.startLine,
        endLine: fn.endLine,
        metadata: {
          params: fn.params,
          isAsync: fn.isAsync,
          isArrow: fn.isArrow,
          callCount: fn.calls.length,
        },
      });
    }

    for (const call of fn.calls) {
      const callBase = call.split('.')[0];
      const callId = sanitizeId(call);

      if (!nodeMap.has(call)) {
        const calledFn = functions.find((f) => f.name === callBase);
        nodeMap.set(call, {
          id: callId,
          label: call,
          type: functionNames.has(callBase) ? 'function' : 'function',
          path: file.path,
          startLine: calledFn?.startLine,
          endLine: calledFn?.endLine,
          metadata: {
            isExternal: !functionNames.has(callBase),
            params: calledFn?.params,
          },
        });
      }

      edges.push({
        id: `${fnId}->${callId}`,
        source: fnId,
        target: callId,
        label: 'calls',
        type: 'call',
        animated: true,
      });
    }
  }

  const nodes = layoutGraph([...nodeMap.values()], edges, 'TB');

  const summary = `Call graph for ${file.path.split('/').pop()} showing ${nodes.length} functions with ${edges.length} call relationships.` +
    (functionName ? ` Starting from function "${functionName}".` : '');

  return {
    nodes,
    edges,
    summary,
    metadata: {
      type: 'call_graph',
      fileCount: 1,
      edgeCount: edges.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

// ─── Component Tree ───

export function generateComponentTree(files: FileInput[]): GraphResult {
  const nodeMap = new Map<string, Omit<GraphNode, 'position'>>();
  const edges: GraphEdge[] = [];
  const componentFileMap = new Map<string, string>(); // componentName -> filePath

  // First pass: find all components
  for (const file of files) {
    const ast = parseFile(file.content, file.language);
    if (!ast) continue;

    const comps = extractComponents(ast);
    for (const comp of comps) {
      const compId = sanitizeId(`${file.path}:${comp.name}`);
      componentFileMap.set(comp.name, file.path);

      nodeMap.set(comp.name, {
        id: compId,
        label: comp.name,
        type: 'component',
        language: detectLanguage(file.path),
        path: file.path,
        startLine: comp.startLine,
        endLine: comp.endLine,
        metadata: {
          props: comp.props,
          children: comp.children,
          fileName: file.path.split('/').pop(),
        },
      });
    }
  }

  // Second pass: build parent-child edges based on JSX usage
  for (const file of files) {
    const ast = parseFile(file.content, file.language);
    if (!ast) continue;

    const comps = extractComponents(ast);
    for (const comp of comps) {
      const parentId = sanitizeId(`${file.path}:${comp.name}`);

      for (const childName of comp.children) {
        const childFilePath = componentFileMap.get(childName);
        if (!childFilePath) continue;

        const childId = sanitizeId(`${childFilePath}:${childName}`);
        if (parentId === childId) continue;

        edges.push({
          id: `${parentId}->${childId}`,
          source: parentId,
          target: childId,
          label: 'renders',
          type: 'render',
          animated: true,
        });
      }
    }
  }

  const nodes = layoutGraph([...nodeMap.values()], edges, 'TB');

  const summary = `Component tree with ${nodes.length} React components and ${edges.length} parent-child relationships.`;

  return {
    nodes,
    edges,
    summary,
    metadata: {
      type: 'component_tree',
      fileCount: files.length,
      edgeCount: edges.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

// ─── Data Flow ───

export function generateDataFlow(file: FileInput, variableName?: string): GraphResult {
  const ast = parseFile(file.content, file.language);
  if (!ast) {
    return emptyResult('data_flow', 'Could not parse file.');
  }

  const nodeMap = new Map<string, Omit<GraphNode, 'position'>>();
  const edges: GraphEdge[] = [];

  const imports = extractImports(ast);
  const functions = extractFunctions(ast);
  const exports = extractExports(ast);

  // Track import nodes
  for (const imp of imports) {
    for (const spec of imp.specifiers) {
      const cleanSpec = spec.replace(/\* as /, '').split(' as ').pop() || spec;
      if (variableName && cleanSpec !== variableName) continue;

      const nodeId = sanitizeId(`import-${cleanSpec}`);
      nodeMap.set(`import-${cleanSpec}`, {
        id: nodeId,
        label: `import ${cleanSpec}`,
        type: 'variable',
        path: file.path,
        startLine: imp.startLine,
        metadata: { source: imp.source, kind: 'import' },
      });
    }
  }

  // Track function usage of variables
  for (const fn of functions) {
    const fnId = sanitizeId(`fn-${fn.name}`);
    nodeMap.set(`fn-${fn.name}`, {
      id: fnId,
      label: fn.name,
      type: 'function',
      path: file.path,
      startLine: fn.startLine,
      endLine: fn.endLine,
      metadata: { kind: 'function' },
    });

    // Connect imports used in this function's calls
    for (const call of fn.calls) {
      const callBase = call.split('.')[0];
      const importNode = nodeMap.get(`import-${callBase}`);
      if (importNode) {
        edges.push({
          id: `${importNode.id}->${fnId}`,
          source: importNode.id,
          target: fnId,
          label: 'used by',
          type: 'data',
          animated: true,
        });
      }
    }
  }

  // Track exports
  for (const exp of exports) {
    if (variableName && exp.name !== variableName) continue;

    const expId = sanitizeId(`export-${exp.name}`);
    nodeMap.set(`export-${exp.name}`, {
      id: expId,
      label: `export ${exp.name}`,
      type: 'variable',
      path: file.path,
      startLine: exp.startLine,
      metadata: { kind: 'export', exportType: exp.type },
    });

    // Connect function to its export
    const fnNode = nodeMap.get(`fn-${exp.name}`);
    if (fnNode) {
      edges.push({
        id: `${fnNode.id}->${expId}`,
        source: fnNode.id,
        target: expId,
        label: exp.type === 'default' ? 'default export' : 'named export',
        type: 'data',
        animated: true,
      });
    }
  }

  const nodes = layoutGraph([...nodeMap.values()], edges, 'LR');

  const summary = `Data flow analysis of ${file.path.split('/').pop()} showing ${nodes.length} data points with ${edges.length} flow connections.` +
    (variableName ? ` Tracking variable "${variableName}".` : '');

  return {
    nodes,
    edges,
    summary,
    metadata: {
      type: 'data_flow',
      fileCount: 1,
      edgeCount: edges.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

// ─── Helpers ───

function resolveImportPath(
  currentFile: string,
  importSource: string,
  knownPaths: Set<string>
): string | null {
  // Skip external packages
  if (!importSource.startsWith('.') && !importSource.startsWith('/')) {
    return null;
  }

  const currentDir = currentFile.split('/').slice(0, -1).join('/') || '/';
  let resolved: string;

  if (importSource.startsWith('./') || importSource.startsWith('../')) {
    const parts = `${currentDir}/${importSource}`.split('/');
    const normalized: string[] = [];
    for (const part of parts) {
      if (part === '.' || part === '') continue;
      if (part === '..') {
        normalized.pop();
        continue;
      }
      normalized.push(part);
    }
    resolved = '/' + normalized.join('/');
  } else {
    resolved = importSource;
  }

  // Try exact match first, then with extensions
  if (knownPaths.has(resolved)) return resolved;

  const extensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css'];
  for (const ext of extensions) {
    if (knownPaths.has(resolved + ext)) return resolved + ext;
  }

  // Try index files
  for (const ext of extensions) {
    if (knownPaths.has(`${resolved}/index${ext}`)) return `${resolved}/index${ext}`;
  }

  return null;
}

function emptyResult(type: string, summary: string): GraphResult {
  return {
    nodes: [],
    edges: [],
    summary,
    metadata: { type, fileCount: 0, edgeCount: 0, generatedAt: new Date().toISOString() },
  };
}
