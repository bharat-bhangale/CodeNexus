import { parse, type ParserOptions } from '@babel/parser';
import type { File as BabelFile } from '@babel/types';

const PARSER_PLUGINS: ParserOptions['plugins'] = [
  'jsx',
  'typescript',
  'decorators-legacy',
  'classProperties',
  'classPrivateProperties',
  'classPrivateMethods',
  'dynamicImport',
  'optionalChaining',
  'nullishCoalescingOperator',
  'exportDefaultFrom',
  'exportNamespaceFrom',
];

export interface ImportInfo {
  source: string;
  specifiers: string[];
  startLine: number;
  endLine: number;
}

export interface ExportInfo {
  name: string;
  type: 'default' | 'named';
  startLine: number;
}

export interface FunctionInfo {
  name: string;
  params: string[];
  startLine: number;
  endLine: number;
  calls: string[];
  isAsync: boolean;
  isArrow: boolean;
}

export interface ComponentInfo {
  name: string;
  props: string[];
  children: string[];
  startLine: number;
  endLine: number;
}

export function parseFile(content: string, language: string): BabelFile | null {
  const isTS = language === 'typescript' || language === 'typescriptreact';

  const plugins: ParserOptions['plugins'] = isTS
    ? PARSER_PLUGINS
    : PARSER_PLUGINS.filter((p) => p !== 'typescript');

  try {
    return parse(content, {
      sourceType: 'module',
      plugins,
      errorRecovery: true,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      allowSuperOutsideMethod: true,
    });
  } catch {
    return null;
  }
}

export function extractImports(ast: BabelFile): ImportInfo[] {
  const imports: ImportInfo[] = [];

  for (const node of ast.program.body) {
    if (node.type === 'ImportDeclaration') {
      const specifiers = node.specifiers.map((s) => {
        if (s.type === 'ImportDefaultSpecifier') return s.local.name;
        if (s.type === 'ImportNamespaceSpecifier') return `* as ${s.local.name}`;
        if (s.type === 'ImportSpecifier') {
          const imported =
            s.imported.type === 'Identifier' ? s.imported.name : s.imported.value;
          return imported === s.local.name ? imported : `${imported} as ${s.local.name}`;
        }
        return s.local.name;
      });

      imports.push({
        source: node.source.value,
        specifiers,
        startLine: node.loc?.start.line ?? 0,
        endLine: node.loc?.end.line ?? 0,
      });
    }
  }

  return imports;
}

export function extractExports(ast: BabelFile): ExportInfo[] {
  const exports: ExportInfo[] = [];

  for (const node of ast.program.body) {
    if (node.type === 'ExportDefaultDeclaration') {
      let name = 'default';
      const decl = node.declaration;
      if (decl.type === 'Identifier') name = decl.name;
      else if (
        (decl.type === 'FunctionDeclaration' || decl.type === 'ClassDeclaration') &&
        decl.id
      )
        name = decl.id.name;

      exports.push({ name, type: 'default', startLine: node.loc?.start.line ?? 0 });
    }

    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration) {
        const decl = node.declaration;
        if (
          decl.type === 'FunctionDeclaration' ||
          decl.type === 'ClassDeclaration'
        ) {
          if (decl.id) {
            exports.push({ name: decl.id.name, type: 'named', startLine: node.loc?.start.line ?? 0 });
          }
        } else if (decl.type === 'VariableDeclaration') {
          for (const d of decl.declarations) {
            if (d.id.type === 'Identifier') {
              exports.push({ name: d.id.name, type: 'named', startLine: node.loc?.start.line ?? 0 });
            }
          }
        }
      }

      for (const spec of node.specifiers) {
        const exportedName =
          spec.exported.type === 'Identifier' ? spec.exported.name : spec.exported.value;
        exports.push({ name: exportedName, type: 'named', startLine: node.loc?.start.line ?? 0 });
      }
    }
  }

  return exports;
}

