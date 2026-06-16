// Shared Monaco editor and instance references for cross-component access.
// The CodeEditor component sets these on mount; other components read them.

import type { editor } from 'monaco-editor';

let _editor: editor.IStandaloneCodeEditor | null = null;
let _monaco: typeof import('monaco-editor') | null = null;

export function setMonacoEditor(editorInstance: editor.IStandaloneCodeEditor) {
  _editor = editorInstance;
}

export function setMonacoInstance(monacoInstance: typeof import('monaco-editor')) {
  _monaco = monacoInstance;
}

export function getMonacoEditor(): editor.IStandaloneCodeEditor | null {
  return _editor;
}

export function getMonacoInstance(): typeof import('monaco-editor') | null {
  return _monaco;
}
