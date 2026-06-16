'use client';

import { useCallback, useRef } from 'react';
import Editor, { OnMount, OnChange } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useEditorStore } from '@/stores/editorStore';
import { useReviewStore } from '@/stores/reviewStore';
import { useHealthStore } from '@/stores/healthStore';
import { codenexusDarkTheme } from '@/themes/monacoThemes';
import { updateFileContent as saveFileToApi } from '@/services/fileApi';
import { runReview } from '@/services/reviewApi';
import { analyzeHealth } from '@/services/healthApi';
import { setMonacoEditor, setMonacoInstance } from '@/utils/monacoRef';
import { useMonacoReviewMarkers } from '@/hooks/useMonacoReviewMarkers';

export default function CodeEditor() {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoReviewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoHealthTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeFile = useEditorStore((s) => {
    const id = s.activeFileId;
    return s.openFiles.find((f) => f.id === id);
  });
  const updateFileContent = useEditorStore((s) => s.updateFileContent);
  const setCursorPosition = useEditorStore((s) => s.setCursorPosition);
  const setSelection = useEditorStore((s) => s.setSelection);

  // Activate review markers hook
  useMonacoReviewMarkers();

  const handleEditorDidMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;

    // Share Monaco refs globally for review markers and other hooks
    setMonacoEditor(editor);
    setMonacoInstance(monaco as any);

    // Register the CodeNexus dark theme
    monaco.editor.defineTheme('codenexus-dark', codenexusDarkTheme);
    monaco.editor.setTheme('codenexus-dark');

    // Track cursor position
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition({
        lineNumber: e.position.lineNumber,
        column: e.position.column,
      });
    });

    // Track selection
    editor.onDidChangeCursorSelection((e) => {
      const sel = e.selection;
      if (
        sel.startLineNumber === sel.endLineNumber &&
        sel.startColumn === sel.endColumn
      ) {
        setSelection(null);
      } else {
        setSelection({
          startLineNumber: sel.startLineNumber,
          startColumn: sel.startColumn,
          endLineNumber: sel.endLineNumber,
          endColumn: sel.endColumn,
        });
      }
    });

    // Keyboard shortcuts — Ctrl+S: save immediately
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, async () => {
      const state = useEditorStore.getState();
      const file = state.openFiles.find((f) => f.id === state.activeFileId);
      if (file && file.isDirty) {
        try {
          await saveFileToApi(file.id, file.content);
          state.markFileSaved(file.id);
        } catch (err) {
          console.error('Failed to save file:', err);
        }
      }
    });

    editor.focus();
  }, [setCursorPosition, setSelection]);

  const handleChange: OnChange = useCallback(
    (value) => {
      if (activeFile && value !== undefined) {
        updateFileContent(activeFile.id, value);

        // Debounced auto-save (500ms)
        if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        autoSaveTimerRef.current = setTimeout(async () => {
          try {
            await saveFileToApi(activeFile.id, value);
            useEditorStore.getState().markFileSaved(activeFile.id);

            // Auto-review after save (2s debounce)
            const reviewState = useReviewStore.getState();
            if (reviewState.autoReview && activeFile) {
              if (autoReviewTimerRef.current) clearTimeout(autoReviewTimerRef.current);
              autoReviewTimerRef.current = setTimeout(async () => {
                try {
                  const edState = useEditorStore.getState();
                  const file = edState.openFiles.find((f) => f.id === edState.activeFileId);
                  if (!file) return;
                  useReviewStore.getState().setReviewing(true);
                  const result = await runReview(file.content, file.language, file.path);
                  useReviewStore.getState().setIssues(result.issues, result.summary, result.id);
                } catch {
                  // Auto-review failure is silent
                }
              }, 2000);
            }

            // Auto-health refresh after save (3s debounce)
            if (autoHealthTimerRef.current) clearTimeout(autoHealthTimerRef.current);
            autoHealthTimerRef.current = setTimeout(async () => {
              try {
                const healthState = useHealthStore.getState();
                if (healthState.overallScore !== null) {
                  // Only refresh if already analyzed
                  const result = await analyzeHealth();
                  healthState.setHealth(result);
                }
              } catch {
                // Auto-health failure is silent
              }
            }, 3000);
          } catch (err) {
            console.error('Auto-save failed:', err);
          }
        }, 500);
      }
    },
    [activeFile, updateFileContent]
  );

  if (!activeFile) {
    return (
      <div className="code-editor-empty">
        <div className="code-editor-empty-inner">
          <div className="code-editor-logo">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="12" fill="var(--accent-primary)" opacity="0.15" />
              <path d="M16 20L24 28L32 20" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 16L24 24L32 16" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
            </svg>
          </div>
          <h2 className="code-editor-empty-title">CodeNexus</h2>
          <p className="code-editor-empty-subtitle">Open a file to start editing</p>
          <div className="code-editor-shortcuts">
            <div className="shortcut-row">
              <kbd>Ctrl+P</kbd>
              <span>Quick Open</span>
            </div>
            <div className="shortcut-row">
              <kbd>Ctrl+B</kbd>
              <span>Toggle Sidebar</span>
            </div>
            <div className="shortcut-row">
              <kbd>Ctrl+`</kbd>
              <span>Toggle Terminal</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="code-editor-wrapper">
      <Editor
        height="100%"
        language={activeFile.language}
        value={activeFile.content}
        theme="codenexus-dark"
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          fontSize: 14,
          lineHeight: 22,
          fontLigatures: true,
          lineNumbers: 'on',
          minimap: { enabled: true, maxColumn: 80, renderCharacters: false },
          scrollbar: {
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
            useShadows: false,
          },
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          wordWrap: 'on',
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          padding: { top: 12, bottom: 12 },
          renderLineHighlight: 'all',
          renderWhitespace: 'selection',
          tabSize: 2,
          suggest: {
            preview: true,
            showMethods: true,
            showFunctions: true,
            showConstructors: true,
          },
          parameterHints: { enabled: true },
          quickSuggestions: true,
          folding: true,
          foldingHighlight: true,
          showFoldingControls: 'mouseover',
          formatOnPaste: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoIndent: 'full',
          glyphMargin: true,
        }}
        loading={
          <div className="code-editor-loading">
            <div className="code-editor-spinner" />
            <span>Loading editor...</span>
          </div>
        }
      />
    </div>
  );
}