export function extractFunctions(ast: BabelFile): FunctionInfo[] {
  const functions: FunctionInfo[] = [];

  function getParamName(param: any): string {
    if (param.type === 'Identifier') return param.name;
    if (param.type === 'AssignmentPattern' && param.left?.type === 'Identifier')
      return param.left.name;
    if (param.type === 'ObjectPattern') return '{...}';
    if (param.type === 'ArrayPattern') return '[...]';
    if (param.type === 'RestElement') return `...${getParamName(param.argument)}`;
    return '?';
  }

  function collectCalls(node: any): string[] {
    const calls: string[] = [];
    const visited = new Set<any>();

    function walk(n: any) {
      if (!n || typeof n !== 'object' || visited.has(n)) return;
      visited.add(n);

      if (n.type === 'CallExpression') {
        if (n.callee?.type === 'Identifier') {
          calls.push(n.callee.name);
        } else if (n.callee?.type === 'MemberExpression') {
          const obj = n.callee.object;
          const prop = n.callee.property;
          if (obj?.type === 'Identifier' && prop?.type === 'Identifier') {
            calls.push(`${obj.name}.${prop.name}`);
          }
        }
      }

      for (const key of Object.keys(n)) {
        if (key === 'type' || key === 'loc' || key === 'start' || key === 'end') continue;
        const child = n[key];
        if (Array.isArray(child)) {
          for (const item of child) walk(item);
        } else if (child && typeof child === 'object' && child.type) {
          walk(child);
        }
      }
    }

    walk(node.body);
    return [...new Set(calls)];
  }

  for (const node of ast.program.body) {
    // Regular function declarations
    if (node.type === 'FunctionDeclaration' && node.id) {
      functions.push({
        name: node.id.name,
        params: node.params.map(getParamName),
        startLine: node.loc?.start.line ?? 0,
        endLine: node.loc?.end.line ?? 0,
        calls: collectCalls(node),
        isAsync: node.async ?? false,
        isArrow: false,
      });
    }

    // export default function
    if (node.type === 'ExportDefaultDeclaration' && node.declaration.type === 'FunctionDeclaration') {
      const decl = node.declaration;
      functions.push({
        name: decl.id?.name ?? 'default',
        params: decl.params.map(getParamName),
        startLine: node.loc?.start.line ?? 0,
        endLine: node.loc?.end.line ?? 0,
        calls: collectCalls(decl),
        isAsync: decl.async ?? false,
        isArrow: false,
      });
    }

    // export named function
    if (node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'FunctionDeclaration') {
      const decl = node.declaration;
      if (decl.id) {
        functions.push({
          name: decl.id.name,
          params: decl.params.map(getParamName),
          startLine: node.loc?.start.line ?? 0,
          endLine: node.loc?.end.line ?? 0,
          calls: collectCalls(decl),
          isAsync: decl.async ?? false,
          isArrow: false,
        });
      }
    }

    // Variable declarations with arrow functions / function expressions
    if (node.type === 'VariableDeclaration' || (node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'VariableDeclaration')) {
      const decl = node.type === 'ExportNamedDeclaration' ? node.declaration! : node;
      if (decl.type === 'VariableDeclaration') {
        for (const d of decl.declarations) {
          if (
            d.id.type === 'Identifier' &&
            d.init &&
            (d.init.type === 'ArrowFunctionExpression' || d.init.type === 'FunctionExpression')
          ) {
            functions.push({
              name: d.id.name,
              params: d.init.params.map(getParamName),
              startLine: node.loc?.start.line ?? 0,
              endLine: node.loc?.end.line ?? 0,
              calls: collectCalls(d.init),
              isAsync: d.init.async ?? false,
              isArrow: d.init.type === 'ArrowFunctionExpression',
            });
          }
        }
      }
    }
  }

  return functions;
}

export function extractComponents(ast: BabelFile): ComponentInfo[] {
  const components: ComponentInfo[] = [];
  const functions = extractFunctions(ast);

  // A function is considered a React component if:
  // 1. Its name starts with an uppercase letter
  // 2. It contains JSX (returns JSX elements)
  function containsJSX(node: any, visited = new Set<any>()): boolean {
    if (!node || typeof node !== 'object' || visited.has(node)) return false;
    visited.add(node);

    if (node.type === 'JSXElement' || node.type === 'JSXFragment') return true;

    for (const key of Object.keys(node)) {
      if (key === 'type' || key === 'loc') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          if (containsJSX(item, visited)) return true;
        }
      } else if (child && typeof child === 'object' && child.type) {
        if (containsJSX(child, visited)) return true;
      }
    }
    return false;
  }

  function extractJSXChildren(node: any, visited = new Set<any>()): string[] {
    const children: string[] = [];
    if (!node || typeof node !== 'object' || visited.has(node)) return children;
    visited.add(node);

    if (node.type === 'JSXElement' && node.openingElement?.name) {
      const nameNode = node.openingElement.name;
      if (nameNode.type === 'JSXIdentifier' && /^[A-Z]/.test(nameNode.name)) {
        children.push(nameNode.name);
      }
    }

    for (const key of Object.keys(node)) {
      if (key === 'type' || key === 'loc') continue;
      const child = node[key];
      if (Array.isArray(child)) {
        for (const item of child) {
          children.push(...extractJSXChildren(item, visited));
        }
      } else if (child && typeof child === 'object' && child.type) {
        children.push(...extractJSXChildren(child, visited));
      }
    }

    return [...new Set(children)];
  }

  function extractProps(node: any): string[] {
    const params = node.params || [];
    if (params.length === 0) return [];
    const firstParam = params[0];
    if (firstParam.type === 'ObjectPattern') {
      return firstParam.properties
        .filter((p: any) => p.type === 'ObjectProperty' && p.key?.type === 'Identifier')
        .map((p: any) => p.key.name);
    }
    if (firstParam.type === 'Identifier') return [firstParam.name];
    return [];
  }

  for (const node of ast.program.body) {
    // Function declarations
    if (node.type === 'FunctionDeclaration' && node.id && /^[A-Z]/.test(node.id.name)) {
      if (containsJSX(node.body)) {
        components.push({
          name: node.id.name,
          props: extractProps(node),
          children: extractJSXChildren(node.body),
          startLine: node.loc?.start.line ?? 0,
          endLine: node.loc?.end.line ?? 0,
        });
      }
    }

    // export default function Component
    if (
      node.type === 'ExportDefaultDeclaration' &&
      node.declaration.type === 'FunctionDeclaration' &&
      node.declaration.id &&
      /^[A-Z]/.test(node.declaration.id.name)
    ) {
      const decl = node.declaration;
      if (containsJSX(decl.body)) {
        components.push({
          name: decl.id!.name,
          props: extractProps(decl),
          children: extractJSXChildren(decl.body),
          startLine: node.loc?.start.line ?? 0,
          endLine: node.loc?.end.line ?? 0,
        });
      }
    }

    // const Component = () => { ... }
    const varDecl =
      node.type === 'VariableDeclaration'
        ? node
        : node.type === 'ExportNamedDeclaration' && node.declaration?.type === 'VariableDeclaration'
          ? node.declaration
          : null;

    if (varDecl && varDecl.type === 'VariableDeclaration') {
      for (const d of varDecl.declarations) {
        if (
          d.id.type === 'Identifier' &&
          /^[A-Z]/.test(d.id.name) &&
          d.init &&
          (d.init.type === 'ArrowFunctionExpression' || d.init.type === 'FunctionExpression')
        ) {
          const body = d.init.body;
          if (containsJSX(body)) {
            components.push({
              name: d.id.name,
              props: extractProps(d.init),
              children: extractJSXChildren(body),
              startLine: node.loc?.start.line ?? 0,
              endLine: node.loc?.end.line ?? 0,
            });
          }
        }
      }
    }
  }

  return components;
}
